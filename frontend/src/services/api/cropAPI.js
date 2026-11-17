import axiosClient from './axiosClient'

export const cropAPI = {
  async recommend(formData) {
    const { data } = await axiosClient.post('/crop/recommend', {
      soilType: formData.soilType,
      nitrogen: Number(formData.nitrogen) || 0,
      phosphorus: Number(formData.phosphorus) || 0,
      potassium: Number(formData.potassium) || 0,
      temperature: Number(formData.temperature) || 25,
      humidity: Number(formData.humidity) || 60,
      rainfall: Number(formData.rainfall) || 100,
      ph: Number(formData.ph) || 6.5,
      location: formData.location,
    })
    return data
  },
}
