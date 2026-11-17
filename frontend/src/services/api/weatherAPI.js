import axiosClient from './axiosClient'

export const weatherAPI = {
  async getCurrent(location = 'Warangal') {
    const { data } = await axiosClient.get('/weather/current', { params: { location } })
    return data
  },
  async getHourly() {
    const { data } = await axiosClient.get('/weather/hourly')
    return data
  },
  async getWeekly() {
    const { data } = await axiosClient.get('/weather/weekly')
    return data
  },
  async getAlerts() {
    const { data } = await axiosClient.get('/weather/alerts')
    return data
  },
  async sendRainAlerts(payload) {
    const { data } = await axiosClient.post('/weather/send-alerts', payload)
    return data
  },
  async predictIrrigation(payload) {
    const { data } = await axiosClient.post('/weather/irrigation-predict', payload)
    return data
  },
}
