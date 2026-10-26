'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, CalendarDays, Clock3, RefreshCw, Sun, Sunset, Moon, AlertCircle, Image as ImageIcon, Printer } from 'lucide-react';

type Row = {
 id:string; weekday:number; start_time:string; end_time:string; active?:boolean; note?:string|null;
 classes?:{id?:string;name?:string;level?:string|null;class_code?:string|null}|null;
 teachers?:{full_name?:string}|null; rooms?:{name?:string}|null;
};
type SessionKey='morning'|'afternoon'|'evening';
const DAYS=[{value:1,label:'Thứ 2'},{value:2,label:'Thứ 3'},{value:3,label:'Thứ 4'},{value:4,label:'Thứ 5'},{value:5,label:'Thứ 6'},{value:6,label:'Thứ 7'},{value:7,label:'Chủ nhật'}];
const SESSIONS:{key:SessionKey;label:string;time:string;icon:any;desc:string}[]=[
 {key:'morning',label:'Buổi sáng',time:'05:00–12:00',icon:Sun,desc:'Các lớp bắt đầu trước 12:00.'},
 {key:'afternoon',label:'Buổi chiều',time:'12:00–17:00',icon:Sunset,desc:'Các lớp bắt đầu từ 12:00 đến trước 17:00.'},
 {key:'evening',label:'Buổi tối',time:'17:00–23:59',icon:Moon,desc:'Các lớp bắt đầu từ 17:00 trở đi.'}
];
const mins=(v:string)=>{const [h,m]=(v||'00:00').slice(0,5).split(':').map(Number);return h*60+m;};
const tm=(v:string)=>(v||'').slice(0,5);
function getClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?createClient(url,key):null;}

