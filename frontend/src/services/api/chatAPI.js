import axiosClient from './axiosClient'

export const chatAPI = {
  async sendMessage(message, language = 'en', cropFilter = null) {
    try {
      const { data } = await axiosClient.post('/chat/ask', {
        message,
        language,
        crop_filter: cropFilter,
      })
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Thank you for your question. How else can I assist your farm today?',
        language: data.language || language,
        rag_used: data.rag_used ?? true,
        sources: data.sources || [],
      }
    } catch (err) {
      console.error('Chat API Error:', err)
      const fallbackMsgs = {
        te: 'నమస్కారం! వరి, పత్తి, మిరప లేదా టమాటో పంటలలో ఎరువులు మరియు తెగుళ్ల నివారణ గురించి అడగండి.',
        hi: 'नमस्ते किसान भाई! धान, गेहूं, कपास या टमाटर में खाद और कीट नियंत्रण के बारे में कोई भी प्रश्न पूछें।',
        en: 'Namaste! For optimal crop yields, ensure good field drainage, balanced NPK application, and monitor leaves for early symptoms.',
      }
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fallbackMsgs[language] || fallbackMsgs.en,
        language,
        rag_used: false,
        sources: [],
      }
    }
  },
  async getSuggestedQuestions(language = 'en') {
    try {
      const { data } = await axiosClient.get(`/chat/suggestions?lang=${encodeURIComponent(language)}`)
      return data
    } catch {
      return [
        'What is the exact NPK dose for Paddy per acre?',
        'How to treat Tomato Early Blight with pesticides?',
        'What fertilizer schedule should I follow for Cotton?',
        'Which pesticides treat Fall Armyworm in Maize?',
      ]
    }
  },
  async searchPoP(query, crop = null) {
    try {
      const { data } = await axiosClient.post('/chat/rag-search', { query, crop })
      return data
    } catch (err) {
      console.error('PoP RAG Search Error:', err)
      return []
    }
  },
  async getPackageOfPractices(crop = null) {
    try {
      const { data } = await axiosClient.get('/chat/package-of-practices', { params: { crop } })
      return data
    } catch (err) {
      console.error('Get PoP Error:', err)
      return []
    }
  },
  getPoPPdfUrl(crop = 'all') {
    const baseURL = axiosClient.defaults.baseURL || '/api'
    return `${baseURL}/chat/pop-pdf?crop=${encodeURIComponent(crop)}`
  },
  async getHistory() {
    return []
  },
}
