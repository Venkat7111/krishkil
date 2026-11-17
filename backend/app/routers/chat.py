"""
AI Chat Router — Powered by RAG (Retrieval-Augmented Generation) & Multilingual Gemini AI
with Rule-Based Agronomic Engine & PDF Package of Practices Exporter.
Supports English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்),
Kannada (ಕನ್ನಡ), Marathi (मराठी), and Bengali (বাংলা).
"""
import io
import json
import urllib.request
import urllib.error
import logging
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional

from app.config import GEMINI_API_KEY
from app.rag import retrieve_rag_context, rag_engine, AGRICULTURAL_KNOWLEDGE_BASE

logger = logging.getLogger("krishisahay.chat")
router = APIRouter(prefix="/chat", tags=["chat"])

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English"},
    "te": {"name": "Telugu", "native": "తెలుగు"},
    "hi": {"name": "Hindi", "native": "हिन्दी"},
    "ta": {"name": "Tamil", "native": "தமிழ்"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ"},
    "mr": {"name": "Marathi", "native": "मराठी"},
    "bn": {"name": "Bengali", "native": "বাংলা"},
}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatAskRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    history: Optional[List[ChatMessage]] = []
    crop_filter: Optional[str] = None


class ChatAskResponse(BaseModel):
    reply: str
    language: str = "en"
    rag_used: bool = True
    sources: Optional[List[str]] = []


class RAGSearchRequest(BaseModel):
    query: str
    crop: Optional[str] = None


def detect_script_language(text: str) -> Optional[str]:
    """Detects Indian language scripts from Unicode code points."""
    if not text:
        return None
    for char in text:
        cp = ord(char)
        if 0x0C00 <= cp <= 0x0C7F:
            return "te"  # Telugu
        if 0x0900 <= cp <= 0x097F:
            return "hi"  # Devanagari (Hindi/Marathi)
        if 0x0B80 <= cp <= 0x0BFF:
            return "ta"  # Tamil
        if 0x0C80 <= cp <= 0x0CFF:
            return "kn"  # Kannada
        if 0x0980 <= cp <= 0x09FF:
            return "bn"  # Bengali
    return None


def generate_with_gemini_rag(user_msg: str, rag_context: str, target_lang: str = "en") -> Optional[str]:
    if not GEMINI_API_KEY:
        return None

    lang_info = SUPPORTED_LANGUAGES.get(target_lang, SUPPORTED_LANGUAGES["en"])
    lang_name = lang_info["name"]
    lang_native = lang_info["native"]

    # -----------------------------------------------------------------------
    # Build the system instruction – language rule is FIRST so Gemini cannot
    # ignore it even when RAG context is English.
    # -----------------------------------------------------------------------
    if target_lang != "en":
        system_instruction_text = (
            f"LANGUAGE RULE — HIGHEST PRIORITY:\n"
            f"You MUST reply ONLY in {lang_name} ({lang_native}).\n"
            f"Every single word of your answer must be in {lang_name} ({lang_native}).\n"
            f"Do NOT use English in your reply, not even partially.\n"
            f"Translate all technical terms (fertilizer names, pesticide doses, crop names) into natural {lang_name} ({lang_native}).\n"
            f"If you reply in any other language, you have failed your task.\n\n"
            f"You are KrishiSahay AI, an expert Indian agronomist and farming advisor. "
            f"Use the retrieved Package of Practices (PoP) knowledge below to give precise, practical farming advice. "
            f"Keep answers encouraging and concise (max 3 short paragraphs)."
        )
    else:
        system_instruction_text = (
            "You are KrishiSahay AI, an expert Indian agronomist and farming advisor powered by an authoritative "
            "Agricultural Package of Practices (PoP) RAG knowledge database.\n"
            "Use the retrieved field-proven context below to answer the farmer's question with precise NPK fertilizer dosages, "
            "chemical/organic pesticide recommendations, crop disease treatments, or market price guidance.\n"
            "Keep answers encouraging, practical, clear, and direct (max 3 short paragraphs)."
        )

    user_turn_text = (
        f"--- RETRIEVED AGRONOMIC RAG CONTEXT ---\n{rag_context}\n--------------------------------------\n\n"
        f"Farmer Question: {user_msg}"
    )

    # Use Gemini's proper systemInstruction field (supported in v1beta for 1.5+)
    # and also repeat the language rule inside the user turn as a reinforcement.
    if target_lang != "en":
        user_turn_text = (
            f"[REMINDER: Reply ONLY in {lang_name} ({lang_native}). No English allowed.]\n\n"
            + user_turn_text
        )

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction_text}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_turn_text}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 700
        }
    }
    data_bytes = json.dumps(payload).encode("utf-8")

    # gemini-pro does not support systemInstruction; use separate payload for it
    payload_legacy = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction_text}\n\n{user_turn_text}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 700
        }
    }

    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro"]

    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        body = payload if model_name != "gemini-pro" else payload_legacy
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(body).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                if reply_text:
                    logger.info("Generated RAG-augmented AI Chat reply in %s using %s", lang_name, model_name)
                    return reply_text.strip()
        except Exception as e:
            logger.warning("Gemini AI Chat request to %s failed: %s", model_name, e)
            continue
    return None


