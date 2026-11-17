import axiosClient from './axiosClient'

export const newsAPI = {
  async list({ limit = 25, refresh = false, search = '' } = {}) {
    const { data } = await axiosClient.get('/news', { params: { limit, refresh, search } })
    return data
  },
}
