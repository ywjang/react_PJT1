import { useEffect, useState } from 'react'

const clockFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', hourCycle: 'h23',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long',
})

export default function CurrentClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const update = () => setNow(new Date())
    const timer = window.setInterval(update, 1000)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const parts = Object.fromEntries(clockFormat.formatToParts(now).map(part => [part.type, part.value]))
  const second = Number(parts.second)
  const minute = Number(parts.minute) + second / 60
  const hour = Number(parts.hour) % 12 + minute / 60

  return <section className="current-clock" aria-label="한국시간 시계">
    <div className="analog-clock" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}images/clock-face.svg`} alt="" width="200" height="200"/>
      <svg viewBox="0 0 200 200" className="analog-clock-hands">
        <line x1="100" y1="108" x2="100" y2="55" stroke="#234c7b" strokeWidth="6" strokeLinecap="round" transform={`rotate(${hour * 30} 100 100)`}/>
        <line x1="100" y1="111" x2="100" y2="34" stroke="#427ed1" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minute * 6} 100 100)`}/>
        <line x1="100" y1="116" x2="100" y2="25" stroke="#e1796b" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${second * 6} 100 100)`}/>
        <circle cx="100" cy="100" r="5" fill="#234c7b"/>
        <circle cx="100" cy="100" r="2" fill="#fff"/>
      </svg>
    </div>
    <div className="current-clock-digital">
    <span className="current-clock-label"><span aria-hidden="true">◷</span> 지금, 우리 캠퍼스</span>
    <time dateTime={now.toISOString()} className="current-clock-time" aria-live="off">
      {clockFormat.format(now)}
    </time>
    <span className="current-clock-date">{dateFormat.format(now)}</span>
    <small>한국시간 · KST</small>
    </div>
  </section>
}