# ---------------------------------------------------------------------------
# Multilingual Fallback Agricultural Dictionary & Formatter
# ---------------------------------------------------------------------------
FALLBACK_TEMPLATES = {
    "te": {
        "header": "నమస్కారం రైతు సోదరులారా! మా ధృవీకరించబడిన వ్యవసాయ ప్యాకేజీ పద్ధతుల (Package of Practices) సమాచారం:\n\n",
        "tip": "\n\n💡 రైతులకు ముఖ్య సలహా: మీ పొలంలో నేల పరీక్ష (pH 6.0 - 7.5) చేయించండి. NPK ఎరువులను దశలవారీగా వేయండి. పురుగులు, తెగుళ్ల నివారణకు ఆకుల అడుగు భాగాన్ని పరిశీలించండి.",
        "empty": "నమస్కారం! దయచేసి పంట ఎరువులు, తెగుళ్ళు లేదా మార్కెట్ ధరల గురించి ఏదైనా ప్రశ్న అడగండి."
    },
    "hi": {
        "header": "नमस्ते किसान भाई! हमारे प्रमाणित कृषि पैकेज ऑफ प्रैक्टिसेज (Package of Practices) के अनुसार जानकारी:\n\n",
        "tip": "\n\n💡 किसान भाई के लिए सलाह: खेत की मिट्टी का pH (6.0 - 7.5) जांचें, NPK खादों को विभाजित मात्रा में दें, और कीट-रोगों की समय पर रोकथाम के लिए साप्ताहिक निरीक्षण करें।",
        "empty": "नमस्ते किसान भाई! कृपया फसल, खाद (उर्वरक), रोग या मंडी भाव से संबंधित कोई प्रश्न पूछें।"
    },
    "ta": {
        "header": "வணக்கம் விவசாய நண்பர்களே! நமது வேளாண்மை தொகுப்பு நடைமுறைகளின் (PoP) படி:\n\n",
        "tip": "\n\n💡 விவசாயிகளுக்கான குறிப்பு: மண் பரிசோதனை செய்து சமச்சீர் உரமிடுங்கள். பயிர் பூச்சித் தாக்குதலை ஆரம்பத்திலேயே கவனியுங்கள்.",
        "empty": "வணக்கம்! பயிர் உரம், பூச்சி தாக்குதல் அல்லது சந்தை விலை பற்றி கேளுங்கள்."
    },
    "kn": {
        "header": "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಅಧಿಕೃತ ಕೃಷಿ ಪದ್ಧತಿಗಳ (PoP) ಪ್ರಕಾರ ಮಾಹಿತಿ:\n\n",
        "tip": "\n\n💡 ರೈತರಿಗೆ ಸಲಹೆ: ಮಣ್ಣು ಪರೀಕ್ಷೆ ನಡೆಸಿ ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ ಬಳಸಿ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಎಚ್ಚರ ವಹಿಸಿ.",
        "empty": "ನಮಸ್ಕಾರ! ಬೆಳೆ, ರಸಗೊಬ್ಬರ, ಕೀಟ ರೋಗ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ದರಗಳ ಬಗ್ಗೆ ಕೇಳಿ."
    },
    "mr": {
        "header": "नमस्कार शेतकरी बंधूंनो! अधिकृत कृषी मार्गदर्शिकेनुसार (PoP) माहिती:\n\n",
        "tip": "\n\n💡 शेतकऱ्यांसाठी सल्ला: माती परीक्षण करा, NPK खतांचा समतोल वापर करा आणि किडींचा वेळेवर बंदोबस्त करा.",
        "empty": "नमस्कार! पिके, खते, कीड नियंत्रण किंवा बाजारभावाबाबत विचारा."
    },
    "bn": {
        "header": "নমস্কার কৃষক ভাই! আমাদের অনুমোদিত কৃষি নির্দেশিকা (PoP) অনুসারে উত্তর:\n\n",
        "tip": "\n\n💡 কৃষকদের পরামর্শ: মাটির পরীক্ষা করান, সুষম সার ব্যবহার করুন এবং রোগ দমনে সতর্ক থাকুন।",
        "empty": "নমস্কার! ফসল, সার, রোগবালাই বা বাজার দর সম্পর্কে জিজ্ঞাসা করুন।"
    },
    "en": {
        "header": "Namaste! Based on our verified Agricultural Package of Practices (PoP):\n\n",
        "tip": "\n\n💡 Agronomist Tip: Test your soil pH (6.0 - 7.5), follow split NPK applications, and inspect leaf undersides weekly for early disease control.",
        "empty": "Namaste! Please ask any farming, fertilizer, crop disease, or market price question."
    }
}

