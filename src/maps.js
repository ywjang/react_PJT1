function coordinates(region) {
 const { latitude, longitude } = region ?? {}
 if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 85 || typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new Error('지도 좌표를 확인하세요.')
 return { latitude, longitude }
}
export function mapEmbedUrl(region) {
 const { latitude, longitude } = coordinates(region)
 const bbox = [Math.max(-180,longitude-.035),Math.max(-85,latitude-.025),Math.min(180,longitude+.035),Math.min(85,latitude+.025)].map(value=>Number(value.toFixed(6))).join(',')
 return 'https://www.openstreetmap.org/export/embed.html?' + new URLSearchParams({ bbox, layer:'mapnik', marker:`${latitude},${longitude}` })
}
export function mapLargeUrl(region) {
 const { latitude, longitude } = coordinates(region)
 return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`
}
export function kakaoMapUrl(region, direction = false) {
 const { latitude, longitude } = coordinates(region)
 return `https://map.kakao.com/link/${direction?'to':'map'}/${encodeURIComponent(region.name + ' 중심지')},${latitude},${longitude}`
}
export function mapSearchUrl(query) {
 const clean = String(query ?? '').trim()
 if (!clean || clean.length > 100) throw new Error('검색어는 1~100자로 입력하세요.')
 return 'https://map.kakao.com/link/search/' + encodeURIComponent(clean)
}
