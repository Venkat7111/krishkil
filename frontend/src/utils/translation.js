/**
 * Multi-Language Translation Utility for KrishiSahay.
 * Supports English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்),
 * Marathi (मराठी), Bengali (বাংলা), Kannada (కన్నడ).
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'kn', name: 'Kannada', native: 'కన్నడ' },
]

// Common dictionary for quick UI and agronomic phrase translations
const DICTIONARY = {
  hi: {
    'Healthy': 'स्वास्थ्य (Healthy)',
    'Severe': 'गंभीर (Severe)',
    'Moderate': 'मध्यम (Moderate)',
    'Mild': 'हल्का (Mild)',
    'Early blight': 'अगेती झुलसा (Early Blight)',
    'Late blight': 'पछेती झुलसा (Late Blight)',
    'Bacterial spot': 'जीवाणु धब्बा (Bacterial Spot)',
    'Powdery mildew': 'सफेद रोगाणु/छाछिया (Powdery Mildew)',
    'Leaf mold': 'पत्ती मोल्ड (Leaf Mold)',
    'Yellow leaf curl virus': 'पीला पत्ती मरोड़ विषाणु (Yellow Leaf Curl)',
    'Common rust': 'सामान्य रस्ट/गेरुई (Common Rust)',
    'Rice Blast': 'धान का ब्लास्ट रोग (Rice Blast)',
    'Tomato': 'टमाटर (Tomato)',
    'Potato': 'आलू (Potato)',
    'Corn (Maize)': 'मक्का (Maize)',
    'Rice (Paddy)': 'धान/चावल (Paddy)',
    'Cotton': 'कपास (Cotton)',
    'Chilli': 'मिर्च (Chilli)',
    'Groundnut': 'मूंगफली (Groundnut)',
    'Symptoms': 'लक्षण (Symptoms)',
    'Immediate Treatment': 'तत्काल उपचार (Treatment)',
    'Long-term Prevention': 'दीर्घकालिक रोकथाम (Prevention)',
    'Alternative Candidates': 'वैकल्पिक रोग संभावनाएं',
    'Fertilizer Plan': 'उर्वरक योजना',
    'Ask AI Chat Advisor': 'एआई कृषि मित्र से पूछें',
    'Listen to Diagnosis': 'निदान सुनें (Voice)',
  },
  te: {
    'Healthy': 'ఆరోగ్యకరమైన (Healthy)',
    'Severe': 'తీవ్రమైన (Severe)',
    'Moderate': 'సాధారణ (Moderate)',
    'Mild': 'తేలికపాటి (Mild)',
    'Early blight': 'అర్లీ బ్లైట్ తెగులు (Early Blight)',
    'Late blight': 'లేట్ బ్లైట్ తెగులు (Late Blight)',
    'Bacterial spot': 'బాక్టీరియల్ మచ్చల తెగులు (Bacterial Spot)',
    'Powdery mildew': 'బూడిద తెగులు (Powdery Mildew)',
    'Leaf mold': 'ఆకు మోల్డ్ తెగులు (Leaf Mold)',
    'Common rust': 'తుప్పు తెగులు (Rust)',
    'Tomato': 'టమాటో (Tomato)',
    'Potato': 'బంగాళాదుంప (Potato)',
    'Corn (Maize)': 'జొన్న/మొక్కజొన్న (Maize)',
    'Rice (Paddy)': 'వరి (Paddy)',
    'Cotton': 'పత్తి (Cotton)',
    'Chilli': 'మిరప (Chilli)',
    'Groundnut': 'వేరుశనగ (Groundnut)',
    'Symptoms': 'లక్షణాలు (Symptoms)',
    'Immediate Treatment': 'తక్షణ నివారణ చర్యలు (Treatment)',
    'Long-term Prevention': 'దీర్ఘకాలిక జాగ్రత్తలు (Prevention)',
    'Alternative Candidates': 'ఇతర తెగులు సంభావ్యతలు',
    'Fertilizer Plan': 'ఎరువుల ప్రణాళిక',
    'Ask AI Chat Advisor': 'AI రైతు సలహాదారుని అడగండి',
    'Listen to Diagnosis': 'వాయిస్ ద్వారా వినండి',
  },
  ta: {
    'Healthy': 'ஆரோக்கியமானது (Healthy)',
    'Severe': 'கடுமையான (Severe)',
    'Moderate': 'மிதமான (Moderate)',
    'Mild': 'லேசான (Mild)',
    'Early blight': 'முன் கூட்டிய கருகல் நோய்',
    'Late blight': 'பின் கூட்டிய கருகல் நோய்',
    'Bacterial spot': 'பாக்டீரியா புள்ளி நோய்',
    'Powdery mildew': 'சாம்பல் நோய் (Powdery Mildew)',
    'Tomato': 'தக்காளி (Tomato)',
    'Potato': 'உருளைக்கிழங்கு (Potato)',
    'Rice (Paddy)': 'நெல் (Paddy)',
    'Cotton': 'பருத்தி (Cotton)',
    'Symptoms': 'அறிகுறிகள் (Symptoms)',
    'Immediate Treatment': 'உடனடி சிகிச்சை (Treatment)',
    'Long-term Prevention': 'நீண்டகால தடுப்பு முறைகள்',
  },
  mr: {
    'Healthy': 'निरोगी (Healthy)',
    'Severe': 'गंभीर (Severe)',
    'Moderate': 'मध्यम (Moderate)',
    'Mild': 'सौम्य (Mild)',
    'Early blight': 'लवकर येणारा करपा (Early Blight)',
    'Late blight': 'उशिरा येणारा करपा (Late Blight)',
    'Powdery mildew': 'भुरी रोग (Powdery Mildew)',
    'Tomato': 'टोमॅटो (Tomato)',
    'Rice (Paddy)': 'भात/धान (Paddy)',
    'Cotton': 'कापूस (Cotton)',
    'Symptoms': 'लक्षणे (Symptoms)',
    'Immediate Treatment': 'तातडीचे उपाय (Treatment)',
    'Long-term Prevention': 'दीर्घकालीन प्रतिबंध',
  },
  bn: {
    'Healthy': 'সতেজ/রোগমুক্ত (Healthy)',
    'Severe': 'মারাত্মক (Severe)',
    'Moderate': 'মাঝারি (Moderate)',
    'Early blight': 'আর্লি ব্লাইট রোগ',
    'Late blight': 'লেট ব্লাইট রোগ',
    'Rice (Paddy)': 'ধান (Paddy)',
    'Tomato': 'টমেটো (Tomato)',
    'Symptoms': 'লক্ষণ (Symptoms)',
    'Immediate Treatment': 'জরুরী প্রতিকার (Treatment)',
  },
  kn: {
    'Healthy': 'ಆರೋಗ್ಯಕರ (Healthy)',
    'Severe': 'ತೀವ್ರ (Severe)',
    'Moderate': 'ಮಧ್ಯಮ (Moderate)',
    'Early blight': 'ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗ',
    'Late blight': 'ಲೇಟ್ ಬ್ಲೈಟ್ ರೋಗ',
    'Rice (Paddy)': 'ಬತ್ತ (Paddy)',
    'Tomato': 'ಟೊಮೆಟೊ (Tomato)',
    'Symptoms': 'ಲಕ್ಷಣಗಳು (Symptoms)',
    'Immediate Treatment': 'ತಕ್ಷಣದ ಉಪಚಾರ (Treatment)',
  }
}

/**
 * Translates a single text phrase into target language.
 */
export function translateText(text, targetLang = 'en') {
  if (!text || targetLang === 'en') return text
  const dict = DICTIONARY[targetLang]
  if (!dict) return text
  if (dict[text]) return dict[text]
  
  // Case-insensitive fallback check
  const textLower = text.toLowerCase().trim()
  for (const [key, val] of Object.entries(dict)) {
    if (key.toLowerCase() === textLower) return val
  }
  return text
}

/**
 * Translates a complete Disease Result object into target language.
 */
export function translateDiseaseResult(result, targetLang = 'en') {
  if (!result || targetLang === 'en') return result

  return {
    ...result,
    crop: translateText(result.crop, targetLang),
    disease: translateText(result.disease, targetLang),
    severity: translateText(result.severity, targetLang),
    symptoms: translateText(result.symptoms, targetLang),
    treatment: result.treatment?.map((t) => translateText(t, targetLang)) || [],
    prevention: result.prevention?.map((p) => translateText(p, targetLang)) || [],
    suggestions: result.suggestions?.map((s) => ({
      ...s,
      crop: translateText(s.crop, targetLang),
      disease: translateText(s.disease, targetLang),
    })) || [],
  }
}