KEYWORD_TRANSLATIONS = {
    "te": [
        ("Paddy (Rice)", "వరి (Paddy)"), ("Rice", "వరి"), ("Wheat", "గోధుమ"),
        ("Cotton", "పత్తి"), ("Maize", "మొక్కజొన్న"), ("Tomato", "టమాటో"),
        ("Chilli", "మిరప"), ("Groundnut", "వేరుశనగ"),
        ("SOIL & SEED:", "నేల & విత్తనం:"),
        ("NPK FERTILIZER SCHEDULE:", "NPK ఎరువుల ప్రణాళిక:"),
        ("Basal Dose", "ప్రారంభ మోతాదు (దుక్కిలో)"),
        ("1st Top Dressing", "మొదటి దఫా ఎరువులు"),
        ("2nd Top Dressing", "రెండవ దఫా ఎరువులు"),
        ("PESTICIDE & DISEASE REMEDIES:", "పురుగు మందులు & తెగుళ్ల నివారణ:"),
        ("IRRIGATION:", "నీటి యాజమాన్యం:"),
        ("YIELD & PROFIT:", "దిగుబడి & లాభం:"),
        ("per acre", "ఎకరాకు"), ("Spray", "పిచికారీ చేయండి:"),
    ],
    "hi": [
        ("Paddy (Rice)", "धान (Paddy)"), ("Rice", "धान"), ("Wheat", "गेहूं"),
        ("Cotton", "कपास"), ("Maize", "मक्का"), ("Tomato", "टमाटर"),
        ("Chilli", "मिर्च"), ("Groundnut", "मूंगफली"),
        ("SOIL & SEED:", "मिट्टी एवं बीज:"),
        ("NPK FERTILIZER SCHEDULE:", "एनपीके उर्वरक प्रबंधन:"),
        ("Basal Dose", "बुवाई के समय मूल खाद"),
        ("1st Top Dressing", "पहला टॉप ड्रेसिंग"),
        ("2nd Top Dressing", "दूसरा टॉप ड्रेसिंग"),
        ("PESTICIDE & DISEASE REMEDIES:", "कीट एवं रोग नियंत्रण उपाय:"),
        ("IRRIGATION:", "सिंचाई प्रबंधन:"),
        ("YIELD & PROFIT:", "उत्पादन एवं लाभ:"),
        ("per acre", "प्रति एकड़"), ("Spray", "छिड़काव करें:"),
    ],
    "ta": [
        ("Paddy (Rice)", "நெல் (Paddy)"), ("Rice", "நெல்"), ("Wheat", "கோதுமை"),
        ("Cotton", "பருத்தி"), ("Maize", "மக்காச்சோளம்"), ("Tomato", "தக்காளி"),
        ("SOIL & SEED:", "மண் மற்றும் விதை:"),
        ("NPK FERTILIZER SCHEDULE:", "உர மேலாண்மை:"),
        ("IRRIGATION:", "நீர்ப்பாசனம்:"),
    ]
}


def localize_rag_context(context_str: str, lang: str) -> str:
    """Translates common headers and terms in the fallback context."""
    if lang not in KEYWORD_TRANSLATIONS:
        return context_str
    localized = context_str
    for en_term, target_term in KEYWORD_TRANSLATIONS[lang]:
        localized = localized.replace(en_term, target_term)
    return localized


