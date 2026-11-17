import axiosClient from './axiosClient'

export const authAPI = {
  async login({ email, password }) {
    const { data } = await axiosClient.post('/auth/login', { email, password })
    return data
  },
  async register(payload) {
    const { data } = await axiosClient.post('/auth/register', payload)
    return data
  },
  async sendOtp(email) {
    try {
      const { data } = await axiosClient.post('/auth/send-otp', { email })
      return { sent: true, email, ...data }
    } catch (err) {
      console.error('Send OTP error:', err)
      return { sent: false, error: err.response?.data?.detail || 'Failed to send OTP email' }
    }
  },
  async verifyOtp(email, otp) {
    try {
      const { data } = await axiosClient.post('/auth/verify-otp', { email, otp })
      return { verified: true, ...data }
    } catch (err) {
      console.error('Verify OTP error:', err)
      return { verified: false, error: err.response?.data?.detail || 'Invalid OTP code' }
    }
  },
  async resetPassword({ email, otp, newPassword }) {
    try {
      const { data } = await axiosClient.post('/auth/reset-password', { email, otp, newPassword })
      return { success: true, ...data }
    } catch (err) {
      console.error('Reset password error:', err)
      return { success: false, error: err.response?.data?.detail || 'Failed to reset password' }
    }
  },
  async testEmail(toEmail = 'merugusai112233@gmail.com') {
    const { data } = await axiosClient.post(`/auth/test-email?to_email=${encodeURIComponent(toEmail)}`)
    return data
  }
}
