"""
Retrieval-Augmented Generation (RAG) Engine for KrishiSahay AI Agronomist.
Includes comprehensive Package of Practices (PoP), NPK fertilizer calculator,
pesticide/fungicide dosages, disease remedies, and hybrid TF-IDF + Keyword vector search.
"""

import math
import re
from typing import List, Dict, Any, Optional

# ---------------------------------------------------------------------------
# AGRICULTURAL PACKAGE OF PRACTICES (PoP) KNOWLEDGE BASE
# ---------------------------------------------------------------------------
AGRICULTURAL_KNOWLEDGE_BASE = [
    {
        "id": "pop_rice_paddy",
        "crop": "Rice (Paddy)",
        "category": "Cereals",
        "title": "Paddy Package of Practices: NPK Fertilizer & Pest/Disease Management",
        "content": (
            "Paddy (Rice) Package of Practices (per acre):\n"
            "1. SOIL & SEED: Requires clay loam or alluvial soil with pH 5.5 - 7.0. Seed rate: 20-25 kg/acre for transplanted rice.\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose (at transplanting): DAP 50 kg + MOP 25 kg + Zinc Sulphate 21% 10 kg per acre.\n"
            "   - 1st Top Dressing (21 days / Tillering stage): Urea 30 kg/acre.\n"
            "   - 2nd Top Dressing (45 days / Panicle Initiation): Urea 25 kg + MOP 15 kg/acre.\n"
            "3. PESTICIDE & DISEASE REMEDIES:\n"
            "   - Rice Blast & Sheath Blight: Spray Tricyclazole 75% WP @ 0.6 g/litre water (120 g/acre) or Hexaconazole 5% EC @ 2 ml/litre.\n"
            "   - Stem Borer & Gall Midge: Apply Cartap Hydrochloride 4G granules @ 7.5 kg/acre in standing water.\n"
            "   - Brown Plant Hopper (BPH): Spray Imidacloprid 17.8% SL @ 0.5 ml/litre or Pymetrozine 50% WG @ 120 g/acre.\n"
            "4. IRRIGATION: Maintain 2-5 cm standing water during transplanting to tillering, then follow Alternate Wetting & Drying (AWD) to conserve up to 30% water.\n"
            "5. YIELD & PROFIT: Expected yield 22-26 quintals/acre; Cost: ₹18,500-22,000/acre; Net profit: ₹28,000-36,000/acre at MSP ₹2,300/qtl."
        ),
        "keywords": ["rice", "paddy", "npk", "fertilizer", "dap", "urea", "mop", "zinc", "blast", "sheath blight", "stem borer", "bph", "irrigation", "cost", "yield"]
    },
    {
        "id": "pop_wheat",
        "crop": "Wheat",
        "category": "Cereals",
        "title": "Wheat Package of Practices: NPK Fertilizer & Rust/Smut Protection",
        "content": (
            "Wheat Package of Practices (per acre):\n"
            "1. SOIL & SEED: Well-drained fertile clay loam, pH 6.0 - 7.5. Seed rate: 40-45 kg/acre sown in November (Rabi season).\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose (at sowing): DAP 50 kg + MOP 20 kg + Zinc Sulphate 10 kg per acre.\n"
            "   - 1st Top Dressing (21 days / Crown Root Initiation - CRI stage): Urea 45 kg/acre after first irrigation.\n"
            "   - 2nd Top Dressing (45 days / Tillering stage): Urea 35 kg/acre.\n"
            "3. PESTICIDE & DISEASE REMEDIES:\n"
            "   - Yellow Rust & Brown Rust: Spray Propiconazole 25% EC @ 1 ml/litre water (200 ml/acre) at first spot appearance.\n"
            "   - Loose Smut: Seed treatment with Carboxin 37.5% + Thiram 37.5% DS @ 2.5 g/kg seed.\n"
            "   - Termites & Aphids: Soil application of Chlorpyrifos 20% EC @ 1 litre/acre with irrigation.\n"
            "4. IRRIGATION: 5-6 critical irrigations at CRI (21 DAS), Tillering (40 DAS), Jointing (60 DAS), Flowering (80 DAS), and Milk stage (100 DAS)."
        ),
        "keywords": ["wheat", "npk", "urea", "dap", "mop", "yellow rust", "smut", "termites", "aphids", "cri", "rabi", "fertilizer"]
    },
    {
        "id": "pop_cotton",
        "crop": "Cotton",
        "category": "Cash Crop",
        "title": "Cotton Package of Practices: NPK Schedule & Bollworm/Sucking Pest Control",
        "content": (
            "Cotton Package of Practices (per acre):\n"
            "1. SOIL & SEED: Deep black cotton soil (Vertisols) or fertile loams, pH 6.0 - 8.0. Bt-Cotton seed rate: 1.5 - 2.0 kg/acre.\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: DAP 50 kg + MOP 25 kg + Neem cake 100 kg/acre.\n"
            "   - 1st Top Dressing (30 DAS): Urea 30 kg/acre.\n"
            "   - 2nd Top Dressing (60 DAS / Flowering): Urea 30 kg + MOP 15 kg/acre.\n"
            "   - Foliar Spray: Spray 19:19:19 @ 10 g/litre at 45 DAS and 13:0:45 (KNO3) @ 10 g/litre at boll formation (75 DAS).\n"
            "3. PEST & DISEASE MANAGEMENT:\n"
            "   - Sucking Pests (Aphids, Jassids, Thrips, Whitefly): Spray Imidacloprid 200 SL @ 0.3 ml/litre or Flonicamid 50 WG @ 0.4 g/litre.\n"
            "   - Pink Bollworm: Install Pink Bollworm Pheromone traps @ 5 traps/acre; spray Emamectin Benzoate 5% SG @ 0.4 g/litre or Spinetoram 11.7% SC @ 0.8 ml/litre.\n"
            "4. IRRIGATION: Water requirements 700-1200 mm. Critical stages: Square formation, Flowering, and Boll development."
        ),
        "keywords": ["cotton", "bt cotton", "npk", "fertilizer", "dap", "urea", "pink bollworm", "whitefly", "jassid", "thrips", "sucking pests", "mop"]
    },
    {
        "id": "pop_maize",
        "crop": "Maize",
        "category": "Cereals",
        "title": "Maize Package of Practices: NPK Nutrition & Fall Armyworm Management",
        "content": (
            "Maize (Corn) Package of Practices (per acre):\n"
            "1. SOIL & SEED: Well-drained loamy soil, pH 5.5 - 7.5. Seed rate: 8-10 kg/acre.\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: NPK 10:26:26 @ 50 kg + Zinc Sulphate 10 kg/acre.\n"
            "   - 1st Top Dressing (25-30 DAS / Knee-high stage): Urea 35 kg/acre.\n"
            "   - 2nd Top Dressing (50 DAS / Tasseling stage): Urea 25 kg/acre.\n"
            "3. PEST & DISEASE MANAGEMENT:\n"
            "   - Fall Armyworm (FAW - Spodoptera frugiperda): Whorl application of Emamectin Benzoate 5% SG @ 0.4 g/litre or Chlorantraniliprole 18.5% SC @ 0.4 ml/litre into plant whorls.\n"
            "   - Turcicum Leaf Blight: Spray Mancozeb 75% WP @ 2.5 g/litre.\n"
            "4. YIELD & PROFIT: Average yield 3.5 - 4.5 tonnes/acre; Gross revenue ~₹60,000/acre."
        ),
        "keywords": ["maize", "corn", "npk", "fertilizer", "fall armyworm", "faw", "turcicum blight", "urea", "knee-high", "tasseling"]
    },
    {
        "id": "pop_tomato",
        "crop": "Tomato",
        "category": "Vegetables",
        "title": "Tomato Package of Practices: NPK Nutrition, Blight Remedies & Pest Control",
        "content": (
            "Tomato Package of Practices (per acre):\n"
            "1. SOIL & TRANSPLANTING: Well-drained sandy loam rich in organic matter, pH 6.0 - 7.0. Seedlings transplanted at 25-30 days.\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: Farmyard Manure (FYM) 5 tonnes + DAP 50 kg + MOP 40 kg + Micronutrient mixture 10 kg/acre.\n"
            "   - Top Dressing (30 & 60 days post transplant): Urea 25 kg + MOP 15 kg per dressing per acre.\n"
            "   - Calcium & Boron: Spray Calcium Nitrate @ 5 g/litre + Boron 20% @ 1 g/litre during flowering to prevent Blossom End Rot.\n"
            "3. DISEASE & PEST REMEDIES:\n"
            "   - Early & Late Blight: Spray Mancozeb 75% WP @ 2.5 g/litre or Metalaxyl 8% + Mancozeb 64% WP @ 2 g/litre water.\n"
            "   - Bacterial Spot & Leaf Curl Virus: Spray Copper Oxychloride 50% WP @ 3 g/litre + Streptocycline 0.1 g/litre. For whitefly virus vector, spray Acetamiprid 20% SP @ 0.2 g/litre.\n"
            "   - Fruit Borer: Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/litre."
        ),
        "keywords": ["tomato", "npk", "fertilizer", "dap", "early blight", "late blight", "bacterial spot", "blossom end rot", "calcium", "fruit borer", "whitefly"]
    },
    {
        "id": "pop_chilli",
        "crop": "Chilli",
        "category": "Spices/Vegetables",
        "title": "Chilli Package of Practices: NPK Doses, Thrips & Die-Back Control",
        "content": (
            "Chilli Package of Practices (per acre):\n"
            "1. SOIL & SEED: Well-drained black or red loam soil, pH 6.0 - 7.0. Seed rate: 200-250 g/acre (hybrids).\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: FYM 4 tonnes + DAP 50 kg + MOP 30 kg + Sulphur 10 kg/acre.\n"
            "   - Top Dressing (30, 60, 90 DAS): Urea 20 kg + MOP 15 kg per application.\n"
            "3. PEST & DISEASE REMEDIES:\n"
            "   - Chilli Thrips & Mites (Murda disease): Spray Fipronil 5% SC @ 2 ml/litre or Spiromesifen 22.9% SC @ 1 ml/litre.\n"
            "   - Anthracnose / Fruit Rot / Die-Back: Spray Azoxystrobin 23% SC @ 1 ml/litre or Carbendazim 50% WP @ 1 g/litre.\n"
            "4. PROFITABILITY: Yield 15-20 quintals dry chilli/acre; Market rate ₹16,000-22,000/qtl."
        ),
        "keywords": ["chilli", "chili", "thrips", "mites", "anthracnose", "die-back", "fruit rot", "npk", "fertilizer", "fipronil", "murda"]
    },
    {
        "id": "pop_groundnut",
        "crop": "Groundnut",
        "category": "Oilseeds",
        "title": "Groundnut Package of Practices: Gypsum, NPK & Tikka Leaf Spot Management",
        "content": (
            "Groundnut (Peanut) Package of Practices (per acre):\n"
            "1. SOIL & SEED: Well-drained sandy loam or red sandy soil, pH 6.0 - 7.5. Seed rate: 45-50 kg kernels/acre.\n"
            "2. NPK & GYPSUM FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: Urea 20 kg + Single Super Phosphate (SSP) 100 kg + MOP 20 kg + Zinc Sulphate 10 kg/acre.\n"
            "   - GYPSUM APPLICATION (CRITICAL): Apply Gypsum @ 160-200 kg/acre at 40-45 DAS (flowering/pegging stage) near root zone for pod development and kernel filling.\n"
            "3. PEST & DISEASE MANAGEMENT:\n"
            "   - Tikka Leaf Spot (Cercospora): Spray Mancozeb 75% WP @ 2 g/litre or Hexaconazole 5% EC @ 2 ml/litre.\n"
            "   - Collar Rot & Stem Rot: Seed treatment with Trichoderma viride @ 10 g/kg seed or Tebuconazole 2 DS @ 1.5 g/kg seed."
        ),
        "keywords": ["groundnut", "peanut", "gypsum", "pegging", "tikka leaf spot", "ssp", "npk", "fertilizer", "collar rot", "zinc"]
    },
    {
        "id": "pop_pulses",
        "crop": "Pulses (Red Gram / Chickpea / Green Gram)",
        "category": "Pulses",
        "title": "Pulses Package of Practices: Rhizobium Inoculation, NPK & Helicoverpa Control",
        "content": (
            "Pulses (Red Gram / Pigeonpea, Chickpea, Moong, Urad) Package of Practices:\n"
            "1. SEED TREATMENT: Treat seeds with Rhizobium culture @ 200 g/10 kg seed + PSB (Phosphate Solubilizing Bacteria) for biological Nitrogen fixation.\n"
            "2. NPK FERTILIZER SCHEDULE (per acre):\n"
            "   - Basal Dose ONLY: Urea 15 kg + DAP 50 kg + MOP 15 kg + Sulphur 10 kg/acre. Pulses fix atmospheric Nitrogen, so minimal starter Urea is needed.\n"
            "   - Foliar Spray: Spray 19:19:19 @ 10 g/litre at vegetative stage and DAP 2% spray at flowering.\n"
            "3. PEST & DISEASE MANAGEMENT:\n"
            "   - Pod Borer (Helicoverpa armigera): Install Helicoverpa Pheromone traps @ 4/acre; spray Indoxacarb 14.5% SC @ 1 ml/litre or Emamectin Benzoate 5% SG @ 0.4 g/litre.\n"
            "   - Fusarium Wilt: Soil drenching with Trichoderma viride @ 2 kg/acre mixed with 100 kg FYM."
        ),
        "keywords": ["pulses", "red gram", "chickpea", "pigeonpea", "moong", "urad", "rhizobium", "npk", "pod borer", "helicoverpa", "wilt", "fertilizer"]
    },
    {
        "id": "pop_sugarcane",
        "crop": "Sugarcane",
        "category": "Cash Crop",
        "title": "Sugarcane Package of Practices: High NPK Requirement & Borer Management",
        "content": (
            "Sugarcane Package of Practices (per acre):\n"
            "1. SOIL & SETTS: Deep rich loamy soil with good drainage, pH 6.5 - 7.5. 3-bud setts @ 12,000 - 15,000 setts/acre.\n"
            "2. NPK FERTILIZER SCHEDULE:\n"
            "   - Basal Dose: DAP 100 kg + MOP 40 kg + Zinc Sulphate 15 kg/acre.\n"
            "   - Top Dressing: Total Urea 110 kg/acre split in 3 doses at 30, 60, and 90 DAS before earthing up.\n"
            "3. PEST & DISEASE CONTROL:\n"
            "   - Early Shoot Borer & Top Borer: Apply Chlorantraniliprole 0.4% G @ 7.5 kg/acre or Carbofuran 3G @ 12 kg/acre in furrows.\n"
            "   - Red Rot Disease: Use disease-free setts, soak setts in Carbendazim 0.1% for 15 minutes before planting."
        ),
        "keywords": ["sugarcane", "npk", "fertilizer", "dap", "urea", "mop", "red rot", "shoot borer", "setts", "earthing up"]
    },
    {
        "id": "pop_general_fertilizer_guide",
        "crop": "General Fertilizer Guide",
        "category": "Soil & Nutrition",
        "title": "Comprehensive NPK Fertilizer Calculation & Soil Health Guidelines",
        "content": (
            "General NPK Fertilizer & Soil Health Guidelines:\n"
            "1. NPK RATIOS:\n"
            "   - Cereals (Rice, Wheat, Maize): Recommended N:P:K ratio is 4:2:1 (approx 120:60:40 kg/ha).\n"
            "   - Pulses (Chickpea, Redgram): Recommended N:P:K ratio is 1:2:1 (approx 20:50:20 kg/ha).\n"
            "   - Oilseeds (Groundnut, Soybean, Mustard): Recommended ratio 3:4:2 + Sulphur 20 kg/ha.\n"
            "2. COMMON FERTILIZERS CONTENT:\n"
            "   - Urea: Contains 46% Nitrogen (N).\n"
            "   - DAP (Di-Ammonium Phosphate): Contains 18% Nitrogen (N) & 46% Phosphorus (P2O5).\n"
            "   - MOP (Muriate of Potash): Contains 60% Potassium (K2O).\n"
            "   - SSP (Single Super Phosphate): Contains 16% P2O5, 11% Sulphur, and 19% Calcium.\n"
            "3. APPLICATION BEST PRACTICES:\n"
            "   - Never apply Urea on dry soil or during heavy rain to avoid volatilization and leaching.\n"
            "   - Incorporate Phosphatic fertilizers (DAP/SSP) deep in the root zone during sowing as Phosphorus is immobile in soil.\n"
            "   - Mix Organic Manure (FYM / Vermicompost) to improve soil organic carbon (SOC) and microbial activity."
        ),
        "keywords": ["npk", "fertilizer", "urea", "dap", "mop", "ssp", "nitrogen", "phosphorus", "potassium", "soil health", "fym", "vermicompost", "dose"]
    }
]