# ---------------------------------------------------------------------------
# Native-language fallback answers (used when Gemini API is unavailable)
# These are written fully in each language so the user NEVER sees English.
# ---------------------------------------------------------------------------
NATIVE_FALLBACK_TOPICS = {
    "te": {
        "npk": (
            "NPK ఎరువుల సిఫార్సు:\n"
            "• వరి/ధాన్యాలు: నత్రజని (N) 120 కిగ్రా/హెక్టారు, భాస్వరం (P) 60 కిగ్రా/హె, పొటాషియం (K) 40 కిగ్రా/హె.\n"
            "• పత్తి: N 180 కిగ్రా/హె, P 90 కిగ్రా/హె, K 60 కిగ్రా/హె.\n"
            "• టమాటో: N 150 కిగ్రా/హె, P 75 కిగ్రా/హె, K 75 కిగ్రా/హె.\n"
            "• యూరియాలో 46% నత్రజని, DAP లో 18%N + 46%P, MOP లో 60%K ఉంటుంది.\n"
            "• ఎరువులను 2-3 దఫాలుగా వేయండి. పొడి నేలపై యూరియా వేయకండి."
        ),
        "disease": (
            "తెగుళ్ళు మరియు పురుగు నివారణ:\n"
            "• వరిలో బ్లాస్ట్ తెగులు: ట్రైసైక్లజోల్ 75% WP @ 0.6 గ్రా/లీటరు నీటిలో కలిపి పిచికారీ చేయండి.\n"
            "• పత్తిలో బొల్‌వార్మ్: క్లోరిపైరిఫాస్ 20 EC @ 2.5 మి.లీ/లీటరు పిచికారీ చేయండి.\n"
            "• టమాటోలో ఆకు ముళ్ళ తెగులు: మాంకోజెబ్ 75% WP @ 2.5 గ్రా/లీటరు పిచికారీ చేయండి.\n"
            "• వారానికి ఒకసారి ఆకుల అడుగు భాగాన్ని పరిశీలించండి."
        ),
        "market": (
            "మార్కెట్ ధరలు (సగటు):\n"
            "• వరి: ₹1,800 - ₹2,200 / క్వింటాల్\n"
            "• పత్తి: ₹5,500 - ₹7,000 / క్వింటాల్\n"
            "• టమాటో: ₹500 - ₹2,000 / క్వింటాల్ (సీజన్ ను బట్టి మారుతుంది)\n"
            "• తాజా ధరల కోసం స్థానిక మండి లేదా Agmarknet.gov.in చూడండి."
        ),
        "irrigation": (
            "నీటి యాజమాన్యం:\n"
            "• వరి: నాట్లు వేసిన తర్వాత 5-7 సెం.మీ నీరు నిల్వ ఉంచండి.\n"
            "• పత్తి: 10-14 రోజుల వ్యవధిలో తుషార సేద్యం (Drip) ద్వారా నీరు ఇవ్వండి.\n"
            "• టమాటో: పూత దశలో నీటి ఒత్తిడి రాకుండా 5-7 రోజులకు ఒకసారి నీరు ఇవ్వండి."
        ),
        "default": (
            "కృషి సహాయ్ AI సేవలు:\n"
            "• పంట ఎరువుల వివరాల కోసం: 'వరి NPK ఎరువులు' అని అడగండి\n"
            "• తెగుళ్ళ నివారణ కోసం: 'పత్తి పురుగుల నివారణ' అని అడగండి\n"
            "• మార్కెట్ ధరల కోసం: 'టమాటో మండి ధర' అని అడగండి\n"
            "• నీటి యాజమాన్యం కోసం: 'వరి నీటి యాజమాన్యం' అని అడగండి"
        ),
    },
    "hi": {
        "npk": (
            "NPK उर्वरक अनुशंसाएं:\n"
            "• धान/अनाज: नाइट्रोजन (N) 120 किग्रा/हेक्टेयर, फास्फोरस (P) 60 किग्रा/हे, पोटाश (K) 40 किग्रा/हे.\n"
            "• कपास: N 180 किग्रा/हे, P 90 किग्रा/हे, K 60 किग्रा/हे.\n"
            "• टमाटर: N 150 किग्रा/हे, P 75 किग्रा/हे, K 75 किग्रा/हे.\n"
            "• यूरिया में 46% नाइट्रोजन, DAP में 18%N + 46%P, MOP में 60%K होता है.\n"
            "• खाद को 2-3 बार में दें। सूखी मिट्टी पर यूरिया न डालें।"
        ),
        "disease": (
            "कीट एवं रोग नियंत्रण:\n"
            "• धान में ब्लास्ट रोग: ट्राइसाइक्लाजोल 75% WP @ 0.6 ग्राम/लीटर पानी में मिलाकर छिड़काव करें।\n"
            "• कपास में बोलवर्म: क्लोरपायरीफोस 20 EC @ 2.5 मि.ली./लीटर छिड़कें।\n"
            "• टमाटर में पत्ती मोड़ रोग: मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर छिड़काव करें।\n"
            "• सप्ताह में एक बार पत्तियों की निचली सतह की जांच करें।"
        ),
        "market": (
            "मंडी भाव (औसत):\n"
            "• धान: ₹1,800 - ₹2,200 / क्विंटल\n"
            "• कपास: ₹5,500 - ₹7,000 / क्विंटल\n"
            "• टमाटर: ₹500 - ₹2,000 / क्विंटल (मौसम के अनुसार बदलता है)\n"
            "• ताजा भाव के लिए स्थानीय मंडी या Agmarknet.gov.in देखें।"
        ),
        "irrigation": (
            "सिंचाई प्रबंधन:\n"
            "• धान: रोपाई के बाद 5-7 सेमी पानी भरकर रखें।\n"
            "• कपास: 10-14 दिन के अंतराल पर ड्रिप सिंचाई दें।\n"
            "• टमाटर: फूल आने पर पानी की कमी न होने दें, 5-7 दिन में एक बार सिंचाई करें।"
        ),
        "default": (
            "कृषि सहाय AI सेवाएं:\n"
            "• उर्वरक जानकारी के लिए: 'धान NPK खाद' पूछें\n"
            "• कीट-रोग नियंत्रण के लिए: 'कपास में कीट नियंत्रण' पूछें\n"
            "• मंडी भाव के लिए: 'टमाटर मंडी भाव' पूछें\n"
            "• सिंचाई के लिए: 'धान सिंचाई प्रबंधन' पूछें"
        ),
    },
    "ta": {
        "npk": (
            "NPK உர பரிந்துரைகள்:\n"
            "• நெல்/தானியங்கள்: நைட்ரஜன் (N) 120 கிகி/ஹெக்டேர், பாஸ்பரஸ் (P) 60 கிகி/ஹெ, பொட்டாசியம் (K) 40 கிகி/ஹெ.\n"
            "• பருத்தி: N 180 கிகி/ஹெ, P 90 கிகி/ஹெ, K 60 கிகி/ஹெ.\n"
            "• தக்காளி: N 150 கிகி/ஹெ, P 75 கிகி/ஹெ, K 75 கிகி/ஹெ.\n"
            "• யூரியாவில் 46% நைட்ரஜன், DAPல் 18%N + 46%P, MOPல் 60%K உள்ளது.\n"
            "• உரத்தை 2-3 தடவை பிரித்து இடுங்கள். உலர் மண்ணில் யூரியா இடாதீர்கள்."
        ),
        "disease": (
            "பூச்சி மற்றும் நோய் கட்டுப்பாடு:\n"
            "• நெல்லில் பிளாஸ்ட் நோய்: டிரைசைக்லஸோல் 75% WP @ 0.6 கிராம்/லிட்டர் தெளிக்கவும்.\n"
            "• பருத்தியில் பூட்டுப்புழு: குளோர்பைரிஃபோஸ் 20 EC @ 2.5 மி.லி/லிட்டர் தெளிக்கவும்.\n"
            "• தக்காளியில் இலை சுருள் நோய்: மேன்கோசெப் 75% WP @ 2.5 கிராம்/லிட்டர் தெளிக்கவும்.\n"
            "• வாரம் ஒரு முறை இலைகளின் கீழ்ப்பகுதியை ஆய்வு செய்யுங்கள்."
        ),
        "market": (
            "சந்தை விலைகள் (சராசரி):\n"
            "• நெல்: ₹1,800 - ₹2,200 / குவிண்டால்\n"
            "• பருத்தி: ₹5,500 - ₹7,000 / குவிண்டால்\n"
            "• தக்காளி: ₹500 - ₹2,000 / குவிண்டால் (பருவத்திற்கு ஏற்ப மாறும்)\n"
            "• புதிய விலைக்கு உள்ளூர் சந்தை அல்லது Agmarknet.gov.in பார்க்கவும்."
        ),
        "irrigation": (
            "நீர் மேலாண்மை:\n"
            "• நெல்: நடவு செய்த பிறகு 5-7 செமீ தண்ணீர் தேக்கவும்.\n"
            "• பருத்தி: 10-14 நாள் இடைவெளியில் சொட்டு நீர்ப்பாசனம் கொடுங்கள்.\n"
            "• தக்காளி: பூக்கும் நேரத்தில் நீர் பற்றாக்குறை வரக்கூடாது, 5-7 நாளுக்கொரு முறை பாசனம் செய்யுங்கள்."
        ),
        "default": (
            "கிருஷி சஹாய் AI சேவைகள்:\n"
            "• உர தகவலுக்கு: 'நெல் NPK உரம்' கேளுங்கள்\n"
            "• பூச்சி நோய்க்கு: 'பருத்தி பூச்சி கட்டுப்பாடு' கேளுங்கள்\n"
            "• சந்தை விலைக்கு: 'தக்காளி சந்தை விலை' கேளுங்கள்"
        ),
    },
    "kn": {
        "npk": (
            "NPK ರಸಗೊಬ್ಬರ ಶಿಫಾರಸುಗಳು:\n"
            "• ಭತ್ತ/ಧಾನ್ಯ: ಸಾರಜನಕ (N) 120 ಕಿಗ್ರಾ/ಹೆಕ್ಟೇರ್, ರಂಜಕ (P) 60 ಕಿಗ್ರಾ/ಹೆ, ಪೊಟ್ಯಾಸಿಯಮ್ (K) 40 ಕಿಗ್ರಾ/ಹೆ.\n"
            "• ಹತ್ತಿ: N 180 ಕಿಗ್ರಾ/ಹೆ, P 90 ಕಿಗ್ರಾ/ಹೆ, K 60 ಕಿಗ್ರಾ/ಹೆ.\n"
            "• ಟೊಮೇಟೊ: N 150 ಕಿಗ್ರಾ/ಹೆ, P 75 ಕಿಗ್ರಾ/ಹೆ, K 75 ಕಿಗ್ರಾ/ಹೆ.\n"
            "• ಯೂರಿಯಾದಲ್ಲಿ 46% ಸಾರಜನಕ, DAPನಲ್ಲಿ 18%N + 46%P, MOPನಲ್ಲಿ 60%K ಇದೆ.\n"
            "• ರಸಗೊಬ್ಬರವನ್ನು 2-3 ಬಾರಿ ವಿಭಜಿಸಿ ಹಾಕಿ. ಒಣ ಮಣ್ಣಿಗೆ ಯೂರಿಯಾ ಹಾಕಬೇಡಿ."
        ),
        "disease": (
            "ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ:\n"
            "• ಭತ್ತದಲ್ಲಿ ಬ್ಲಾಸ್ಟ್ ರೋಗ: ಟ್ರೈಸೈಕ್ಲಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.\n"
            "• ಹತ್ತಿಯಲ್ಲಿ ಬೋಲ್‌ವರ್ಮ್: ಕ್ಲೋರ್‌ಪೈರಿಫಾಸ್ 20 EC @ 2.5 ಮಿ.ಲಿ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n"
            "• ಟೊಮೇಟೊದಲ್ಲಿ ಎಲೆ ಮುರುಟು ರೋಗ: ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2.5 ಗ್ರಾ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n"
            "• ವಾರಕ್ಕೊಮ್ಮೆ ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರಿಶೀಲಿಸಿ."
        ),
        "market": (
            "ಮಾರುಕಟ್ಟೆ ದರಗಳು (ಸರಾಸರಿ):\n"
            "• ಭತ್ತ: ₹1,800 - ₹2,200 / ಕ್ವಿಂಟಾಲ್\n"
            "• ಹತ್ತಿ: ₹5,500 - ₹7,000 / ಕ್ವಿಂಟಾಲ್\n"
            "• ಟೊಮೇಟೊ: ₹500 - ₹2,000 / ಕ್ವಿಂಟಾಲ್ (ಋತುವಿನಂತೆ ಬದಲಾಗುತ್ತದೆ)\n"
            "• ತಾಜಾ ದರಕ್ಕೆ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಅಥವಾ Agmarknet.gov.in ನೋಡಿ."
        ),
        "irrigation": (
            "ನೀರಾವರಿ ನಿರ್ವಹಣೆ:\n"
            "• ಭತ್ತ: ನಾಟಿ ನಂತರ 5-7 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ.\n"
            "• ಹತ್ತಿ: 10-14 ದಿನಗಳ ಅಂತರದಲ್ಲಿ ಹನಿ ನೀರಾವರಿ ನೀಡಿ.\n"
            "• ಟೊಮೇಟೊ: ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ಆಗದಂತೆ 5-7 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ಕೊಡಿ."
        ),
        "default": (
            "ಕೃಷಿ ಸಹಾಯ AI ಸೇವೆಗಳು:\n"
            "• ರಸಗೊಬ್ಬರ ಮಾಹಿತಿಗೆ: 'ಭತ್ತ NPK ರಸಗೊಬ್ಬರ' ಕೇಳಿ\n"
            "• ಕೀಟ ರೋಗಕ್ಕೆ: 'ಹತ್ತಿ ಕೀಟ ನಿಯಂತ್ರಣ' ಕೇಳಿ\n"
            "• ಮಾರುಕಟ್ಟೆ ದರಕ್ಕೆ: 'ಟೊಮೇಟೊ ಮಾರುಕಟ್ಟೆ ದರ' ಕೇಳಿ"
        ),
    },
    "mr": {
        "npk": (
            "NPK खत शिफारसी:\n"
            "• भात/धान्य: नायट्रोजन (N) 120 किग्रा/हेक्टर, स्फुरद (P) 60 किग्रा/हे, पालाश (K) 40 किग्रा/हे.\n"
            "• कापूस: N 180 किग्रा/हे, P 90 किग्रा/हे, K 60 किग्रा/हे.\n"
            "• टोमॅटो: N 150 किग्रा/हे, P 75 किग्रा/हे, K 75 किग्रा/हे.\n"
            "• युरियामध्ये 46% नायट्रोजन, DAPमध्ये 18%N + 46%P, MOPमध्ये 60%K असते.\n"
            "• खत 2-3 हप्त्यांत विभागून द्या. कोरड्या मातीवर युरिया टाकू नका."
        ),
        "disease": (
            "कीड आणि रोग नियंत्रण:\n"
            "• भातात ब्लास्ट रोग: ट्रायसायक्लाझोल 75% WP @ 0.6 ग्रॅम/लिटर पाण्यात मिसळून फवारा.\n"
            "• कापसात बोलवर्म: क्लोरपायरीफोस 20 EC @ 2.5 मि.ली./लिटर फवारा.\n"
            "• टोमॅटोत पान गुंडाळणी रोग: मँकोझेब 75% WP @ 2.5 ग्रॅम/लिटर फवारा.\n"
            "• आठवड्यातून एकदा पानांची खालची बाजू तपासा."
        ),
        "market": (
            "बाजारभाव (सरासरी):\n"
            "• भात: ₹1,800 - ₹2,200 / क्विंटल\n"
            "• कापूस: ₹5,500 - ₹7,000 / क्विंटल\n"
            "• टोमॅटो: ₹500 - ₹2,000 / क्विंटल (हंगामानुसार बदलतो)\n"
            "• ताज्या भावासाठी स्थानिक बाजार किंवा Agmarknet.gov.in पहा."
        ),
        "irrigation": (
            "सिंचन व्यवस्थापन:\n"
            "• भात: रोप लागवडीनंतर 5-7 सेमी पाणी साठवा.\n"
            "• कापूस: 10-14 दिवसांच्या अंतराने ठिबक सिंचन द्या.\n"
            "• टोमॅटो: फुलोऱ्याच्या वेळी पाण्याची कमतरता नको, 5-7 दिवसांतून एकदा पाणी द्या."
        ),
        "default": (
            "कृषी सहाय AI सेवा:\n"
            "• खत माहितीसाठी: 'भात NPK खत' विचारा\n"
            "• कीड-रोगासाठी: 'कापसातील कीड नियंत्रण' विचारा\n"
            "• बाजारभावासाठी: 'टोमॅटो बाजारभाव' विचारा"
        ),
    },
    "bn": {
        "npk": (
            "NPK সার সুপারিশ:\n"
            "• ধান/শস্য: নাইট্রোজেন (N) 120 কিগ্রা/হেক্টর, ফসফরাস (P) 60 কিগ্রা/হে, পটাসিয়াম (K) 40 কিগ্রা/হে.\n"
            "• তুলা: N 180 কিগ্রা/হে, P 90 কিগ্রা/হে, K 60 কিগ্রা/হে.\n"
            "• টমেটো: N 150 কিগ্রা/হে, P 75 কিগ্রা/হে, K 75 কিগ্রা/হে.\n"
            "• ইউরিয়ায় 46% নাইট্রোজেন, DAP-এ 18%N + 46%P, MOP-এ 60%K থাকে.\n"
            "• সার 2-3 ভাগে ভাগ করে দিন। শুকনো মাটিতে ইউরিয়া দেবেন না।"
        ),
        "disease": (
            "কীটপতঙ্গ ও রোগ নিয়ন্ত্রণ:\n"
            "• ধানে ব্লাস্ট রোগ: ট্রাইসাইক্লাজোল 75% WP @ 0.6 গ্রাম/লিটার জলে মিশিয়ে স্প্রে করুন।\n"
            "• তুলায় বোলওয়ার্ম: ক্লোরপাইরিফোস 20 EC @ 2.5 মি.লি./লিটার স্প্রে করুন।\n"
            "• টমেটোতে পাতা মোড়ানো রোগ: ম্যানকোজেব 75% WP @ 2.5 গ্রাম/লিটার স্প্রে করুন।\n"
            "• সপ্তাহে একবার পাতার নিচের দিক পরীক্ষা করুন।"
        ),
        "market": (
            "বাজার দর (গড়):\n"
            "• ধান: ₹1,800 - ₹2,200 / কুইন্টাল\n"
            "• তুলা: ₹5,500 - ₹7,000 / কুইন্টাল\n"
            "• টমেটো: ₹500 - ₹2,000 / কুইন্টাল (মৌসুম অনুযায়ী পরিবর্তন হয়)\n"
            "• তাজা দরের জন্য স্থানীয় মান্ডি বা Agmarknet.gov.in দেখুন।"
        ),
        "irrigation": (
            "সেচ ব্যবস্থাপনা:\n"
            "• ধান: রোপণের পর 5-7 সেমি জল রাখুন।\n"
            "• তুলা: 10-14 দিন অন্তর ড্রিপ সেচ দিন।\n"
            "• টমেটো: ফুল আসার সময় জলের ঘাটতি রাখবেন না, 5-7 দিনে একবার সেচ দিন।"
        ),
        "default": (
            "কৃষি সহায় AI সেবা:\n"
            "• সার তথ্যের জন্য: 'ধান NPK সার' জিজ্ঞেস করুন\n"
            "• রোগ নিয়ন্ত্রণের জন্য: 'তুলার কীটপতঙ্গ নিয়ন্ত্রণ' জিজ্ঞেস করুন\n"
            "• বাজার দরের জন্য: 'টমেটো বাজার দর' জিজ্ঞেস করুন"
        ),
    },
    "en": {
        "npk": (
            "NPK Fertilizer Recommendations:\n"
            "• Paddy/Cereals: Nitrogen (N) 120 kg/ha, Phosphorus (P) 60 kg/ha, Potassium (K) 40 kg/ha.\n"
            "• Cotton: N 180 kg/ha, P 90 kg/ha, K 60 kg/ha.\n"
            "• Tomato: N 150 kg/ha, P 75 kg/ha, K 75 kg/ha.\n"
            "• Urea contains 46% N, DAP has 18%N + 46%P, MOP has 60%K.\n"
            "• Split fertilizer into 2-3 doses. Never apply Urea on dry soil."
        ),
        "disease": (
            "Pest & Disease Control:\n"
            "• Paddy Blast: Tricyclazole 75% WP @ 0.6 g/litre, spray on leaves.\n"
            "• Cotton Bollworm: Chlorpyrifos 20 EC @ 2.5 ml/litre spray.\n"
            "• Tomato Leaf Curl: Mancozeb 75% WP @ 2.5 g/litre spray.\n"
            "• Inspect leaf undersides weekly for early detection."
        ),
        "market": (
            "Market Prices (average):\n"
            "• Paddy: ₹1,800 - ₹2,200 / quintal\n"
            "• Cotton: ₹5,500 - ₹7,000 / quintal\n"
            "• Tomato: ₹500 - ₹2,000 / quintal (seasonal)\n"
            "• Check Agmarknet.gov.in for live prices."
        ),
        "irrigation": (
            "Irrigation Management:\n"
            "• Paddy: Maintain 5-7 cm standing water after transplanting.\n"
            "• Cotton: Drip irrigation every 10-14 days.\n"
            "• Tomato: Irrigate every 5-7 days; avoid moisture stress during flowering."
        ),
        "default": (
            "KrishiSahay AI can help with:\n"
            "• Fertilizer dosages: ask 'paddy NPK fertilizer'\n"
            "• Disease control: ask 'cotton pest control'\n"
            "• Market prices: ask 'tomato mandi price'\n"
            "• Irrigation: ask 'paddy irrigation schedule'"
        ),
    },
}


