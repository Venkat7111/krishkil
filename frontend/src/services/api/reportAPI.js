import axiosClient from './axiosClient'

export const reportAPI = {
  async getPrevious() {
    const { data } = await axiosClient.get('/reports')
    return data
  },
  async generate(type) {
    const { data } = await axiosClient.post('/reports/generate', { type })
    return data
  },
  downloadUrl(reportId) {
    return `${axiosClient.defaults.baseURL}/reports/${reportId}/pdf`
  },
}
