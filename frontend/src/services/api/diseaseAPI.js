import axiosClient from './axiosClient'

export const diseaseAPI = {
  async analyzeImage(file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await axiosClient.post('/disease/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000,
    })
    return data
  },
}

