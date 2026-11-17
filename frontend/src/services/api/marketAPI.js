import axiosClient from './axiosClient'

export const marketAPI = {
  async getPrices() {
    const { data } = await axiosClient.get('/market/prices')
    return data
  },
  async getNearbyMarkets() {
    const { data } = await axiosClient.get('/market/nearby')
    return data
  },
  async getTrend(crop = 'Cotton') {
    const { data } = await axiosClient.get('/market/trend', { params: { crop } })
    return data
  },
}
