'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, CalendarDays, Clock3, RefreshCw, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';

type Row = {
 id:string; weekday:number; start_time:string; end_time:string; active?:boolean; note?:string|null;
 class_id?:string|null; class_name?:string|null; class_level?:string|null; class_code?:string|null;
 teacher_name?:string|null; room_name?:string|null;
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
 const [session,setSession]=useState<SessionKey>('morning'),[rows,setRows]=useState<Row[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async(refresh=false)=>{
  if(refresh)setBusy(true);else setLoading(true);setError('');
  const client=getClient();
  if(!client){setError('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong Environment Variables của Vercel.');setLoading(false);setBusy(false);return;}
  try{
   const {data,error}=await client.from('public_timetable').select('id,weekday,start_time,end_time,active,note,class_id,class_name,class_level,class_code,teacher_name,room_name').order('weekday').order('start_time');
   if(error)throw error;setRows(((data||[]) as unknown as Row[]).filter(r=>r.active!==false));
  }catch(e){setError('Không tải được thời khóa biểu: '+(e instanceof Error?e.message:'Lỗi kết nối Supabase.'));setRows([]);}
  finally{setLoading(false);setBusy(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 const visible=useMemo(()=>rows.filter(r=>{const m=mins(r.start_time);return session==='morning'?m>=300&&m<720:session==='afternoon'?m>=720&&m<1020:m>=1020&&m<1440;}).sort((a,b)=>a.weekday-b.weekday||mins(a.start_time)-mins(b.start_time)),[rows,session]);
 const current=SESSIONS.find(s=>s.key===session)!;const Icon=current.icon;
 return <main className="tkb">
 <style>{`
 *{box-sizing:border-box}body{margin:0;background:#f3f6fb;color:#142b4d;font-family:Arial,Helvetica,sans-serif}
 .tkb{min-height:100vh;padding:26px 20px 42px;background:linear-gradient(180deg,#eaf2ff 0,#f5f7fb 260px)}.wrap{max-width:1450px;margin:auto}
 .top{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:24px}.brand{display:flex;align-items:center;gap:12px}.logo{width:46px;height:46px;border-radius:14px;background:#173f78;color:white;display:grid;place-items:center}
 h1{font-size:clamp(24px,3vw,34px);font-weight:800;margin:0;color:#173f78}.subtitle{color:#5e708a;font-size:14px;margin:7px 0 0}
 .link{border:1px solid #d7e2f0;background:#fff;border-radius:11px;padding:10px 13px;color:#173f78;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
 .tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0 18px}.tab{display:flex;align-items:center;gap:13px;text-align:left;border:1px solid #dce5f2;background:#fff;color:#234368;padding:16px;border-radius:16px;cursor:pointer;box-shadow:0 3px 12px #1a3e6b0a}.tab.active{background:#173f78;color:#fff;border-color:#173f78}
 .tabicon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#edf4ff;color:#1c5ca7;flex-shrink:0}.tab.active .tabicon{background:#ffffff25;color:#fff}
 .tab strong{display:block;font-size:17px}.tab small{display:block;margin-top:5px;opacity:.8;font-size:12px}
 .summary{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;background:#fff;border:1px solid #e1e8f2;border-radius:16px;padding:18px 20px;margin-bottom:16px}.summary h2{margin:0;font-size:20px;display:flex;align-items:center;gap:9px}.summary p{margin:6px 0 0;color:#687b94;font-size:13px}.count{border-radius:999px;background:#eaf3ff;color:#1b5795;padding:8px 12px;font-size:13px;font-weight:800}
 .grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;align-items:start}.day{min-width:0;background:#fff;border:1px solid #e0e7f0;border-radius:14px;overflow:hidden}.dayhead{background:#f8fbff;border-bottom:1px solid #e8eef6;padding:13px 8px;text-align:center;font-weight:800;color:#234368}.dayhead small{display:block;font-size:11px;font-weight:500;color:#8090a6;margin-top:4px}
 .daybody{padding:8px;display:grid;gap:8px;min-height:100px}.classcard{border:1px solid #d6e3f4;background:#f7faff;border-radius:11px;padding:11px 9px;min-width:0}.time{font-size:12px;font-weight:800;color:#1d5797;white-space:nowrap}.classname{font-size:13px;font-weight:800;line-height:1.35;margin:7px 0 5px;overflow-wrap:anywhere;color:#162f52}.meta{font-size:11px;line-height:1.45;color:#657993;overflow-wrap:anywhere}.empty{font-size:12px;text-align:center;color:#a0adbd;padding:18px 4px}
 .message,.error{background:#fff;border:1px solid #e0e7f0;border-radius:14px;padding:24px;color:#63758d}.error{color:#a62929;background:#fff0f0;border-color:#ffd4d4;overflow-wrap:anywhere}.footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#71829a;font-size:12px;margin-top:18px}
 @media(max-width:1050px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:650px){.tkb{padding:16px 10px 28px}.top{align-items:flex-start}.link{font-size:12px;padding:9px}.logo{width:40px;height:40px}.subtitle{font-size:12px;line-height:1.45}.tabs{gap:7px;margin-top:16px}.tab{padding:10px 8px;flex-direction:column;align-items:flex-start;gap:7px;border-radius:12px}.tabicon{width:32px;height:32px}.tab strong{font-size:13px}.tab small{font-size:10px;line-height:1.3}.summary{padding:14px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.dayhead{padding:10px 5px}.daybody{padding:6px}.classcard{padding:9px 8px}.time{font-size:11px}.classname{font-size:12px}}
 `}</style>
 <div className="wrap">
  <header className="top"><div className="brand"><div className="logo"><CalendarDays size={25}/></div><div><h1>Thời khóa biểu</h1><p className="subtitle">Trung Tâm Tiếng Anh | Ms Thúy Nga</p></div></div><a className="link" href="/"><ArrowLeft size={16}/> Trang chủ</a></header>
  <nav className="tabs" aria-label="Chọn buổi học">{SESSIONS.map(s=>{const I=s.icon;const count=rows.filter(r=>{const m=mins(r.start_time);return s.key==='morning'?m>=300&&m<720:s.key==='afternoon'?m>=720&&m<1020:m>=1020&&m<1440;}).length;return <button key={s.key} className={'tab '+(session===s.key?'active':'')} onClick={()=>setSession(s.key)} aria-pressed={session===s.key}><span className="tabicon"><I size={21}/></span><span><strong>{s.label}</strong><small>{s.time} · {count} lịch học</small></span></button>;})}</nav>
  <section className="summary"><div><h2><Icon size={22}/>{current.label}</h2><p>{current.desc} Chọn một buổi để xem nhanh lịch các lớp theo thứ trong tuần.</p></div><span className="count">{visible.length} lịch học</span></section>
  {loading?<div className="message">Đang tải thời khóa biểu...</div>:error?<div className="error"><AlertCircle size={18} style={{verticalAlign:'middle',marginRight:8}}/>{error}<div style={{marginTop:12}}><button className="link" disabled={busy} onClick={()=>void load(true)}><RefreshCw size={15}/> Thử tải lại</button></div></div>:<section className="grid" aria-label={`${current.label} theo thứ trong tuần`}>{DAYS.map(d=>{const dayRows=visible.filter(r=>Number(r.weekday)===d.value);return <div className="day" key={d.value}><div className="dayhead">{d.label}<small>{dayRows.length} lớp</small></div><div className="daybody">{dayRows.map(r=><article className="classcard" key={r.id}><div className="time"><Clock3 size={12} style={{display:'inline',verticalAlign:'-2px',marginRight:4}}/>{tm(r.start_time)} – {tm(r.end_time)}</div><div className="classname">{r.class_name||'Chưa có tên lớp'}</div>{r.class_code&&<div className="meta">Mã lớp: {r.class_code}</div>}{r.class_level&&<div className="meta">{r.class_level}</div>}<div className="meta">{r.room_name||'Chưa xếp phòng'}{r.teacher_name?' · '+r.teacher_name:''}</div></article>)}{!dayRows.length&&<div className="empty">Không có lớp</div>}</div></div>;})}</section>}
  <footer className="footer"><span>Thời khóa biểu lấy dữ liệu trực tiếp từ lịch học của trung tâm.</span><a className="link" href="/admin">Đăng nhập quản trị</a></footer>
 </div></main>;
}
