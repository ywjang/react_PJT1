import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
export const publicReadOnly = import.meta.env.VITE_PUBLIC_READ_ONLY === 'true'
export const remoteApi = /^https:\/\//.test(apiBaseUrl)
export const newsFeedUrl = remoteApi
  ? new URL('/news-feed', apiBaseUrl).href
  : '/news-feed'

export const api = axios.create({ baseURL: apiBaseUrl, timeout: 15000 })

// Credentials remain in this page's memory only. Never put them in VITE_*.
export async function connectServer(username, password) {
  if (!remoteApi) throw new Error('공개 HTTPS API 주소가 아직 설정되지 않았습니다.')
  const auth = { username, password }
  const response = await api.get('/system', { auth })
  if (response.data?.mode !== 'oracle' || response.data?.connected !== true) {
    throw new Error('공개 서버의 Oracle 연결 상태를 확인해 주세요.')
  }
  api.defaults.auth = auth
}

export function disconnectServer() {
  delete api.defaults.auth
}
