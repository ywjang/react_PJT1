import { useEffect, useState } from 'react'
import { NEWS_CACHE_MS, NEWS_HOME, parseNewsFeed, normalizeHeadlines, validNewsCache, headlineTime } from '../news.js'
function cachedNews() { try { const value=JSON.parse(sessionStorage.getItem('campus-news'));return validNewsCache(value)?value:null } catch {return null} }
export default function NewsCard() {
 const [state,setState]=useState(()=>{const cached=cachedNews();return {phase:cached?'ready':'loading',items:cached?.items??[],fetchedAt:cached?.fetchedAt??null,error:''}})
 const [revision,setRevision]=useState(0)
 useEffect(()=>{
  const cached=cachedNews()
  if(revision===0&&cached){const timer=setTimeout(()=>{setState(s=>({...s,phase:'loading',error:''}));setRevision(v=>v+1)},Math.max(1000,NEWS_CACHE_MS-(Date.now()-cached.fetchedAt)));return ()=>clearTimeout(timer)}
  let active=true,timedOut=false;const controller=new AbortController();const timeout=setTimeout(()=>{timedOut=true;controller.abort()},15000)
  fetch('/news-feed',{signal:controller.signal,cache:'no-store',headers:{Accept:'application/rss+xml, application/xml'}})
   .then(r=>{if(!r.ok)throw new Error('뉴스를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.');return r.text()})
   .then(xml=>{const fetchedAt=Date.now(),items=parseNewsFeed(xml,fetchedAt);if(!active)return;try{sessionStorage.setItem('campus-news',JSON.stringify({items,fetchedAt}))}catch{/* Optional cache. */}setState({phase:'ready',items,fetchedAt,error:''})})
   .catch(e=>{if(active)setState(s=>({...s,phase:'error',items:normalizeHeadlines(s.items),error:timedOut?'뉴스 조회 시간이 초과되었습니다. 다시 시도해 주세요.':e instanceof TypeError?'뉴스 연결을 확인해 주세요.':e.message}))})
   .finally(()=>clearTimeout(timeout))
  const interval=setInterval(()=>{setState(s=>({...s,phase:'loading',error:''}));setRevision(v=>v+1)},NEWS_CACHE_MS)
  return ()=>{active=false;controller.abort();clearTimeout(timeout);clearInterval(interval)}
 },[revision])
 function refresh(){setState(s=>({...s,phase:'loading',error:''}));setRevision(v=>v+1)}
 return <section className="card life-card news-card" aria-labelledby="news-title" aria-busy={state.phase==='loading'}><div className="life-heading"><div><span className="section-eyebrow">세상 소식 한눈에</span><h3 id="news-title">오늘의 헤드라인</h3></div><button className="btn life-refresh" disabled={state.phase==='loading'} aria-label="뉴스 새로고침" onClick={refresh}>↻</button></div><p className="life-subtitle">한국시간 기준 오늘 발행된 주요 소식을 모았어요.</p>
 {state.phase==='loading'&&<p className="life-status" role="status"><span className="spinner-border spinner-border-sm" aria-hidden="true"/>헤드라인을 불러오고 있어요…</p>}
 {state.error&&<div className="life-error" role="alert">{state.error}{state.items.length>0&&' 아래는 이전에 확인한 오늘의 기사입니다.'}<button className="btn btn-outline-secondary btn-sm" onClick={refresh}>다시 시도</button></div>}
 {state.items.length>0&&<ol className="headline-list">{state.items.map((item,index)=><li key={item.link}><span className="headline-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><a className="headline-title" href={item.link} target="_blank" rel="noreferrer" title={item.title}>{item.title}<span className="visually-hidden"> 새 창에서 기사 보기</span></a><div className="headline-meta"><span>{item.publisher}</span><time dateTime={item.publishedAt}>{headlineTime(item.publishedAt)}</time></div></div></li>)}</ol>}
 {state.phase==='ready'&&state.items.length===0&&<p className="life-empty">오늘 발행된 기사가 아직 확인되지 않았어요. 전체 뉴스에서 최신 소식을 확인해 주세요.</p>}
 <div className="life-footer"><span>{state.fetchedAt?`${headlineTime(state.fetchedAt)} 조회 · Google 뉴스 RSS`:'Google 뉴스 RSS 연동'}</span><a href={NEWS_HOME} target="_blank" rel="noreferrer">전체 뉴스 보기 ↗</a></div></section>
}