def build_native_fallback(msg_lower: str, lang: str, rag_context: str) -> str:
    """Returns a fully native-language answer based on topic detected from the user message.
    Never includes raw English RAG context."""
    topics = NATIVE_FALLBACK_TOPICS.get(lang, NATIVE_FALLBACK_TOPICS["en"])

    # Keyword topic detection
    npk_kw = ["npk", "fertilizer", "urea", "dap", "mop", "ఎరువు", "ఎరువులు", "నత్రజని",
               "खाद", "उर्वरक", "यूरिया", "உரம்", "ರಸಗೊಬ್ಬರ", "खत", "সার"]
    disease_kw = ["disease", "pest", "insect", "spray", "fungus", "blight", "blast", "worm",
                  "తెగులు", "పురుగు", "రోగ", "కీటక", "రోగాలు",
                  "कीट", "रोग", "बीमारी", "नाशक",
                  "நோய்", "பூச்சி", "ರೋಗ", "ಕೀಟ", "रोग", "कीड", "রোগ", "কীট"]
    market_kw = ["price", "market", "mandi", "rate", "cost", "sell",
                 "ధర", "మార్కెట్", "మండి", "ధరలు",
                 "भाव", "मंडी", "कीमत", "बाज़ार",
                 "விலை", "சந்தை", "ಬೆಲೆ", "ಮಾರುಕಟ್ಟೆ", "भाव", "बाजार", "দর", "বাজার"]
    irrigation_kw = ["water", "irrigation", "drip", "flood", "moisture",
                     "నీరు", "నీటి", "సేద్యం", "పారుదల",
                     "सिंचाई", "पानी", "नमी",
                     "நீர்", "நீர்ப்பாசனம்", "ನೀರು", "ನೀರಾವರಿ", "सिंचन", "पाणी", "সেচ", "জল"]

    if any(k in msg_lower for k in npk_kw):
        return topics["npk"]
    elif any(k in msg_lower for k in disease_kw):
        return topics["disease"]
    elif any(k in msg_lower for k in market_kw):
        return topics["market"]
    elif any(k in msg_lower for k in irrigation_kw):
        return topics["irrigation"]
    else:
        return topics["default"]


