import { useState } from 'react'
import { connectServer, disconnectServer, remoteApi } from '../api.js'

export default function ServerAccess({ onChange }) {
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!remoteApi) return null

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await connectServer(username, password)
      setConnected(true)
      setOpen(false)
      onChange()
    } catch (failure) {
      setError(failure.response?.status === 401
        ? '서버 접속 계정과 비밀번호를 확인해 주세요.'
        : '서버 주소·인증서·CORS 및 Oracle 연결을 확인해 주세요.')
    } finally {
      setPassword('')
      setBusy(false)
    }
  }

  return <section className="card p-3 mb-3" aria-label="공개 서버 접속">
    <div className="d-flex gap-2 align-items-center flex-wrap">
      <strong>{connected ? '서버 로그인됨' : '학사 자료 조회를 위해 서버 로그인이 필요합니다.'}</strong>
      {connected
        ? <button className="btn btn-outline-secondary btn-sm" onClick={() => {
          disconnectServer(); setConnected(false); setOpen(false); onChange()
        }}>서버 로그아웃</button>
        : <button className="btn btn-primary btn-sm" onClick={() => setOpen(value => !value)}>서버 로그인</button>}
    </div>
    {open && <form className="row g-2 mt-1" onSubmit={submit}>
      <label className="col-12 col-md-4">서버 접속 ID
        <input className="form-control" autoComplete="username" required value={username} disabled={busy}
          onChange={event => setUsername(event.target.value)}/>
      </label>
      <label className="col-12 col-md-4">서버 접속 비밀번호
        <input className="form-control" type="password" autoComplete="current-password" required value={password} disabled={busy}
          onChange={event => setPassword(event.target.value)}/>
      </label>
      <div className="col-12"><button className="btn btn-primary" disabled={busy}>{busy ? '연결 확인 중…' : '로그인'}</button></div>
      <small>Oracle 계정과 다른 웹 접속 전용 계정입니다. 새로고침하면 다시 로그인합니다.</small>
      {error && <p className="text-danger" role="alert">{error}</p>}
    </form>}
  </section>
}
