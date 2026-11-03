import { useEffect, useRef, useState } from 'react'
import { api, publicReadOnly } from './api.js'
import ServerAccess from './components/ServerAccess.jsx'
import TodayCalendar from './components/TodayCalendar.jsx'
import CurrentClock from './components/CurrentClock.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import MapCard from './components/MapCard.jsx'
import NewsCard from './components/NewsCard.jsx'
import FoodCard from './components/FoodCard.jsx'
import { CAMPUS_REGIONS, readRegion, rememberRegion } from './regions.js'
import { definitions, validate, display } from './academic.js'


function Icon({ type = 'students', className = '' }) {
 const paths = { students: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M21 20v-3a6 6 0 0 0-4-5"/></>, enrolled: <path d="m3 17 6-6 4 4 7-10m-6 0h6v6"/>, notEnrolled: <><circle cx="10" cy="8" r="3"/><path d="M4 20v-3a6 6 0 0 1 12 0v3m3-15 4 4m0-4-4 4"/></>, subjects: <><path d="M12 5C9 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/></>, cap: <><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v8"/></> }
 return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type] || paths.cap}</svg>
}

export default function App() {
 const [view, setView] = useState('dashboard')
 const [regionId, setRegionId] = useState(readRegion)
 const region = CAMPUS_REGIONS.find(item => item.id === regionId) ?? CAMPUS_REGIONS[0]
 function changeRegion(id) { if (rememberRegion(id)) setRegionId(id) }
 const [stats, setStats] = useState(null)
 const [connection, setConnection] = useState('확인 중')
 const [dashboardError, setDashboardError] = useState('')
 const [version, setVersion] = useState(0)
 const [notice, setNotice] = useState('')
 const [form, setForm] = useState(null)
 function navigate(next) { setView(next); setForm(null); setNotice('') }

 useEffect(() => {
  const controller = new AbortController()
  Promise.all([api.get('/dashboard', { signal: controller.signal }), api.get('/system', { signal: controller.signal })])
   .then(([d, s]) => { setStats(d.data); setConnection(s.data.connected ? (s.data.mode === 'oracle' ? '오라클 연결됨' : '실습 데이터 연결됨') : '연결 실패'); setDashboardError('') })
   .catch(e => { if (!controller.signal.aborted) { setStats(null); setConnection('연결 확인 필요'); setDashboardError(e.response?.data?.message || '서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인하세요.') } })
  return () => controller.abort()
 }, [version])

 const cards = [{ key: 'students', title: '전체 학생', description: '등록된 학생 수', color: 'blue' }, { key: 'enrolled', title: '수강 학생', description: '한 과목 이상 수강 중', color: 'green' }, { key: 'notEnrolled', title: '미수강 학생', description: '수강 내역이 없는 학생', color: 'red' }, { key: 'subjects', title: '전체 과목', description: '개설된 과목 수', color: 'purple' }]
 function openCreate(kind) { if(publicReadOnly){setNotice('공개 사이트는 조회 전용입니다. 등록·수정·삭제는 내부 시스템을 이용하세요.');return}setView(kind); setForm({ kind, values: {}, edit: false }); setNotice('') }
 const activeView = form?.kind === 'students' && !form.edit ? 'add' : view

 return <div className="app-shell">
  <header className="site-header"><div className="header-inner"><div className="brand"><span className="brand-mark"><Icon type="cap"/></span><div><h1>학사관리 시스템</h1><p>학생과 수업을 한곳에서 편리하게 관리하세요</p></div></div><CurrentClock/><div className="header-utilities"><span className="header-count"><Icon type="students"/><span>등록 학생 <strong>{stats?.students ?? '—'}</strong>명</span></span><TodayCalendar/></div></div></header>
  <main className="container academic-container"><nav className="nav nav-pills tabs" aria-label="주 메뉴">{[['dashboard','대시보드'],['students','학생 관리'],['add','학생 등록'],['subjects','과목 관리'],['enrolments','수강·성적 관리']].map(([id,label]) => <button key={id} className={'nav-link' + (id === activeView ? ' active' : '')} aria-current={id === activeView ? 'page' : undefined} onClick={() => id === 'add' ? openCreate('students') : navigate(id)}><Icon type={id === 'subjects' ? 'subjects' : id === 'students' ? 'students' : id === 'add' ? 'enrolled' : 'cap'}/><span>{label}</span></button>)}</nav>
   <section className={'welcome' + (view === 'dashboard' ? ' welcome-with-image' : '')}><div className="welcome-copy"><div><span className="welcome-eyebrow"><Icon type="cap"/>{view === 'dashboard' ? '배움이 즐거워지는 공간' : '캠퍼스 학사관리'}</span><h2>{view === 'dashboard' ? <>함께 배우고,<br className="d-sm-none"/> 더 크게 성장해요</> : definitions[view].title}</h2><p>{view === 'dashboard' ? '학생과 수업을 연결하는 우리들의 캠퍼스. 오늘의 학사 현황을 편하게 살펴보세요.' : definitions[view].description}</p>{view === 'dashboard' && <div className="hero-actions"><button className="btn btn-primary" onClick={() => navigate('students')}><Icon type="students"/>학생 둘러보기<span aria-hidden="true">→</span></button><button className="btn hero-secondary" onClick={() => openCreate('students')}>학생 등록하기</button></div>}</div></div>{view === 'dashboard' && <img className="welcome-illustration" src={`${import.meta.env.BASE_URL}images/academic-friends.png`} alt="책과 노트북으로 함께 공부하는 학생들" width="1536" height="1024" decoding="async" fetchPriority="high"/>}</section>
   <ServerAccess onChange={()=>setVersion(v=>v+1)}/>
   {publicReadOnly && <p className="alert alert-info" role="status">교육장 공개 조회 서비스 · 등록·수정·삭제는 허용하지 않습니다.</p>}
   {notice && <div className="alert alert-success notice" role="status">{notice}</div>}
   {dashboardError && <div className="alert alert-danger error" role="alert">{dashboardError} <button className="btn btn-outline-danger btn-sm" onClick={() => setVersion(v => v + 1)}>다시 연결</button></div>}
   {view === 'dashboard' ? <>


    <div className="dashboard-section-heading"><div><span className="section-eyebrow">우리 학교 한눈에</span><h3>한눈에 보는 학사 현황</h3></div><span className={'connection-pill' + (connection.endsWith('연결됨') ? ' connected' : '')}><span className="status-dot"/>{connection}</span></div><section className="row g-3 stats" aria-label="학사 현황">{cards.map(card => <div className="col-6 col-lg-3" key={card.key}><article className={'card stat-card h-100 stat-' + card.color}><div className="card-body"><div className="stat-top"><span>{card.title}</span><span className={'icon-bubble ' + card.color}><Icon type={card.key}/></span></div><div className="stat-value"><strong>{stats?.[card.key] ?? '—'}</strong><span>{card.key === 'subjects' ? '개' : '명'}</span></div><p>{card.description}</p></div></article></div>)}</section>
    <section className="card panel quick-panel"><div className="quick-heading"><div><span className="section-eyebrow">자주 쓰는 기능</span><h3>어떤 업무를 시작할까요?</h3></div><span className="quick-heading-note">필요한 업무로 바로 이동하세요</span></div><div className="row g-3 quick-grid">{[{type:'students',title:'전체 학생 조회',desc:'학생 정보를 검색하고 관리합니다',action:()=>navigate('students')},{type:'cap',title:'신규 학생 등록',desc:'새로운 학생 정보를 등록합니다',action:()=>openCreate('students')},{type:'subjects',title:'과목 관리',desc:'개설 과목과 담당교수를 관리합니다',action:()=>navigate('subjects')}].map((item,i)=><div className="col-12 col-md-4" key={item.title}><button className={'btn card quick-card h-100 w-100 quick-'+i} onClick={item.action}><span className="quick-icon"><Icon type={item.type}/></span><strong>{item.title}</strong><span className="quick-description">{item.desc}</span><span className="quick-arrow" aria-hidden="true">↗</span></button></div>)}</div></section>
    <div className="campus-life-section"><div className="life-section-heading"><span className="section-eyebrow">잠깐의 여유, 유용한 생활 정보</span><h3>캠퍼스 라이프</h3></div><WeatherCard city={region} onCityChange={changeRegion}/><div className="lifestyle-grid"><NewsCard/><FoodCard region={region} onRegionChange={changeRegion}/></div><MapCard region={region} onRegionChange={changeRegion}/></div>
    <div className="dashboard-note"><span className={'status-dot ' + (connection.endsWith('연결됨') ? 'online' : '')}/><span>학사 데이터 연결 {connection}</span><span>수강·미수강 구분은 수강 내역 유무를 기준으로 합니다.</span></div>
   </> : <Records key={view} kind={view} version={version} form={form} setForm={setForm} onCreate={()=>openCreate(view)} onSaved={message=>{setNotice(message);setForm(null);setVersion(v=>v+1)}}/>}
  </main>
  <footer><div><span>함께 만들어 가는 즐거운 캠퍼스</span><span>전체 학생 {stats?.students ?? '—'}명 · 수강 학생 {stats?.enrolled ?? '—'}명 · 과목 {stats?.subjects ?? '—'}개</span></div></footer>
 </div>
}

