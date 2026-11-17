import axiosClient from './axiosClient'

export const schemeAPI = {
  async list({ q, category } = {}) {
    const { data } = await axiosClient.get('/schemes', { params: { q, category } })
    return data
  },
  async categories() {
    const { data } = await axiosClient.get('/schemes/categories')
    return data
  },
}
