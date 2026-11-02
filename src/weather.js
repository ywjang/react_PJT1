export const WEATHER_CACHE_MS = 15 * 60 * 1000
export const WEATHER_CITY_KEY = 'academic-weather-city'
export const WEATHER_CITIES = [
 { id: 'seoul', name: '서울', latitude: 37.5665, longitude: 126.978 },
 { id: 'incheon', name: '인천', latitude: 37.4563, longitude: 126.7052 },
 { id: 'suwon', name: '수원', latitude: 37.2636, longitude: 127.0286 },
 { id: 'chuncheon', name: '춘천', latitude: 37.8813, longitude: 127.7298 },
 { id: 'gangneung', name: '강릉', latitude: 37.7519, longitude: 128.8761 },
 { id: 'daejeon', name: '대전', latitude: 36.3504, longitude: 127.3845 },
 { id: 'cheongju', name: '청주', latitude: 36.6424, longitude: 127.489 },
 { id: 'daegu', name: '대구', latitude: 35.8714, longitude: 128.6014 },
 { id: 'gwangju', name: '광주', latitude: 35.1595, longitude: 126.8526 },
 { id: 'jeonju', name: '전주', latitude: 35.8242, longitude: 127.148 },
 { id: 'ulsan', name: '울산', latitude: 35.5384, longitude: 129.3114 },
 { id: 'busan', name: '부산', latitude: 35.1796, longitude: 129.0756 },
 { id: 'jeju', name: '제주', latitude: 33.4996, longitude: 126.5312 },
]
export function seoulDate(now = Date.now()) {
 return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now))
}
export function weatherDescription(code, isDay = true) {
 if (code === 0) return { label: '맑음', icon: isDay ? 'sun' : 'moon' }
 if (code === 1) return { label: '대체로 맑음', icon: isDay ? 'sun' : 'moon' }
 if (code === 2) return { label: '구름 조금', icon: 'cloud' }
 if (code === 3) return { label: '흐림', icon: 'cloud' }
 if ([45, 48].includes(code)) return { label: '안개', icon: 'fog' }
 if ([51, 53, 55].includes(code)) return { label: '이슬비', icon: 'rain' }
 if ([56, 57].includes(code)) return { label: '어는 이슬비', icon: 'rain' }
 if ([61, 63, 65].includes(code)) return { label: '비', icon: 'rain' }
 if ([66, 67].includes(code)) return { label: '어는 비', icon: 'rain' }
 if ([71, 73, 75].includes(code)) return { label: '눈', icon: 'snow' }
 if (code === 77) return { label: '눈 알갱이', icon: 'snow' }
 if ([80, 81, 82].includes(code)) return { label: '소나기', icon: 'rain' }
 if ([85, 86].includes(code)) return { label: '눈 소나기', icon: 'snow' }
 if ([95, 96, 99].includes(code)) return { label: code === 95 ? '뇌우' : '우박 동반 뇌우', icon: 'storm' }
 return { label: '날씨 정보 없음', icon: 'cloud' }
}
const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null
export function normalizeWeather(payload) {
 const current = payload?.current, daily = payload?.daily
 if (!current || numeric(current.temperature_2m) === null || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(current.time ?? '') || !Number.isFinite(Date.parse(current.time + '+09:00'))) throw new Error('날씨 응답을 확인하지 못했습니다.')
 const date = current.time.slice(0, 10)
 const index = Array.isArray(daily?.time) ? daily.time.indexOf(date) : -1
 if (index < 0 || payload.timezone !== 'Asia/Seoul') throw new Error('오늘의 예보를 확인하지 못했습니다.')
 return {
  date, time: current.time, temperature: current.temperature_2m,
  apparent: numeric(current.apparent_temperature), humidity: numeric(current.relative_humidity_2m),
  wind: numeric(current.wind_speed_10m), code: numeric(current.weather_code), isDay: current.is_day === 1,
  high: numeric(daily.temperature_2m_max?.[index]), low: numeric(daily.temperature_2m_min?.[index]),
  precipitation: numeric(daily.precipitation_probability_max?.[index]),
 }
}
export function weatherUrl(city) {
 const params = new URLSearchParams({ latitude: String(city.latitude), longitude: String(city.longitude),
  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
  daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  timezone: 'Asia/Seoul', temperature_unit: 'celsius', wind_speed_unit: 'ms', forecast_days: '1' })
 return 'https://api.open-meteo.com/v1/forecast?' + params
}
export function formatWeatherValue(value, unit = '', digits = 0) {
 return numeric(value) === null ? '—' : value.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + unit
}
export function validWeatherCache(entry, now = Date.now()) {
 const age = now - entry?.fetchedAt
 return !!entry && typeof entry.fetchedAt === 'number' && age >= 0 && age < WEATHER_CACHE_MS && entry.data?.date === seoulDate(now) && typeof entry.data?.time === 'string' && entry.data.time.startsWith(entry.data.date + 'T') && Number.isFinite(Date.parse(entry.data.time + '+09:00')) && numeric(entry.data?.temperature) !== null
}
