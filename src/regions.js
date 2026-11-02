import { WEATHER_CITIES, WEATHER_CITY_KEY } from './weather.js'
export const CAMPUS_REGIONS = WEATHER_CITIES
export function readRegion(storage) {
 try { const id = (storage ?? globalThis.localStorage)?.getItem(WEATHER_CITY_KEY); return CAMPUS_REGIONS.some(item => item.id === id) ? id : 'seoul' } catch { return 'seoul' }
}
export function rememberRegion(id, storage) {
 if (!CAMPUS_REGIONS.some(item => item.id === id)) return false
 try { (storage ?? globalThis.localStorage)?.setItem(WEATHER_CITY_KEY, id) } catch { /* The current selection still works without storage. */ }
 return true
}
