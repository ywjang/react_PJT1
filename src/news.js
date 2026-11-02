export const NEWS_CACHE_MS = 10 * 60 * 1000
export const NEWS_HOME = 'https://news.google.com/?hl=ko&gl=KR&ceid=KR:ko'
function dayInSeoul(value) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value)) }
export function safeNewsUrl(value) {
 try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null } catch { return null }
}
export function normalizeHeadlines(items, now = Date.now()) {
 const today = dayInSeoul(now), seen = new Set(), result = []
 for (const item of items) {
  const title = String(item.title ?? '').replace(/\s+/g,' ').trim(), link = safeNewsUrl(item.link), published = Date.parse(item.publishedAt)
  if (!title || title.length > 350 || !link || !Number.isFinite(published) || published > now + 5*60*1000 || dayInSeoul(published) !== today || seen.has(link)) continue
  seen.add(link)
  const publisher = String(item.publisher ?? '').trim().slice(0,80) || '언론사 미표시'
  const suffix = ' - ' + publisher
  result.push({ title: title.endsWith(suffix) ? title.slice(0,-suffix.length) : title, link, publisher, publishedAt:new Date(published).toISOString() })
  if (result.length === 5) break
 }
 return result
}
export function parseNewsFeed(xml, now = Date.now()) {
 if (typeof xml !== 'string' || xml.length > 2_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('뉴스 자료 형식을 확인하지 못했습니다.')
 const doc = new DOMParser().parseFromString(xml,'application/xml')
 if (doc.querySelector('parsererror') || !doc.querySelector('rss channel')) throw new Error('뉴스 자료를 읽지 못했습니다.')
 return normalizeHeadlines([...doc.querySelectorAll('channel > item')].map(item=>({ title:item.querySelector('title')?.textContent, link:item.querySelector('link')?.textContent, publisher:item.querySelector('source')?.textContent, publishedAt:item.querySelector('pubDate')?.textContent })), now)
}
export function validNewsCache(entry, now = Date.now()) {
 const age = now-entry?.fetchedAt
 return !!entry && age >= 0 && age < NEWS_CACHE_MS && Array.isArray(entry.items) && entry.items.length > 0 && normalizeHeadlines(entry.items,now).length === entry.items.length
}
export function headlineTime(value) { return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)) }
