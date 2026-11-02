import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeHeadlines,safeNewsUrl,validNewsCache,NEWS_CACHE_MS} from '../src/news.js'
import {foodSearchTerm,FOOD_CATEGORIES} from '../src/food.js'
const now=Date.parse('2026-10-30T14:00:00+09:00')
const item=(values={})=>({title:'오늘의 소식 - 언론사',link:'https://news.google.com/rss/articles/test',publisher:'언론사',publishedAt:'2026-10-30T03:00:00Z',...values})
test('한국시간 오늘 기사만 포함하고 언론사 접미사와 중복 링크 정리',()=>{const list=normalizeHeadlines([item(),item(),item({link:'https://news.google.com/old',publishedAt:'2026-10-29T14:59:00Z'}),item({link:'https://news.google.com/early',publishedAt:'2026-10-29T15:00:00Z'})],now);assert.equal(list.length,2);assert.equal(list[0].title,'오늘의 소식');assert.equal(list[1].publishedAt,'2026-10-29T15:00:00.000Z')})
test('잘못된 날짜·미래 기사·비HTTPS·인증정보 포함 링크 거절',()=>{assert.equal(normalizeHeadlines([item({publishedAt:'bad'}),item({publishedAt:'2026-10-31T00:00:00Z'}),item({link:'javascript:alert(1)'})],now).length,0);assert.equal(safeNewsUrl('https://user:password@example.com'),null);assert.equal(safeNewsUrl('http://example.com'),null)})
test('기사 최대5개와 캐시10분·자정 유효성 확인',()=>{const list=normalizeHeadlines(Array.from({length:8},(_,i)=>item({link:'https://news.google.com/'+i})),now);assert.equal(list.length,5);assert.equal(validNewsCache({items:list,fetchedAt:now-1000},now),true);assert.equal(validNewsCache({items:list,fetchedAt:now-NEWS_CACHE_MS},now),false);const midnight=Date.parse('2026-10-31T00:00:01+09:00');assert.equal(validNewsCache({items:list,fetchedAt:midnight-2000},midnight),false)})
test('맛집 검색은 선택 지역과 메뉴를 사용하며 가짜 식당이나 평점을 만들지 않음',()=>{assert.equal(FOOD_CATEGORIES.length,6);assert.equal(foodSearchTerm({name:'부산'},'korean'),'부산 한식 맛집');assert.equal(foodSearchTerm({name:'서울'},'cafe',true),'서울 가성비 카페 추천');assert.throws(()=>foodSearchTerm({name:'서울'},'missing'))})
