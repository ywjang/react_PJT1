import { useEffect, useState } from 'react'
import { WEATHER_CITIES, WEATHER_CACHE_MS, seoulDate, weatherDescription, weatherUrl, normalizeWeather, formatWeatherValue, validWeatherCache } from '../weather.js'

function readCache(id) {
 try { const value = JSON.parse(sessionStorage.getItem('academic-weather:' + id)); return validWeatherCache(value) ? value : null } catch { return null }
}
function WeatherIcon({ type }) {
 return <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className={'weather-symbol weather-' + type}>
  {type === 'sun' ? <><circle cx="40" cy="40" r="16" fill="#F3C765" stroke="#E8B44C" strokeWidth="2"/><path d="M40 8v8m0 48v8M8 40h8m48 0h8M17 17l6 6m34 34 6 6M17 63l6-6m34-34 6-6" stroke="#E8B44C" strokeWidth="3" strokeLinecap="round"/></>
   : type === 'moon' ? <path d="M58 49A26 26 0 0 1 31 16a27 27 0 1 0 27 33Z" fill="#A5B8E3" stroke="#8D9FC8" strokeWidth="2"/>
   : <><path d="M20 49a12 12 0 0 1-1-24 19 19 0 0 1 36-3 14 14 0 1 1 6 27H20Z" fill="#E7F1FB" stroke="#99B7D2" strokeWidth="2.5"/>
    {type === 'rain' && <path d="m25 58-4 9m21-9-4 9m21-9-4 9" stroke="#74A4D5" strokeWidth="3.5" strokeLinecap="round"/>}
    {type === 'snow' && <g fill="#9BB9D6"><circle cx="25" cy="62" r="3"/><circle cx="40" cy="68" r="3"/><circle cx="55" cy="62" r="3"/></g>}
    {type === 'fog' && <path d="M15 59h50M23 67h34" stroke="#ADBCCA" strokeWidth="3" strokeLinecap="round"/>}
    {type === 'storm' && <path d="m43 48-12 15h10l-5 13 17-19H42l6-9" fill="#E8BF62"/>}
   </>}
 </svg>
}
export default function WeatherCard({ city, onCityChange }) {
 return <WeatherPanel key={city.id} city={city} onCityChange={onCityChange}/>
}
function WeatherPanel({ city, onCityChange }) {
 const [state, setState] = useState(() => { const cached = readCache(city.id); return { phase: cached ? 'ready' : 'loading', data: cached?.data ?? null, error: '' } })
 const [revision, setRevision] = useState(0)
 useEffect(() => {
  const cached = readCache(city.id)
  if (revision === 0 && cached) {
   const timer = setTimeout(() => { setState(previous => ({ ...previous, phase: 'loading', error: '' })); setRevision(value => value + 1) }, Math.max(1000, WEATHER_CACHE_MS - (Date.now() - cached.fetchedAt)))
   return () => clearTimeout(timer)
  }
  let active = true, timedOut = false
  const controller = new AbortController()
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, 12000)
  fetch(weatherUrl(city), { signal: controller.signal, headers: { Accept: 'application/json' } })
   .then(response => { if (!response.ok) throw new Error(response.status === 429 ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.' : '날씨 서비스에 연결하지 못했습니다.'); return response.json() })
   .then(payload => {
    const data = normalizeWeather(payload)
    if (data.date !== seoulDate()) throw new Error('최신 예보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    if (!active) return
    try { sessionStorage.setItem('academic-weather:' + city.id, JSON.stringify({ fetchedAt: Date.now(), data })) } catch { /* Weather remains available without caching. */ }
    setState({ phase: 'ready', data, error: '' })
   })
   .catch(error => { if (!active) return; setState(previous => ({ ...previous, phase: 'error', error: timedOut ? '날씨 조회 시간이 초과되었습니다. 다시 시도해 주세요.' : error instanceof TypeError ? '날씨를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.' : error.message })) })
   .finally(() => clearTimeout(timeout))
  const interval = setInterval(() => { setState(previous => ({ ...previous, phase: 'loading', error: '' })); setRevision(value => value + 1) }, WEATHER_CACHE_MS)
  return () => { active = false; controller.abort(); clearTimeout(timeout); clearInterval(interval) }
 }, [city, revision])
 function refresh() { setState(previous => ({ ...previous, phase: 'loading', error: '' })); setRevision(value => value + 1) }
 const weather = state.data, condition = weatherDescription(weather?.code, weather?.isDay)
 const date = weather ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' }).format(new Date(weather.date + 'T12:00:00+09:00')) : ''
 return <section className="card weather-card" aria-labelledby="weather-title" aria-busy={state.phase === 'loading'}>
  <div className="weather-header"><div><span className="section-eyebrow">캠퍼스 라이프</span><h3 id="weather-title">오늘의 날씨</h3></div><div className="weather-controls"><label className="visually-hidden" htmlFor="weather-city">날씨 지역</label><select id="weather-city" className="form-select form-select-sm" value={city.id} onChange={event => onCityChange(event.target.value)}>{WEATHER_CITIES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button className="btn weather-refresh" disabled={state.phase === 'loading'} onClick={refresh} aria-label="날씨 새로고침"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
  {state.phase === 'loading' && <p className="weather-loading" role="status"><span className="spinner-border spinner-border-sm" aria-hidden="true"/>{weather ? '새로운 날씨를 확인하고 있어요…' : city.name + '의 날씨를 불러오고 있어요…'}</p>}
  {state.error && <div className="weather-error" role="alert"><span>{state.error}{weather && ' 아래 정보는 이전 조회 결과입니다.'}</span><button className="btn btn-outline-secondary btn-sm" onClick={refresh}>다시 시도</button></div>}
  {weather && <div className="weather-body"><div className="weather-now"><span className={'weather-icon-wrap ' + condition.icon}><WeatherIcon type={condition.icon}/></span><div><span className="weather-location">{city.name} <span>· {date}</span></span><div className="weather-temperature"><strong>{formatWeatherValue(weather.temperature)}</strong><span>°C</span><span className="weather-condition">{condition.label}</span></div><span className="weather-range"><span>최고 {formatWeatherValue(weather.high, '°')}</span><span>최저 {formatWeatherValue(weather.low, '°')}</span></span></div></div><dl className="weather-metrics"><div><dt>체감온도</dt><dd>{formatWeatherValue(weather.apparent, '°')}</dd></div><div><dt>습도</dt><dd>{formatWeatherValue(weather.humidity, '%')}</dd></div><div><dt>바람</dt><dd>{formatWeatherValue(weather.wind, 'm/s', 1)}</dd></div><div><dt>오늘 최대 강수확률</dt><dd>{formatWeatherValue(weather.precipitation, '%')}</dd></div></dl></div>}
  <div className="weather-footer"><span>{weather ? `${weather.time.slice(11,16)} 예보 기준 · 한국시간${state.phase === 'error' ? ' · 이전 정보' : ''}` : '선택한 도시의 예보를 표시합니다.'}</span><span>날씨 자료 <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span></div>
 </section>
}