@router.post("/ask", response_model=ChatAskResponse)
def ask_chat(req: ChatAskRequest):
    if not req.message or not req.message.strip():
        lang = req.language if req.language in FALLBACK_TEMPLATES else "en"
        return ChatAskResponse(
            reply=FALLBACK_TEMPLATES[lang]["empty"],
            language=lang,
            rag_used=False
        )

    # Detect language from input text script or fallback to req.language
    script_lang = detect_script_language(req.message)
    target_lang = script_lang or (req.language.lower() if req.language else "en")
    if target_lang not in SUPPORTED_LANGUAGES:
        target_lang = "en"

    # 1. Perform RAG context retrieval
    rag_data = retrieve_rag_context(req.message, crop_filter=req.crop_filter, top_k=2)
    rag_context = rag_data["context_str"]
    sources = rag_data["sources"]

    # 2. Try Gemini RAG generation in the requested language
    gemini_reply = generate_with_gemini_rag(req.message, rag_context, target_lang=target_lang)
    if gemini_reply:
        return ChatAskResponse(
            reply=gemini_reply,
            language=target_lang,
            rag_used=True,
            sources=sources
        )

    # 3. Multilingual RAG Fallback Engine
    # Instead of dumping English RAG context, build a pure native-language answer
    # by detecting the topic and returning pre-written native tips.
    template = FALLBACK_TEMPLATES.get(target_lang, FALLBACK_TEMPLATES["en"])

    # Detect topic from user message keywords
    msg_lower = req.message.lower()
    topic_reply = build_native_fallback(msg_lower, target_lang, rag_context)
    fallback_reply = f"{template['header']}{topic_reply}{template['tip']}"

    return ChatAskResponse(
        reply=fallback_reply,
        language=target_lang,
        rag_used=True,
        sources=sources
    )