# ---------------------------------------------------------------------------
# HYBRID TF-IDF + KEYWORD VECTOR RAG ENGINE
# ---------------------------------------------------------------------------
class AgriRAGEngine:
    def __init__(self, docs: List[Dict[str, Any]]):
        self.docs = docs
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vectors: List[Dict[int, float]] = []
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        text_clean = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [t for t in text_clean.split() if len(t) > 1]
        return tokens

    def _build_index(self):
        doc_count = len(self.docs)
        df_counts: Dict[str, int] = {}

        tokenized_docs = []
        for d in self.docs:
            full_text = f"{d['title']} {d['crop']} {d['content']} {' '.join(d['keywords'])}"
            tokens = self._tokenize(full_text)
            tokenized_docs.append(tokens)
            unique_tokens = set(tokens)
            for t in unique_tokens:
                df_counts[t] = df_counts.get(t, 0) + 1

        vocab_id = 0
        for term, df in df_counts.items():
            self.vocabulary[term] = vocab_id
            self.idf[term] = math.log((doc_count + 1) / (df + 1)) + 1.0
            vocab_id += 1

        for tokens in tokenized_docs:
            tf: Dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            
            vec: Dict[int, float] = {}
            doc_len = len(tokens) or 1
            for term, count in tf.items():
                if term in self.vocabulary:
                    idx = self.vocabulary[term]
                    vec[idx] = (count / doc_len) * self.idf[term]
            self.doc_vectors.append(vec)

    def _cosine_similarity(self, vec1: Dict[int, float], vec2: Dict[int, float]) -> float:
        dot = sum(val * vec2.get(idx, 0.0) for idx, val in vec1.items())
        norm1 = math.sqrt(sum(v * v for v in vec1.values()))
        norm2 = math.sqrt(sum(v * v for v in vec2.values()))
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return dot / (norm1 * norm2)

    def search(self, query: str, top_k: int = 3, crop_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        tokens = self._tokenize(query)
        if not tokens:
            return self.docs[:top_k]

        tf: Dict[str, int] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1

        q_vec: Dict[int, float] = {}
        q_len = len(tokens)
        for term, count in tf.items():
            if term in self.vocabulary:
                idx = self.vocabulary[term]
                q_vec[idx] = (count / q_len) * self.idf[term]

        results = []
        for i, doc in enumerate(self.docs):
            if crop_filter and crop_filter.lower() not in doc["crop"].lower() and crop_filter.lower() not in doc["title"].lower():
                continue

            tfidf_score = self._cosine_similarity(q_vec, self.doc_vectors[i])
            kw_match = sum(1 for t in tokens if t in doc["keywords"] or t in doc["crop"].lower())
            kw_boost = kw_match * 0.25

            total_score = tfidf_score + kw_boost

            results.append({
                "doc": doc,
                "score": round(float(total_score), 4),
                "tfidf_score": round(float(tfidf_score), 4),
                "kw_matches": kw_match
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]


# Global RAG Engine Instance
rag_engine = AgriRAGEngine(AGRICULTURAL_KNOWLEDGE_BASE)


def retrieve_rag_context(query: str, crop_filter: Optional[str] = None, top_k: int = 2) -> Dict[str, Any]:
    """
    Retrieves relevant Package of Practices documents and formats context for LLM prompt augmentation.
    """
    search_results = rag_engine.search(query, top_k=top_k, crop_filter=crop_filter)
    
    if not search_results or search_results[0]["score"] < 0.05:
        gen_doc = AGRICULTURAL_KNOWLEDGE_BASE[-1]
        context_str = f"Source [{gen_doc['title']}]:\n{gen_doc['content']}"
        sources = [gen_doc["title"]]
    else:
        context_blocks = []
        sources = []
        for item in search_results:
            d = item["doc"]
            context_blocks.append(f"Source [{d['title']}]:\n{d['content']}")
            sources.append(d["title"])
        context_str = "\n\n".join(context_blocks)

    return {
        "context_str": context_str,
        "sources": sources,
        "raw_results": search_results
    }