function Records({ kind, version, form, setForm, onCreate, onSaved }) {
 const def = definitions[kind]
 const [input, setInput] = useState('')
 const [query, setQuery] = useState('')
 const [page, setPage] = useState(0)
 const [data, setData] = useState(null)
 const [busy, setBusy] = useState(true)
 const [error, setError] = useState('')
 const [retry, setRetry] = useState(0)
 const [deleting, setDeleting] = useState(false)
 const [selected, setSelected] = useState(null)
 const [confirm, setConfirm] = useState(null)
 const lock = useRef(false)

 useEffect(() => {
  const c = new AbortController()
  api.get('/academic/' + kind, { params: { q: query, page, size: 10 }, signal: c.signal })
   .then(r=>{if(!c.signal.aborted){setData(r.data);setBusy(false);setError('')}})
   .catch(e=>{if(!c.signal.aborted){setBusy(false);setData(null);setError(e.response?.data?.message || '목록을 불러오지 못했습니다. 다시 시도하세요.')}})
  return ()=>c.abort()
 }, [kind, query, page, version, retry])

 async function remove() {
  if(lock.current)return
  lock.current=true;setDeleting(true);setError('')
  try {const row=confirm;await api.delete('/academic/'+kind+'/'+row[def.keys[0]],{params:kind==='enrolments'?{student:row.STU_NO}:{}});setConfirm(null);setSelected(null);setData(null);setBusy(true);setPage(0);setRetry(v=>v+1);onSaved('삭제했습니다.')}
  catch(e){setError(e.response?.data?.message || '삭제에 실패했습니다. 자료를 확인한 후 다시 시도하세요.')}
  finally{lock.current=false;setDeleting(false)}
 }

 return <section className="card panel records"><div className="section-head"><div><h3>{def.title}</h3><p className="muted record-summary">{data ? <>전체 <strong>{data.totalElements}</strong>건의 정보를 확인할 수 있어요.</> : '자료를 조회합니다'}</p></div><button className="btn btn-primary" onClick={onCreate}>＋ {def.singular} 등록</button></div>
  <form className="search" onSubmit={e=>{e.preventDefault();setBusy(true);setData(null);setPage(0);setQuery(input.trim());setRetry(v=>v+1)}}><label className="form-label mb-0" htmlFor="search">통합 검색</label><input className="form-control" id="search" value={input} maxLength={100} onChange={e=>setInput(e.target.value)} placeholder={def.search}/><button className="btn btn-primary">검색</button><button className="btn btn-outline-secondary" type="button" onClick={()=>{setBusy(true);setData(null);setInput('');setQuery('');setPage(0);setRetry(v=>v+1)}}>초기화</button></form>
  {error && <div className="alert alert-danger error" role="alert">{error}<button className="btn btn-outline-danger btn-sm" onClick={()=>{setBusy(true);setRetry(v=>v+1)}}>다시 조회</button></div>}
  {busy && <p className="loading-status" role="status"><span className="spinner-border spinner-border-sm text-primary" aria-hidden="true"/>자료를 불러오는 중입니다…</p>}
  {data && <><div className="table-responsive"><table className="table table-hover align-middle mb-0"><caption className="visually-hidden">{def.title} 목록</caption><thead><tr>{def.columns.map(f=><th key={f.key}>{f.label}</th>)}<th>관리</th></tr></thead><tbody>{data.content.map(row=><tr key={def.keys.map(k=>row[k]).join('-')}>{def.columns.map(f=><td key={f.key}>{f.key === 'STU_NAME' ? <span className="person-cell"><span className="student-avatar" aria-hidden="true">{String(row[f.key] ?? '').slice(0,1) || '·'}</span>{display(f.key,row[f.key])}</span> : ['STU_DEPT','SUB_DEPT'].includes(f.key) ? <span className="department-tag">{display(f.key,row[f.key])}</span> : f.key === 'ENR_GRADE' ? <span className={'score-badge' + (Number(row[f.key]) >= 90 ? ' excellent' : '')}>{display(f.key,row[f.key])}</span> : display(f.key,row[f.key])}</td>)}<td><div className="row-actions d-flex gap-1"><button className="btn btn-outline-secondary btn-sm" onClick={()=>setSelected(row)}>상세</button><button className="btn btn-outline-primary btn-sm" onClick={()=>{setForm({kind,values:row,edit:true});setError('')}}>수정</button><button className="btn btn-outline-danger btn-sm" onClick={()=>setConfirm(row)}>삭제</button></div></td></tr>)}</tbody></table></div>{data.content.length===0 && <p className="empty">검색 결과가 없습니다.</p>}<nav className="academic-pagination" aria-label="목록 페이지"><span>전체 {data.totalElements}건 · {data.totalPages ? page+1 : 0} / {data.totalPages}쪽</span><ul className="pagination pagination-sm mb-0"><li className={'page-item'+(busy||page===0?' disabled':'')}><button className="page-link" disabled={busy||page===0} onClick={()=>{setBusy(true);setData(null);setPage(p=>p-1)}}>이전</button></li><li className={'page-item'+(busy||page+1>=data.totalPages?' disabled':'')}><button className="page-link" disabled={busy||page+1>=data.totalPages} onClick={()=>{setBusy(true);setData(null);setPage(p=>p+1)}}>다음</button></li></ul></nav></>}
  {form?.kind===kind && <Editor key={JSON.stringify(form)} def={def} form={form} onClose={()=>setForm(null)} onSaved={onSaved}/>}
  {selected && <Modal title={def.singular+' 상세'} onClose={()=>setSelected(null)}><dl className="details">{def.columns.map(f=><div key={f.key}><dt>{f.label}</dt><dd>{display(f.key,selected[f.key])}</dd></div>)}</dl><button className="btn btn-outline-secondary" onClick={()=>setSelected(null)}>닫기</button></Modal>}
  {confirm && <Modal title={def.singular+' 삭제'} onClose={()=>{if(!deleting)setConfirm(null)}}><p>선택한 {def.singular} 자료를 삭제하시겠습니까?</p><p className="muted">{def.keys.map(k=>confirm[k]).join(' / ')} · 삭제한 자료는 되돌릴 수 없습니다.</p><div className="form-actions"><button className="btn btn-outline-secondary" disabled={deleting} onClick={()=>setConfirm(null)}>취소</button><button disabled={deleting} className="btn btn-danger" onClick={remove}>{deleting?'삭제 중…':'삭제'}</button></div>{error && <p role="alert" className="invalid-feedback d-block">{error}</p>}</Modal>}
 </section>
}