@router.post("/rag-search")
def rag_search(req: RAGSearchRequest):
    results = rag_engine.search(req.query, top_k=5, crop_filter=req.crop)
    return [
        {
            "id": r["doc"]["id"],
            "crop": r["doc"]["crop"],
            "title": r["doc"]["title"],
            "content": r["doc"]["content"],
            "score": r["score"],
        }
        for r in results
    ]


@router.get("/package-of-practices")
def get_package_of_practices(crop: Optional[str] = None):
    if crop:
        filtered = [d for d in AGRICULTURAL_KNOWLEDGE_BASE if crop.lower() in d["crop"].lower()]
        return filtered or AGRICULTURAL_KNOWLEDGE_BASE
    return AGRICULTURAL_KNOWLEDGE_BASE


@router.get("/pop-pdf")
def download_pop_pdf(crop: Optional[str] = None):
    """Generates a downloadable PDF handbook of Agricultural Package of Practices."""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    # Header
    c.setFillColorRGB(0.08, 0.45, 0.22)
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)

    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 45, "🌱 KrishiSahay — Package of Practices Handbook")
    c.setFont("Helvetica", 11)
    c.drawString(40, height - 65, "Official Agronomic Fertilizer, Pesticide & Crop Management Guide")

    # Content
    docs = AGRICULTURAL_KNOWLEDGE_BASE
    if crop and crop.lower() != "all":
        docs = [d for d in docs if crop.lower() in d["crop"].lower()] or docs

    y = height - 110
    for doc in docs:
        if y < 120:
            c.showPage()
            y = height - 60

        c.setFillColorRGB(0.1, 0.1, 0.1)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(40, y, f"• {doc['title']}")
        y -= 18

        c.setFont("Helvetica", 9)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        lines = doc["content"].split("\n")
        for line in lines:
            if y < 60:
                c.showPage()
                y = height - 60

            # Wrap long text lines
            if len(line) > 105:
                sub1 = line[:105]
                sub2 = line[105:]
                c.drawString(50, y, sub1)
                y -= 13
                c.drawString(50, y, "  " + sub2)
                y -= 13
            else:
                c.drawString(50, y, line)
                y -= 13
        y -= 15

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawString(40, 30, "Generated via KrishiSahay AI RAG Engine • Certified Agricultural Package of Practices")

    c.showPage()
    c.save()
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="KrishiSahay_Package_of_Practices.pdf"'}
    )