export default function TimetablePage(){
 const [rows,setRows]=useState<Row[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [effectiveDate,setEffectiveDate]=useState('2026-10-01');
 const [updatedAt,setUpdatedAt]=useState('');
 const [exporting,setExporting]=useState(false);
 useEffect(()=>{ try { const saved=window.localStorage.getItem('thuynga-tkb-effective-date'); if(saved) setEffectiveDate(saved); } catch {} setUpdatedAt(new Date().toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})); },[]);
 const exportImage=async()=>{ const target=document.getElementById('timetable-export-area'); if(!target)return; setExporting(true); try { const html2canvas=(await import('html2canvas')).default; const canvas=await html2canvas(target,{backgroundColor:'#f3f6fb',scale:2,useCORS:true,logging:false,onclone:(doc)=>{doc.querySelectorAll('.no-export').forEach(el=>{(el as HTMLElement).style.display='none';});}}); const link=document.createElement('a'); link.download=`thoi-khoa-bieu-hieu-luc-${effectiveDate||'chua-xac-dinh'}.png`; link.href=canvas.toDataURL('image/png'); link.click(); } catch(e) { alert('Chưa xuất được hình ảnh. Hãy cài thư viện bằng lệnh: npm install html2canvas'); } finally {setExporting(false);} };
 const saveEffectiveDate=(value:string)=>{setEffectiveDate(value);try{window.localStorage.setItem('thuynga-tkb-effective-date',value);}catch{}};
 const load=useCallback(async(refresh=false)=>{
  if(refresh)setBusy(true);else setLoading(true);setError('');
  const client=getClient();
  if(!client){setError('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong Environment Variables của Vercel.');setLoading(false);setBusy(false);return;}
  try{
   const {data,error}=await client.from('schedules').select('id,weekday,start_time,end_time,active,note,classes(id,name,level,class_code),teachers(full_name),rooms(name)').order('weekday').order('start_time');
   if(error)throw error;setRows(((data||[]) as unknown as Row[]).filter(r=>r.active!==false));
  }catch(e){setError('Không tải được thời khóa biểu: '+(e instanceof Error?e.message:'Lỗi kết nối Supabase.'));setRows([]);}
  finally{setLoading(false);setBusy(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 const bySession=useMemo(()=>Object.fromEntries(SESSIONS.map(s=>[s.key,rows.filter(r=>{const m=mins(r.start_time);return s.key==='morning'?m>=300&&m<720:s.key==='afternoon'?m>=720&&m<1020:m>=1020&&m<1440;}).sort((a,b)=>a.weekday-b.weekday||mins(a.start_time)-mins(b.start_time))])) as Record<SessionKey,Row[]>,[rows]);
 return <main className="tkb">
 <style>{`
 *{box-sizing:border-box}body{margin:0;background:#f3f6fb;color:#142b4d;font-family:Arial,Helvetica,sans-serif}
 .tkb{min-height:100vh;padding:26px 20px 42px;background:linear-gradient(180deg,#eaf2ff 0,#f5f7fb 260px)}.wrap{max-width:1450px;margin:auto}
 .top{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:24px}.brand{display:flex;align-items:center;gap:12px}.logo{width:46px;height:46px;border-radius:14px;background:#173f78;color:white;display:grid;place-items:center}
 h1{font-size:clamp(24px,3vw,34px);font-weight:800;margin:0;color:#173f78}.subtitle{color:#5e708a;font-size:14px;margin:7px 0 0}
 .link{border:1px solid #d7e2f0;background:#fff;border-radius:11px;padding:10px 13px;color:#173f78;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
 .session{margin:22px 0 26px}.summary{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;background:#fff;border:1px solid #e1e8f2;border-radius:16px;padding:16px 20px;margin-bottom:12px;border-left:5px solid #1d5797}.summary h2{margin:0;font-size:20px;display:flex;align-items:center;gap:9px}.summary p{margin:6px 0 0;color:#687b94;font-size:13px}.count{border-radius:999px;background:#eaf3ff;color:#1b5795;padding:8px 12px;font-size:13px;font-weight:800}
 .grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;align-items:start}.day{min-width:0;background:#fff;border:1px solid #e0e7f0;border-radius:14px;overflow:hidden}.dayhead{background:#f8fbff;border-bottom:1px solid #e8eef6;padding:13px 8px;text-align:center;font-weight:800;color:#234368}.dayhead small{display:block;font-size:11px;font-weight:500;color:#8090a6;margin-top:4px}
 .daybody{padding:8px;display:grid;gap:8px;min-height:100px}.classcard{border:1px solid #d6e3f4;background:#f7faff;border-radius:11px;padding:11px 9px;min-width:0}.time{font-size:12px;font-weight:800;color:#1d5797;white-space:nowrap}.classname{font-size:13px;font-weight:800;line-height:1.35;margin:7px 0 5px;overflow-wrap:anywhere;color:#162f52}.meta{font-size:11px;line-height:1.45;color:#657993;overflow-wrap:anywhere}.empty{font-size:12px;text-align:center;color:#a0adbd;padding:18px 4px}
 .message,.error{background:#fff;border:1px solid #e0e7f0;border-radius:14px;padding:24px;color:#63758d}.error{color:#a62929;background:#fff0f0;border-color:#ffd4d4;overflow-wrap:anywhere}.footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#71829a;font-size:12px;margin-top:18px}.bottom-bar{display:grid;grid-template-columns:minmax(240px,1fr) auto auto auto;gap:12px;align-items:stretch;margin-top:20px}.effective{display:flex;align-items:center;gap:12px;background:#f5fff8;border:1px solid #cdebd8;border-radius:13px;padding:13px 16px;color:#17643a}.effective-icon{width:40px;height:40px;flex:0 0 40px;border-radius:50%;display:grid;place-items:center;background:#d9f7e5}.effective strong{display:block;font-size:13px;margin-bottom:4px}.effective small{display:block;color:#4b6658;font-size:12px;line-height:1.4}.action{border:1px solid #d9e4f2;border-radius:12px;background:#fff;color:#173f78;display:flex;align-items:center;gap:10px;padding:12px 16px;font-weight:800;cursor:pointer;text-align:left;white-space:nowrap}.action.primary{background:#2463eb;color:#fff;border-color:#2463eb}.action:disabled{opacity:.65;cursor:wait}.action small{display:block;font-size:11px;font-weight:500;opacity:.85;margin-top:4px}.updated{align-self:center;color:#6d7f98;font-size:12px;white-space:nowrap}.date-input{border:0;background:transparent;color:#17643a;font:inherit;font-size:12px;max-width:145px;padding:0;outline-offset:2px}.export-area{background:linear-gradient(180deg,#eaf2ff 0,#f5f7fb 260px);padding:1px 0 18px;border-radius:16px}
 @media(max-width:1050px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:1100px){.bottom-bar{grid-template-columns:1fr 1fr}.effective{grid-column:1/-1}.updated{justify-self:start}}@media(max-width:650px){.tkb{padding:16px 10px 28px}.top{align-items:flex-start}.link{font-size:12px;padding:9px}.logo{width:40px;height:40px}.subtitle{font-size:12px;line-height:1.45}.summary{padding:14px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.dayhead{padding:10px 5px}.daybody{padding:6px}.classcard{padding:9px 8px}.time{font-size:11px}.classname{font-size:12px}.bottom-bar{grid-template-columns:1fr}.effective{grid-column:auto}.action{width:100%;justify-content:flex-start}.updated{white-space:normal}}@media print{.no-export{display:none!important}.tkb{padding:0;background:#fff}.export-area{background:#fff}.session{break-inside:avoid;margin:12px 0}.grid{grid-template-columns:repeat(7,minmax(0,1fr))}.bottom-bar{grid-template-columns:1fr}.action{display:none!important}}
 `}</style>
 <div className="wrap">
  <div id="timetable-export-area" className="export-area">
  <header className="top"><div className="brand"><div className="logo"><CalendarDays size={25}/></div><div><h1>Thời khóa biểu</h1><p className="subtitle">Trung Tâm Tiếng Anh | Ms Thúy Nga</p></div></div><a className="link" href="/"><ArrowLeft size={16}/> Trang chủ</a></header>
  {loading?<div className="message">Đang tải thời khóa biểu...</div>:error?<div className="error"><AlertCircle size={18} style={{verticalAlign:'middle',marginRight:8}}/>{error}<div style={{marginTop:12}}><button className="link" disabled={busy} onClick={()=>void load(true)}><RefreshCw size={15}/> Thử tải lại</button></div></div>:SESSIONS.map(s=>{const Icon=s.icon;const visible=bySession[s.key];return <section className="session" key={s.key}><div className="summary"><div><h2><Icon size={22}/>{s.label}</h2><p>{s.time} · {s.desc}</p></div><span className="count">{visible.length} lịch học</span></div><div className="grid" aria-label={`${s.label} theo thứ trong tuần`}>{DAYS.map(d=>{const dayRows=visible.filter(r=>Number(r.weekday)===d.value);return <div className="day" key={d.value}><div className="dayhead">{d.label}<small>{dayRows.length} lớp</small></div><div className="daybody">{dayRows.map(r=><article className="classcard" key={r.id}><div className="time"><Clock3 size={12} style={{display:'inline',verticalAlign:'-2px',marginRight:4}}/>{tm(r.start_time)} – {tm(r.end_time)}</div><div className="classname">{r.classes?.name||'Lớp học'}</div>{r.classes?.class_code&&<div className="meta">Mã lớp: {r.classes.class_code}</div>}{r.classes?.level&&<div className="meta">{r.classes.level}</div>}<div className="meta">{r.rooms?.name||'Chưa xếp phòng'}{r.teachers?.full_name?' · '+r.teachers.full_name:''}</div></article>)}{!dayRows.length&&<div className="empty">Không có lớp</div>}</div></div>;})}</div></section>;})}
  <div className="bottom-bar">
   <div className="effective"><div className="effective-icon"><CalendarDays size={20}/></div><div><strong>Thời khóa biểu hiện tại</strong><small>Áp dụng từ ngày <input className="date-input" aria-label="Ngày hiệu lực thời khóa biểu" type="date" value={effectiveDate} onChange={e=>saveEffectiveDate(e.target.value)}/> cho đến khi có thông báo mới.</small></div></div>
   <button className="action primary no-export" onClick={()=>void exportImage()} disabled={exporting||loading||!!error}><ImageIcon size={22}/><span>{exporting?'Đang xuất ảnh...':'Xuất ảnh thời khóa biểu'}<small>Tải về ảnh PNG</small></span></button>
   <button className="action no-export" onClick={()=>window.print()}><Printer size={22}/><span>In thời khóa biểu<small>Mở hộp thoại in</small></span></button>
   <div className="updated"><RefreshCw size={13} style={{display:'inline',verticalAlign:'-2px',marginRight:6}}/>Cập nhật lần cuối: {updatedAt||'Đang cập nhật'}</div>
  </div>
  </div>
  <footer className="footer"><span>Thời khóa biểu lấy dữ liệu trực tiếp từ lịch học của trung tâm.</span><a className="link no-export" href="/admin">Đăng nhập quản trị</a></footer>
 </div></main>;
}