function Editor({ def, form, onClose, onSaved }) {
 const [values,setValues]=useState(form.values)
 const [errors,setErrors]=useState({})
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const lock=useRef(false)
 const groups=form.kind==='students' ? [
  {title:'기본 정보',note:'학생을 구분하는 필수 정보예요.',fields:def.fields.filter(f=>!f.optional)},
  {title:'추가 정보',note:'필요한 경우에만 입력해 주세요.',fields:def.fields.filter(f=>f.optional)},
 ] : [{title:form.kind==='subjects'?'과목 정보':'수강 정보',note:form.kind==='subjects'?'수업과 담당교수 정보를 입력해 주세요.':'등록된 학번과 과목번호를 입력해 주세요.',fields:def.fields}]

 async function submit(e){
  e.preventDefault();if(lock.current)return
  const next=validate(form.kind,values);setErrors(next);if(Object.keys(next).length)return
  lock.current=true;setBusy(true);setError('')
  try {await api[form.edit?'put':'post']('/academic/'+form.kind,values);onSaved(form.edit?'수정했습니다.':'등록했습니다.')}
  catch(e){setError(e.response?.data?.message||'저장 결과를 확인하지 못했습니다. 목록에서 반영 여부를 확인한 후 다시 시도하세요.')}
  finally{lock.current=false;setBusy(false)}
 }

 return <Modal title={def.singular+(form.edit?' 수정':' 등록')} onClose={()=>{if(!busy)onClose()}}><form noValidate onSubmit={submit}><p className="form-intro"><span className="intro-dot"/>별표(*)는 필수 입력입니다. {form.edit && '식별 번호는 변경할 수 없습니다.'}</p><fieldset disabled={busy}>{groups.map(group=><section className="form-section" key={group.title} aria-label={group.title}><div className="form-section-heading"><h4>{group.title}</h4><p>{group.note}</p></div><div className="row g-3 form-grid">{group.fields.map(f=><label className="col-12 col-sm-6 field-label" key={f.key} htmlFor={'field-'+f.key}><span className="field-caption">{f.label}{f.optional ? <small className="optional-mark">선택</small> : <span className="required-mark" aria-hidden="true"> *</span>}</span>{f.key==='STU_GENDER'?<select required={!f.optional} className={'form-select'+(errors[f.key]?' is-invalid':'')} id={'field-'+f.key} aria-describedby={errors[f.key]?'error-'+f.key:undefined} value={values[f.key]??''} aria-invalid={!!errors[f.key]} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}><option value="">선택하세요</option><option value="M">남성</option><option value="F">여성</option></select>:<input required={!f.optional} className={'form-control'+(errors[f.key]?' is-invalid':'')} autoFocus={f===def.fields[0]} id={'field-'+f.key} type={f.type||'text'} min={f.min} max={f.max} step={f.step||1} maxLength={f.maxLength} readOnly={form.edit&&def.keys.includes(f.key)} value={values[f.key]??''} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?'error-'+f.key:undefined} onChange={e=>{setValues(v=>({...v,[f.key]:e.target.value}));setErrors(v=>({...v,[f.key]:''}))}}/>}{errors[f.key] && <small id={'error-'+f.key} className="invalid-feedback d-block">{errors[f.key]}</small>}</label>)}</div></section>)}{error && <p className="alert alert-danger error" role="alert">{error}</p>}<div className="form-actions"><button className="btn btn-outline-secondary" type="button" onClick={onClose}>취소</button><button className="btn btn-primary">{busy?'저장 중…':'저장'}</button></div></fieldset></form></Modal>
}

function Modal({ title, onClose, children }) {
 const ref=useRef(null)
 useEffect(()=>{const previous=document.activeElement;ref.current?.focus();return ()=>previous?.focus()},[])
 function keys(e){if(e.key==='Escape'){onClose();return}if(e.key==='Tab'){const nodes=ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)');const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}}
 return <div className="modal d-block academic-modal"><div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><section ref={ref} tabIndex={-1} className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" onKeyDown={keys}><div className="modal-header"><h3 className="modal-title" id="modal-title">{title}</h3><button type="button" className="btn-close" aria-label="닫기" onClick={onClose}/></div><div className="modal-body">{children}</div></section></div></div>
}