MULTILINGUAL_SUGGESTIONS = {
    "te": [
        "వరిలో ఎకరాకు వేయాల్సిన NPK ఎరువుల మోతాదు ఎంత?",
        "టమాటో ఆకు మచ్చల తెగులు (Early Blight) నివారణ ఎలా?",
        "పత్తి పంటలో ఎరువుల షెడ్యూల్ ఏమిటి?",
        "మొక్కజొన్నలో కత్తెర పురుగు నివారణకు మందులు ఏమిటి?",
    ],
    "hi": [
        "धान में प्रति एकड़ एनपीके (NPK) खाद की सही मात्रा क्या है?",
        "टमाटर में अगेती झुलसा रोग की रोकथाम कैसे करें?",
        "कपास की फसल के लिए उर्वरक प्रबंधन क्या है?",
        "मक्का में फॉल आर्मीवर्म कीट का नियंत्रण कैसे करें?",
    ],
    "ta": [
        "நெல் பயிருக்கு ஏக்கருக்கு பரிந்துரைக்கப்படும் உர அளவு என்ன?",
        "தக்காளி இலை கருகல் நோயை கட்டுப்படுத்துவது எப்படி?",
        "பருத்தி பயிருக்கு உர மேலாண்மை என்ன?",
        "மக்காச்சோளத்தில் படைப்புழு கட்டுப்பாடு எப்படி?",
    ],
    "kn": [
        "ಭತ್ತದ ಬೆಳೆಗೆ ಎಕರೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ಎಷ್ಟು?",
        "ಟೊಮೆಟೊ ಎಲೆ ಚುಕ್ಕೆ ರೋಗವನ್ನು ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?",
        "ಹತ್ತಿ ಬೆಳೆಗೆ ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ ಏನು?",
        "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಲದ್ದಿಹುಳು ನಿಯಂತ್ರಣ ಹೇಗೆ?",
    ],
    "mr": [
        "भातासाठी एकरी NPK खतांचे योग्य प्रमाण काय आहे?",
        "टोमॅटोवरील करपा रोगाचे नियंत्रण कसे करावे?",
        "कापूस पिकासाठी खत व्यवस्थापन कसे करावे?",
        "मक्यावरील लष्करी अळीचे नियंत्रण कसे करावे?",
    ],
    "bn": [
        "ধানের জন্য একর প্রতি NPK সারের সঠিক মাত্রা কত?",
        "টমেটোর আর্লি ব্লাইট রোগের প্রতিকার কী?",
        "তুলা ফসলের সার ব্যবস্থাপনা কেমন হওয়া উচিত?",
        "ভুট্টার ফল আর্মিওয়ার্ম পোকা দমন করবেন কীভাবে?",
    ],
    "en": [
        "What is the exact NPK dose for Paddy per acre?",
        "How to treat Tomato Early Blight with pesticides?",
        "What fertilizer schedule should I follow for Cotton?",
        "Which pesticides treat Fall Armyworm in Maize?",
    ],
}


@router.get("/suggestions")
def get_suggestions(lang: str = "en"):
    clean_lang = lang.lower() if lang else "en"
    return MULTILINGUAL_SUGGESTIONS.get(clean_lang, MULTILINGUAL_SUGGESTIONS["en"])
