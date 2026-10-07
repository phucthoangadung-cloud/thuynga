'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ChangeEvent } from 'react';
import { LayoutDashboard, BookOpen, Users, CalendarDays, ClipboardCheck, Wallet, UserRound, BarChart3, FileSpreadsheet, Menu, Plus, Search, LogOut, Pencil, Trash2, X, Download, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

type Teacher={id:string;full_name:string;phone?:string|null;email?:string|null;status?:string|null;created_at?:string|null};
type Room={id:string;name:string;capacity:number};
type ClassRow={id:string;class_code:string|null;name:string;level:string|null;teacher_id:string|null;room_id:string|null;start_date:string|null;end_date:string|null;schedule_text:string|null;tuition:number;capacity:number;status:'active'|'upcoming'|'finished';teachers?:Teacher|null;rooms?:Room|null};

const nav: Array<[string, ComponentType<any>]> = [['Dashboard',LayoutDashboard],['Lớp học',BookOpen],['Học viên',Users],['Lịch học',CalendarDays],['Điểm danh',ClipboardCheck],['Học phí',Wallet],['Giáo viên',UserRound],['Báo cáo',BarChart3],['Import / Export',FileSpreadsheet]];

export default function Home(){
  const [session,setSession]=useState<any>(null); const [loadingAuth,setLoadingAuth]=useState(true); const [tab,setTab]=useState('Dashboard'); const [mobile,setMobile]=useState(false);
  const client=supabase();
  useEffect(()=>{client.auth.getSession().then(({data})=>{setSession(data.session);setLoadingAuth(false)}); const {data:{subscription}}=client.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe()},[]);
  if(loadingAuth) return <div style={{minHeight:'100vh',display:'grid',placeItems:'center'}}>Đang tải...</div>;
  if(!session) return <Login/>;
  return <>
    <style>{`
      *{box-sizing:border-box}
      html,body{margin:0;padding:0;max-width:100%;overflow-x:hidden}
      body{background:#f5f7fb}
      .desktop-grid{width:100%;min-width:0}
      .sidebar{position:sticky;top:0;height:100vh;overflow-y:auto;background:#101828;color:#fff}
      .navitem{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:9px;margin:3px 0;cursor:pointer;color:#e5e7eb}
      .navitem.active{background:#2563eb;color:#fff}
      .mobilebar{display:none}
      .content{width:100%;min-width:0}
      .card{max-width:100%;min-width:0}
      .table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .table{width:100%;min-width:760px;border-collapse:collapse}
      .input{max-width:100%}
      .modal-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(16,24,40,.55);overflow:auto}
      .modal{width:min(680px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:20px}
      .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
      .form-grid label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#344054}
      @media (max-width: 1100px){
        .desktop-grid{grid-template-columns:210px 1fr!important}
        .content{padding:22px!important}
        .stats{grid-template-columns:repeat(2,1fr)!important}
      }
      @media (max-width: 820px) and (orientation: landscape){
        .desktop-grid{grid-template-columns:190px 1fr!important}
        .sidebar{display:none!important}
        .mobilebar{display:flex!important;position:sticky;top:0;z-index:900;height:58px;padding:8px 12px;align-items:center;gap:10px;background:#101828;color:#fff}
        .mobilebar>.btn{display:flex!important;align-items:center;justify-content:center}
        .mobilemenu{position:absolute;left:8px;top:58px;width:245px;max-height:calc(100vh - 66px);overflow:auto;padding:10px;background:#101828;border-radius:0 0 12px 12px;box-shadow:0 12px 30px rgba(0,0,0,.25)}
        .content{padding:16px!important;max-width:none!important}
        .form-grid{grid-template-columns:1fr 1fr}
        .table{min-width:720px}
      }
      @media (max-width: 820px) and (orientation: portrait){
        .desktop-grid{display:block!important;min-height:100vh}
        .sidebar{display:none!important}
        .mobilebar{display:flex!important;position:sticky;top:0;z-index:900;height:58px;padding:8px 12px;align-items:center;gap:10px;background:#101828;color:#fff}
        .mobilebar>.btn{display:flex!important;align-items:center;justify-content:center}
        .mobilemenu{position:absolute;left:8px;right:8px;top:58px;max-height:calc(100vh - 66px);overflow:auto;padding:10px;background:#101828;border-radius:0 0 12px 12px;box-shadow:0 12px 30px rgba(0,0,0,.25)}
        .content{padding:14px!important;max-width:none!important}
        .content>div:first-child{align-items:flex-start!important}
        .content h1{font-size:24px!important}
        .stats{grid-template-columns:1fr 1fr!important}
        .form-grid{grid-template-columns:1fr!important}
        .modal-overlay{padding:8px}
        .modal{max-height:calc(100vh - 16px);padding:16px}
        .table-wrap{margin-right:-2px}
        .table{min-width:720px}
        .btn{white-space:nowrap}
      }
      @media (max-width: 480px) and (orientation: portrait){
        .stats{grid-template-columns:1fr!important}
        .content{padding:10px!important}
        .content>div:first-child{flex-wrap:wrap!important}
      }
    `}</style>
    <div className="desktop-grid" style={{display:'grid',gridTemplateColumns:'250px 1fr',minHeight:'100vh'}}>
    <aside className="sidebar" style={{padding:18}}><div style={{fontSize:20,fontWeight:800,marginBottom:28}}>🎓 Thuy Nga Language Center</div>{nav.map(([n,I])=><div key={n} className={'navitem '+(tab===n?'active':'')} onClick={()=>{setTab(n);setMobile(false)}}><I size={18}/>{n}</div>)}<div style={{marginTop:30,color:'#94a3b8',fontSize:12}}>OFFLINE CENTER • V1</div><button className="btn btn-light" style={{marginTop:18,width:'100%'}} onClick={()=>client.auth.signOut()}><LogOut size={15}/> Đăng xuất</button></aside>
    <main><div className="mobilebar"><button className="btn btn-light" onClick={()=>setMobile(!mobile)}><Menu/></button><b>Thuy Nga Language Center</b>{mobile&&<div className="mobilemenu">{nav.map(([n,I])=><div key={n} className={'navitem '+(tab===n?'active':'')} onClick={()=>{setTab(n);setMobile(false)}}><I size={18}/>{n}</div>)}<div className="navitem" onClick={()=>client.auth.signOut()}><LogOut size={18}/> Đăng xuất</div></div>}</div>
      <div className="content" style={{padding:28,maxWidth:1400,margin:'auto'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}><div><div style={{fontSize:13,color:'#667085'}}>QUẢN LÝ TRUNG TÂM</div><h1 style={{fontSize:28,margin:'5px 0'}}>{tab}</h1></div>{(tab==='Lớp học'||tab==='Lịch học'||tab==='Giáo viên')&&<button className="btn btn-primary" onClick={()=>window.dispatchEvent(new CustomEvent(tab==='Lớp học'?'open-class-modal':tab==='Lịch học'?'open-schedule-modal':'open-teacher-modal'))}><Plus size={16}/> {tab==='Lớp học'?'Thêm lớp':tab==='Lịch học'?'Thêm lịch':'Thêm giáo viên'}</button>}</div>
        {tab==='Dashboard'&&<Dashboard/>}{tab==='Lớp học'&&<Classes/>}{tab==='Học viên'&&<Students/>}{tab==='Lịch học'&&<Schedule/>}{tab==='Điểm danh'&&<Attendance/>}{tab==='Học phí'&&<Fees/>}{tab==='Giáo viên'&&<Teachers/>}{tab==='Báo cáo'&&<Reports/>}{tab==='Import / Export'&&<ImportExport/>}
      </div></main>
  </div>
  </>
}

function ImportExport(){
 const client=supabase();
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [module,setModule]=useState('students');
 const inputRef=useRef<HTMLInputElement>(null);
 const modules=[
  {key:'students',label:'Học viên',table:'students'},
  {key:'classes',label:'Lớp học',table:'classes'},
  {key:'teachers',label:'Giáo viên',table:'teachers'},
  {key:'rooms',label:'Phòng học',table:'rooms'},
  {key:'schedules',label:'Lịch học',table:'schedules'},
  {key:'attendance',label:'Điểm danh',table:'attendance'},
  {key:'fees',label:'Học phí',table:'fees'},
 ];
 const exportAll=async()=>{
   setBusy(true);setError('');setMessage('');
   try{
    const wb=XLSX.utils.book_new();
    const queries:any[]=[
      ['Học viên','students','*'],['Lớp học','classes','*'],['Giáo viên','teachers','*'],['Phòng học','rooms','*'],
      ['Lịch học','schedules','*'],['Điểm danh','attendance','*'],['Học phí','fees','*']
    ];
    for(const [sheet,table,cols] of queries){
      const {data,error}=await client.from(table).select(cols);
      if(error)throw new Error(`${sheet}: ${error.message}`);
      const rows=(data||[]).map((r:any)=>{
        const x={...r};
        return x;
      });
      const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{}]);
      XLSX.utils.book_append_sheet(wb,ws,String(sheet).slice(0,31));
    }
    const stamp=new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb,`ThuyNga_Language_Center_${stamp}.xlsx`);
    setMessage('Đã xuất toàn bộ dữ liệu ra Excel.');
   }catch(e:any){setError(e?.message||'Xuất Excel thất bại.')}finally{setBusy(false)}
 };
 const exportModule=async()=>{
   setBusy(true);setError('');setMessage('');
   try{
    const m=modules.find(x=>x.key===module)!;
    const {data,error}=await client.from(m.table).select('*');
    if(error)throw error;
    const ws=XLSX.utils.json_to_sheet((data||[]).length?data||:[{}]);
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,m.label.slice(0,31));
    XLSX.writeFile(wb,`ThuyNga_${module}_${new Date().toISOString().slice(0,10)}.xlsx`);
    setMessage(`Đã xuất dữ liệu ${m.label}.`);
   }catch(e:any){setError(e?.message||'Xuất Excel thất bại.')}finally{setBusy(false)}
 };
 const template=()=>{
   const headers:any={
    students:[['id','student_code','full_name','dob','phone','parent_phone','email','class_id','enroll_date','status','notes']],
    classes:[['id','class_code','name','level','teacher_id','room_id','start_date','end_date','schedule_text','tuition','capacity','status']],
    teachers:[['id','full_name','phone','email','status']],
    rooms:[['id','name','capacity']],
    schedules:[['id','class_id','weekday','start_time','end_time','room_id','teacher_id','note','active']],
    attendance:[['id','class_id','student_id','lesson_date','status','note']],
    fees:[['id','student_id','class_id','month','amount_due','amount_paid','paid_at','status','note']],
   };
   const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet(headers[module]);XLSX.utils.book_append_sheet(wb,ws,modules.find(x=>x.key===module)!.label.slice(0,31));XLSX.writeFile(wb,`Mau_import_${module}.xlsx`);setMessage('Đã tải file mẫu Excel.');
 };
 const importFile=async(e:ChangeEvent<HTMLInputElement>)=>{
   const file=e.target.files?.[0]; if(!file)return;
   setBusy(true);setError('');setMessage('');
   try{
    const buffer=await file.arrayBuffer();
    const wb=XLSX.read(buffer,{type:'array',cellDates:false});
    const first=wb.SheetNames[0];
    const rows=XLSX.utils.sheet_to_json<any>(wb.Sheets[first],{defval:null,raw:true});
    if(!rows.length)throw new Error('File Excel không có dữ liệu.');
    const allowed={
      students:['id','student_code','full_name','dob','phone','parent_phone','email','class_id','enroll_date','status','notes'],
      classes:['id','class_code','name','level','teacher_id','room_id','start_date','end_date','schedule_text','tuition','capacity','status'],
      teachers:['id','full_name','phone','email','status'],
      rooms:['id','name','capacity'],
      schedules:['id','class_id','weekday','start_time','end_time','room_id','teacher_id','note','active'],
      attendance:['id','class_id','student_id','lesson_date','status','note'],
      fees:['id','student_id','class_id','month','amount_due','amount_paid','paid_at','status','note']
    } as any;
    const keys=allowed[module] as string[];
    const payload=rows.map((r:any)=>{
      const o:any={};keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(r,k))o[k]=r[k]});
      if(o.id==='')delete o.id;
      return o;
    }).filter((r:any)=>Object.keys(r).length>0);
    if(!payload.length)throw new Error('Không tìm thấy cột dữ liệu hợp lệ trong file.');
    const table=modules.find(x=>x.key===module)!.table;
    const hasIds=payload.every((r:any)=>r.id);
    let res;
    if(hasIds) res=await client.from(table).upsert(payload,{onConflict:'id'});
    else res=await client.from(table).insert(payload);
    if(res.error)throw res.error;
    setMessage(`Đã nhập ${payload.length} dòng vào ${modules.find(x=>x.key===module)!.label}.`);
   }catch(e:any){setError(e?.message||'Nhập Excel thất bại.')}finally{setBusy(false);e.target.value='';}
 };
 return <>
  <div className="card" style={{padding:20}}>
   <h3 style={{marginTop:0}}>Import / Export dữ liệu Excel</h3>
   <p style={{color:'#667085',marginTop:4}}>Sao lưu toàn bộ dữ liệu trung tâm hoặc nhập lại dữ liệu từ file Excel.</p>
   {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:12,borderRadius:8,margin:'12px 0'}}>{error}</div>}
   {message&&<div style={{background:'#ecfdf3',color:'#067647',padding:12,borderRadius:8,margin:'12px 0'}}>{message}</div>}
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginTop:18}}>
    <div style={{border:'1px solid #e4e7ec',borderRadius:12,padding:18}}>
      <h4 style={{marginTop:0}}>📤 Xuất toàn bộ</h4><p style={{fontSize:13,color:'#667085'}}>Tạo một file Excel gồm 7 sheet: Học viên, Lớp học, Giáo viên, Phòng học, Lịch học, Điểm danh và Học phí.</p>
      <button className="btn btn-primary" disabled={busy} onClick={exportAll}><Download size={16}/> Xuất toàn bộ Excel</button>
    </div>
    <div style={{border:'1px solid #e4e7ec',borderRadius:12,padding:18}}>
      <h4 style={{marginTop:0}}>📄 Xuất từng danh mục</h4>
      <select className="input" value={module} onChange={e=>setModule(e.target.value)}>{modules.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}><button className="btn btn-light" disabled={busy} onClick={exportModule}><Download size={16}/> Xuất</button><button className="btn btn-light" disabled={busy} onClick={template}><FileSpreadsheet size={16}/> Tải mẫu</button></div>
    </div>
    <div style={{border:'1px solid #e4e7ec',borderRadius:12,padding:18}}>
      <h4 style={{marginTop:0}}>📥 Nhập Excel</h4><p style={{fontSize:13,color:'#667085'}}>Chọn đúng danh mục và nhập file .xlsx/.xls/.csv. File có cột <b>id</b> sẽ cập nhật bản ghi hiện có.</p>
      <select className="input" value={module} onChange={e=>setModule(e.target.value)}>{modules.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={importFile}/>
      <button className="btn btn-primary" style={{marginTop:10}} disabled={busy} onClick={()=>inputRef.current?.click()}><Upload size={16}/> Chọn file Excel</button>
    </div>
   </div>
   <div style={{marginTop:20,padding:14,background:'#f8fafc',borderRadius:10,fontSize:13,color:'#475467'}}>
    <b>Lưu ý:</b> Nên <b>Xuất toàn bộ Excel</b> trước khi import để có bản sao lưu. Khi import có cột <b>id</b>, hệ thống sẽ cập nhật theo ID; nếu không có ID, hệ thống sẽ thêm bản ghi mới. Với dữ liệu có quan hệ (lớp, học viên, điểm danh, học phí), nên giữ nguyên các ID trong file xuất ra.
   </div>
  </div>
 </>;
}

function Login(){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState(''); const client=supabase();
 return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20}}><div className="card" style={{width:'min(420px,100%)',padding:28}}><div style={{fontSize:28,fontWeight:800}}>🎓 Thuy Nga Language Center</div><p style={{color:'#667085'}}>Đăng nhập quản lý trung tâm</p><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"/><input className="input" style={{marginTop:10}} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" type="password"/>{error&&<div style={{color:'#b42318',marginTop:10,fontSize:14}}>{error}</div>}<button className="btn btn-primary" style={{width:'100%',marginTop:14}} disabled={busy} onClick={async()=>{setBusy(true);setError('');const {error}=await client.auth.signInWithPassword({email,password});if(error)setError(error.message);setBusy(false)}}>{busy?'Đang đăng nhập...':'Đăng nhập'}</button><p style={{fontSize:12,color:'#667085',marginTop:16}}>Tài khoản được tạo trong Supabase Authentication.</p></div></div>
}

function Dashboard(){const [stats,setStats]=useState({classes:0,students:0,teachers:0,unpaid:0});const client=supabase();useEffect(()=>{(async()=>{const [c,s,t,f]=await Promise.all([client.from('classes').select('id',{count:'exact',head:true}).eq('status','active'),client.from('students').select('id',{count:'exact',head:true}).eq('status','active'),client.from('teachers').select('id',{count:'exact',head:true}).eq('status','active'),client.from('fees').select('id',{count:'exact',head:true}).lt('amount_paid','amount_due')]);setStats({classes:c.count||0,students:s.count||0,teachers:t.count||0,unpaid:f.count||0})})()},[]);return <><div className="stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>{[[stats.classes,'Lớp đang học'],[stats.students,'Học viên'],[stats.teachers,'Giáo viên'],[stats.unpaid,'HS chưa đóng phí']].map(([v,l])=><div className="card" style={{padding:20}} key={String(l)}><div style={{fontSize:30,fontWeight:800}}>{v}</div><div style={{color:'#667085',marginTop:5}}>{l}</div></div>)}</div><div className="card" style={{padding:20,marginTop:16}}><h3>Dashboard dữ liệu thật</h3><p style={{color:'#667085'}}>Các chỉ số đang lấy trực tiếp từ Supabase. Các module tiếp theo sẽ dùng cùng dữ liệu này.</p></div></>}

function Classes(){const client=supabase();const [rows,setRows]=useState<ClassRow[]>([]);const [teachers,setTeachers]=useState<Teacher[]>([]);const [rooms,setRooms]=useState<Room[]>([]);const [q,setQ]=useState('');const [open,setOpen]=useState(false);const [editing,setEditing]=useState<ClassRow|null>(null);const [error,setError]=useState('');
 const load=async()=>{const [{data:c,error:ce},{data:t},{data:r}]=await Promise.all([client.from('classes').select('*,teachers(id,full_name),rooms(id,name,capacity)').order('created_at',{ascending:false}),client.from('teachers').select('id,full_name').eq('status','active').order('full_name'),client.from('rooms').select('id,name,capacity').order('name')]);if(ce)setError(ce.message);setRows((c||[]) as any);setTeachers(t||[]);setRooms(r||[])};
 useEffect(()=>{load();const h=()=>{setEditing(null);setOpen(true)};window.addEventListener('open-class-modal',h);return()=>window.removeEventListener('open-class-modal',h)},[]);
 const filtered=useMemo(()=>rows.filter(r=>`${r.class_code||''} ${r.name} ${r.level||''} ${r.teachers?.full_name||''} ${r.rooms?.name||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const remove=async(id:string)=>{if(!confirm('Xóa lớp này?'))return;const {error}=await client.from('classes').delete().eq('id',id);if(error)setError(error.message);else load()};
 return <><div className="card" style={{padding:20}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:15,gap:10,flexWrap:'wrap'}}><h3>Danh sách lớp học</h3><div style={{display:'flex',gap:8}}><div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:10,top:11,color:'#98a2b3'}}/><input className="input" style={{width:260,paddingLeft:34}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm mã lớp, tên lớp, giáo viên..."/></div></div></div>{error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:10}}>{error}</div>}<div className="table-wrap"><table className="table"><thead><tr>{['Mã lớp','Lớp','Trình độ','Giáo viên','Phòng','Lịch học','Sĩ số','Học phí','Trạng thái',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><b>{r.class_code||'—'}</b></td><td><b>{r.name}</b></td><td>{r.level||'—'}</td><td>{r.teachers?.full_name||'—'}</td><td>{r.rooms?.name||'—'}</td><td>{r.schedule_text||'—'}</td><td>{r.capacity}</td><td>{Number(r.tuition||0).toLocaleString('vi-VN')}đ</td><td><span className={'pill '+(r.status==='active'?'green':r.status==='upcoming'?'yellow':'blue')}>{r.status==='active'?'Đang học':r.status==='upcoming'?'Sắp mở':'Đã kết thúc'}</span></td><td><div style={{display:'flex',gap:5}}><button className="btn btn-light" title="Sửa" onClick={()=>{setEditing(r);setOpen(true)}}><Pencil size={15}/></button><button className="btn btn-light" title="Xóa" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>)}{filtered.length===0&&<tr><td colSpan={10} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có lớp học.</td></tr>}</tbody></table></div></div>{open&&<ClassModal row={editing} teachers={teachers} rooms={rooms} close={()=>setOpen(false)} saved={()=>{setOpen(false);load()}}/>}</>}

function ClassModal({row,teachers,rooms,close,saved}:{row:ClassRow|null;teachers:Teacher[];rooms:Room[];close:()=>void;saved:()=>void}){const client=supabase();const [form,setForm]=useState({class_code:row?.class_code||'',name:row?.name||'',level:row?.level||'',teacher_id:row?.teacher_id||'',room_id:row?.room_id||'',schedule_text:row?.schedule_text||'',start_date:row?.start_date||'',end_date:row?.end_date||'',tuition:String(row?.tuition||''),capacity:String(row?.capacity||20),status:row?.status||'active'});const [busy,setBusy]=useState(false);const [error,setError]=useState('');const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const save=async()=>{if(!form.class_code.trim()){setError('Vui lòng nhập mã lớp.');return}if(!form.name.trim()){setError('Vui lòng nhập tên lớp.');return}setBusy(true);setError('');const payload={class_code:form.class_code.trim().toUpperCase()||null,name:form.name.trim(),level:form.level||null,teacher_id:form.teacher_id||null,room_id:form.room_id||null,schedule_text:form.schedule_text||null,start_date:form.start_date||null,end_date:form.end_date||null,tuition:Number(form.tuition||0),capacity:Number(form.capacity||20),status:form.status};const res=row?await client.from('classes').update(payload).eq('id',row.id):await client.from('classes').insert(payload);if(res.error)setError(res.error.message);else saved();setBusy(false)};
 return <div className="modal-overlay"><div className="card modal"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>{row?'Sửa lớp học':'Thêm lớp học'}</h2><button className="btn btn-light" onClick={close}><X/></button></div><div className="form-grid"><label>Mã lớp *<input className="input" value={form.class_code} onChange={e=>set('class_code',e.target.value)} placeholder="Ví dụ: ST01"/></label><label>Tên lớp<input className="input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ví dụ: Movers 1"/></label><label>Trình độ<input className="input" value={form.level} onChange={e=>set('level',e.target.value)} placeholder="Starters / Movers / B1..."/></label><label>Giáo viên<select className="input" value={form.teacher_id} onChange={e=>set('teacher_id',e.target.value)}><option value="">Chưa chọn</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}</select></label><label>Phòng<select className="input" value={form.room_id} onChange={e=>set('room_id',e.target.value)}><option value="">Chưa chọn</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}</select></label><label>Lịch học<input className="input" value={form.schedule_text} onChange={e=>set('schedule_text',e.target.value)} placeholder="T7-CN 09:00"/></label><label>Sĩ số tối đa<input className="input" type="number" min="1" value={form.capacity} onChange={e=>set('capacity',e.target.value)}/></label><label>Học phí/tháng<input className="input" type="number" min="0" value={form.tuition} onChange={e=>set('tuition',e.target.value)}/></label><label>Trạng thái<select className="input" value={form.status} onChange={e=>set('status',e.target.value)}><option value="active">Đang học</option><option value="upcoming">Sắp mở</option><option value="finished">Đã kết thúc</option></select></label></div>{error&&<div style={{color:'#b42318',marginTop:10}}>{error}</div>}<button className="btn btn-primary" style={{width:'100%',marginTop:16}} disabled={busy} onClick={save}>{busy?'Đang lưu...':'Lưu lớp học'}</button></div></div>}

type StudentRow={id:string;student_code:string|null;full_name:string;dob:string|null;phone:string|null;parent_phone:string|null;email:string|null;class_id:string|null;enroll_date:string|null;status:string|null;notes:string|null;classes?:{id:string;class_code:string|null;name:string}|null};

function Students(){
 const client=supabase();
 const [rows,setRows]=useState<StudentRow[]>([]); const [classes,setClasses]=useState<{id:string;class_code:string|null;name:string;level:string|null}[]>([]);
 const [q,setQ]=useState(''); const [open,setOpen]=useState(false); const [editing,setEditing]=useState<StudentRow|null>(null); const [error,setError]=useState('');
 const load=async()=>{const [{data:s,error:se},{data:c,error:ce}]=await Promise.all([
   client.from('students').select('*,classes(id,name)').order('created_at',{ascending:false}),
   client.from('classes').select('id,class_code,name,level').order('name')
 ]); if(se)setError(se.message); if(ce)setError(ce.message); setRows((s||[]) as any); setClasses(c||[])};
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(r=>`${r.student_code||''} ${r.full_name} ${r.phone||''} ${r.parent_phone||''} ${r.classes?.name||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const remove=async(id:string)=>{if(!confirm('Xóa học viên này?'))return;const {error}=await client.from('students').delete().eq('id',id);if(error)setError(error.message);else load()};
 return <>
   <div className="card" style={{padding:20}}>
     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:15,gap:10,flexWrap:'wrap'}}>
       <div><h3 style={{margin:'0 0 4px'}}>Danh sách học viên</h3><span style={{fontSize:13,color:'#667085'}}>{filtered.length} học viên</span></div>
       <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:10,top:11,color:'#98a2b3'}}/><input className="input" style={{width:280,paddingLeft:34}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm mã, tên, SĐT, lớp..."/></div><button className="btn btn-primary" onClick={()=>{setEditing(null);setOpen(true)}}><Plus size={16}/> Thêm học viên</button></div>
     </div>
     {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:10}}>{error}</div>}
     <div className="table-wrap"><table className="table"><thead><tr>{['Mã HS','Họ tên','Ngày sinh','Lớp','SĐT','SĐT phụ huynh','Trạng thái',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
     {filtered.map(r=><tr key={r.id}><td><b>{r.student_code||'—'}</b></td><td>{r.full_name}</td><td>{r.dob?new Date(r.dob+'T00:00:00').toLocaleDateString('vi-VN'):'—'}</td><td>{r.classes?.name||'Chưa xếp lớp'}</td><td>{r.phone||'—'}</td><td>{r.parent_phone||'—'}</td><td><span className={'pill '+(r.status==='active'?'green':r.status==='reserved'?'yellow':'blue')}>{r.status==='active'?'Đang học':r.status==='reserved'?'Bảo lưu':'Nghỉ'}</span></td><td><div style={{display:'flex',gap:5}}><button className="btn btn-light" title="Sửa" onClick={()=>{setEditing(r);setOpen(true)}}><Pencil size={15}/></button><button className="btn btn-light" title="Xóa" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>)}
     {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có học viên.</td></tr>}</tbody></table></div>
   </div>
   {open&&
     <StudentModal
       row={editing}
       classes={classes}
       close={()=>setOpen(false)}
       saved={()=>{setOpen(false);load()}}
     />
   }
 </>;
}

function StudentModal({row,classes,close,saved}:{row:StudentRow|null;classes:{id:string;class_code:string|null;name:string;level:string|null}[];close:()=>void;saved:()=>void}){
 const client=supabase(); const [form,setForm]=useState({student_code:row?.student_code||'',full_name:row?.full_name||'',dob:row?.dob||'',phone:row?.phone||'',parent_phone:row?.parent_phone||'',email:row?.email||'',class_id:row?.class_id||'',enroll_date:row?.enroll_date||new Date().toISOString().slice(0,10),status:row?.status||'active',notes:row?.notes||''}); const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const save=async()=>{if(!form.full_name.trim()){setError('Vui lòng nhập họ tên học viên.');return}setBusy(true);setError(''); const payload={student_code:form.student_code.trim()||null,full_name:form.full_name.trim(),dob:form.dob||null,phone:form.phone.trim()||null,parent_phone:form.parent_phone.trim()||null,email:form.email.trim()||null,class_id:form.class_id||null,enroll_date:form.enroll_date||null,status:form.status,notes:form.notes.trim()||null}; const res=row?await client.from('students').update(payload).eq('id',row.id):await client.from('students').insert(payload); if(res.error)setError(res.error.message);else saved();setBusy(false)};
 return <div className="modal-overlay"><div className="card modal"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>{row?'Sửa học viên':'Thêm học viên'}</h2><button className="btn btn-light" onClick={close}><X/></button></div><div className="form-grid">
   <label>Mã học viên<input className="input" value={form.student_code} onChange={e=>set('student_code',e.target.value)} placeholder="HS011"/></label>
   <label>Họ tên *<input className="input" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Nguyễn Văn A"/></label>
   <label>Ngày sinh<input className="input" type="date" value={form.dob} onChange={e=>set('dob',e.target.value)}/></label>
   <label>Ngày nhập học<input className="input" type="date" value={form.enroll_date} onChange={e=>set('enroll_date',e.target.value)}/></label>
   <label>Số điện thoại<input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="09..."/></label>
   <label>SĐT phụ huynh<input className="input" value={form.parent_phone} onChange={e=>set('parent_phone',e.target.value)} placeholder="09..."/></label>
   <label>Email<input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com"/></label>
   <label>Lớp học<select className="input" value={form.class_id} onChange={e=>set('class_id',e.target.value)}><option value="">Chưa xếp lớp</option>{classes.map(c=><option key={c.id} value={c.id}>{c.class_code?`[${c.class_code}] `:''}{c.name}{c.level?` - ${c.level}`:''}</option>)}</select></label>
   <label>Trạng thái<select className="input" value={form.status} onChange={e=>set('status',e.target.value)}><option value="active">Đang học</option><option value="reserved">Bảo lưu</option><option value="inactive">Nghỉ</option></select></label>
   <label style={{gridColumn:'1/-1'}}>Ghi chú<textarea className="input" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Ghi chú về học viên..."/></label>
   </div>{error&&<div style={{color:'#b42318',marginTop:10}}>{error}</div>}<button className="btn btn-primary" style={{width:'100%',marginTop:16}} disabled={busy} onClick={save}>{busy?'Đang lưu...':'Lưu học viên'}</button></div></div>
}

type ScheduleRow={id:string;class_id:string;weekday:number;start_time:string;end_time:string;room_id:string|null;teacher_id:string|null;note:string|null;active:boolean;classes?:{id:string;class_code:string|null;name:string;level:string|null}|null;teachers?:{id:string;full_name:string}|null;rooms?:{id:string;name:string}|null};

function Schedule(){
 const client=supabase();
 const [rows,setRows]=useState<ScheduleRow[]>([]);
 const [classes,setClasses]=useState<{id:string;class_code:string|null;name:string;level:string|null}[]>([]);
 const [teachers,setTeachers]=useState<Teacher[]>([]);
 const [rooms,setRooms]=useState<Room[]>([]);
 const [q,setQ]=useState(''); const [open,setOpen]=useState(false); const [editing,setEditing]=useState<ScheduleRow|null>(null); const [error,setError]=useState('');
 const days=['T2','T3','T4','T5','T6','T7','CN'];
 const load=async()=>{
   const [{data:s,error:se},{data:c,error:ce},{data:t},{data:r}]=await Promise.all([
     client.from('schedules').select('*,classes(id,name,level),teachers(id,full_name),rooms(id,name)').order('weekday').order('start_time'),
     client.from('classes').select('id,class_code,name,level').order('name'),
     client.from('teachers').select('id,full_name').eq('status','active').order('full_name'),
     client.from('rooms').select('id,name,capacity').order('name')
   ]);
   if(se)setError(se.message); if(ce)setError(ce.message); setRows((s||[]) as any); setClasses(c||[]); setTeachers(t||[]); setRooms(r||[]);
 };
 useEffect(()=>{load();const h=()=>{setEditing(null);setOpen(true)};window.addEventListener('open-schedule-modal',h);return()=>window.removeEventListener('open-schedule-modal',h)},[]);
 const filtered=useMemo(()=>rows.filter(r=>`${r.classes?.name||''} ${r.teachers?.full_name||''} ${r.rooms?.name||''} ${days[r.weekday-1]||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const remove=async(id:string)=>{if(!confirm('Xóa lịch học này?'))return;const {error}=await client.from('schedules').delete().eq('id',id);if(error)setError(error.message);else load()};
 return <>
   <div className="card" style={{padding:20}}>
     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:15,gap:10,flexWrap:'wrap'}}>
       <div><h3 style={{margin:'0 0 4px'}}>Lịch học hàng tuần</h3><span style={{fontSize:13,color:'#667085'}}>{filtered.length} lịch học</span></div>
       <div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:10,top:11,color:'#98a2b3'}}/><input className="input" style={{width:280,paddingLeft:34}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm lớp, giáo viên, phòng..."/></div>
     </div>
     {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:10}}>{error}</div>}
     <div className="table-wrap"><table className="table"><thead><tr>{['Thứ','Giờ','Lớp','Giáo viên','Phòng','Ghi chú',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
       {filtered.map(r=><tr key={r.id}><td><b>{days[r.weekday-1]||'—'}</b></td><td>{r.start_time?.slice(0,5)}{r.end_time?` - ${r.end_time.slice(0,5)}`:''}</td><td><b>{r.classes?.name||'—'}</b>{r.classes?.level&&<div style={{fontSize:12,color:'#667085'}}>{r.classes.level}</div>}</td><td>{r.teachers?.full_name||'—'}</td><td>{r.rooms?.name||'—'}</td><td>{r.note||'—'}</td><td><div style={{display:'flex',gap:5}}><button className="btn btn-light" title="Sửa" onClick={()=>{setEditing(r);setOpen(true)}}><Pencil size={15}/></button><button className="btn btn-light" title="Xóa" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>)}
       {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có lịch học.</td></tr>}
     </tbody></table></div>
   </div>
   <div className="card" style={{padding:20,marginTop:16}}><h3 style={{marginTop:0}}>Thời khóa biểu tuần</h3><div className="table-wrap"><table className="table"><thead><tr>{days.map(d=><th key={d}>{d}</th>)}</tr></thead><tbody><tr>{days.map((_,i)=><td key={i} style={{verticalAlign:'top',minWidth:150}}>{filtered.filter(r=>r.weekday===i+1).map(r=><div key={r.id} style={{padding:10,marginBottom:8,border:'1px solid #dbe3ef',borderRadius:10,background:'#f8fbff'}}><b>{r.start_time.slice(0,5)}</b>{r.end_time&&` - ${r.end_time.slice(0,5)}`}<div style={{fontWeight:700,marginTop:4}}>{r.classes?.name||'—'}</div><div style={{fontSize:12,color:'#667085'}}>{r.rooms?.name||'Chưa có phòng'} • {r.teachers?.full_name||'Chưa có GV'}</div></div>)}</td>)}</tr></tbody></table></div></div>
   {open&&<ScheduleModal row={editing} classes={classes} teachers={teachers} rooms={rooms} close={()=>setOpen(false)} saved={()=>{setOpen(false);load()}}/>}
 </>;
}

function ScheduleModal({row,classes,teachers,rooms,close,saved}:{row:ScheduleRow|null;classes:{id:string;class_code:string|null;name:string;level:string|null}[];teachers:Teacher[];rooms:Room[];close:()=>void;saved:()=>void}){
 const client=supabase();
 const [form,setForm]=useState({class_id:row?.class_id||'',weekday:String(row?.weekday||1),start_time:row?.start_time?.slice(0,5)||'17:30',end_time:row?.end_time?.slice(0,5)||'19:00',teacher_id:row?.teacher_id||'',room_id:row?.room_id||'',note:row?.note||'',active:row?.active!==false});
 const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const set=(k:string,v:string|boolean)=>setForm(f=>({...f,[k]:v}));
 const save=async()=>{if(!form.class_id){setError('Vui lòng chọn lớp học.');return}if(!form.start_time||!form.end_time){setError('Vui lòng nhập giờ học.');return}setBusy(true);setError('');const payload={class_id:form.class_id,weekday:Number(form.weekday),start_time:form.start_time,end_time:form.end_time,teacher_id:form.teacher_id||null,room_id:form.room_id||null,note:form.note.trim()||null,active:form.active};const res=row?await client.from('schedules').update(payload).eq('id',row.id):await client.from('schedules').insert(payload);if(res.error)setError(res.error.message);else saved();setBusy(false)};
 return <div className="modal-overlay"><div className="card modal"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>{row?'Sửa lịch học':'Thêm lịch học'}</h2><button className="btn btn-light" onClick={close}><X/></button></div><div className="form-grid">
   <label>Lớp học<select className="input" value={form.class_id} onChange={e=>set('class_id',e.target.value)}><option value="">Chọn lớp</option>{classes.map(c=><option key={c.id} value={c.id}>{c.class_code?`[${c.class_code}] `:''}{c.name}{c.level?` - ${c.level}`:''}</option>)}</select></label>
   <label>Thứ<select className="input" value={form.weekday} onChange={e=>set('weekday',e.target.value)}>{['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'].map((d,i)=><option key={i} value={i+1}>{d}</option>)}</select></label>
   <label>Giờ bắt đầu<input className="input" type="time" value={form.start_time} onChange={e=>set('start_time',e.target.value)}/></label>
   <label>Giờ kết thúc<input className="input" type="time" value={form.end_time} onChange={e=>set('end_time',e.target.value)}/></label>
   <label>Giáo viên<select className="input" value={form.teacher_id} onChange={e=>set('teacher_id',e.target.value)}><option value="">Theo giáo viên của lớp</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}</select></label>
   <label>Phòng<select className="input" value={form.room_id} onChange={e=>set('room_id',e.target.value)}><option value="">Chọn phòng</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}</select></label>
   <label style={{gridColumn:'1/-1'}}>Ghi chú<input className="input" value={form.note} onChange={e=>set('note',e.target.value)} placeholder="Ví dụ: Phòng máy / học bù..."/></label>
 </div>{error&&<div style={{color:'#b42318',marginTop:10}}>{error}</div>}<button className="btn btn-primary" style={{width:'100%',marginTop:16}} disabled={busy} onClick={save}>{busy?'Đang lưu...':'Lưu lịch học'}</button></div></div>
}

function Attendance(){
 const client=supabase();
 const [classes,setClasses]=useState<{id:string;class_code:string|null;name:string;level:string|null}[]>([]);
 const [classId,setClassId]=useState('');
 const [date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [students,setStudents]=useState<StudentRow[]>([]);
 const [marks,setMarks]=useState<Record<string,{status:string;note:string}>>({});
 const [history,setHistory]=useState<any[]>([]);
 const [loading,setLoading]=useState(false);
 const [loadingHistory,setLoadingHistory]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [saved,setSaved]=useState('');

 const monthStart=`${date.slice(0,7)}-01`;
 const monthEnd=new Date(Number(date.slice(0,4)),Number(date.slice(5,7)),0).toISOString().slice(0,10);

 useEffect(()=>{client.from('classes').select('id,class_code,name,level').order('name').then(({data,error})=>{if(error)setError(error.message);setClasses(data||[]);if(data?.length)setClassId(data[0].id)})},[]);

 const load=async()=>{
   if(!classId||!date)return;
   setLoading(true);setError('');setSaved('');
   const [{data:s,error:se},{data:a,error:ae}]=await Promise.all([
     client.from('students').select('id,student_code,full_name,dob,phone,parent_phone,email,class_id,enroll_date,status,notes,classes(id,name)').eq('class_id',classId).eq('status','active').order('student_code'),
     client.from('attendance').select('student_id,status,note').eq('class_id',classId).eq('lesson_date',date)
   ]);
   if(se)setError(se.message); if(ae)setError(ae.message);
   const next:Record<string,{status:string;note:string}>={};
   (s||[]).forEach((st:any)=>next[st.id]={status:'present',note:''});
   (a||[]).forEach((m:any)=>next[m.student_id]={status:m.status,note:m.note||''});
   setStudents((s||[]) as any);setMarks(next);setLoading(false);
 };

 const loadHistory=async()=>{
   if(!classId)return;
   setLoadingHistory(true);
   const {data,error}=await client.from('attendance').select('student_id,lesson_date,status,note,students(student_code,full_name)').eq('class_id',classId).gte('lesson_date',monthStart).lte('lesson_date',monthEnd).order('lesson_date',{ascending:false});
   if(error)setError(error.message); else setHistory(data||[]);
   setLoadingHistory(false);
 };
 useEffect(()=>{load()},[classId,date]);
 useEffect(()=>{loadHistory()},[classId,date.slice(0,7)]);

 const setMark=(id:string,key:'status'|'note',value:string)=>setMarks(m=>({...m,[id]:{...(m[id]||{status:'present',note:''}),[key]:value}}));
 const markAll=(status:string)=>{const next={...marks};students.forEach(s=>next[s.id]={...(next[s.id]||{status:'present',note:''}),status});setMarks(next)};
 const save=async()=>{
   if(!classId||!students.length)return;
   setSaving(true);setError('');setSaved('');
   const payload=students.map(s=>({class_id:classId,student_id:s.id,lesson_date:date,status:marks[s.id]?.status||'present',note:marks[s.id]?.note?.trim()||null}));
   const {error}=await client.from('attendance').upsert(payload,{onConflict:'student_id,lesson_date'});
   if(error)setError(error.message);else {setSaved('Đã lưu điểm danh.');await loadHistory()}
   setSaving(false);
 };
 const statusLabel=(s:string)=>s==='present'?'Có mặt':s==='late'?'Đi trễ':s==='absent'?'Vắng':'Có phép';
 const summary=useMemo(()=>{
   const map:Record<string,any>={};
   history.forEach((r:any)=>{const id=r.student_id;if(!map[id])map[id]={id,name:r.students?.full_name||'—',code:r.students?.student_code||'—',present:0,late:0,absent:0,excused:0,total:0,days:new Set<string>()};const x=map[id];x.total++;x.days.add(r.lesson_date);if(r.status==='present')x.present++;else if(r.status==='late')x.late++;else if(r.status==='absent')x.absent++;else if(r.status==='excused')x.excused++});
   return Object.values(map).map((x:any)=>({...x,lessonDays:x.days.size,attendancePct:x.total?Math.round(((x.present+x.late)/x.total)*100):0})).sort((a:any,b:any)=>a.code.localeCompare(b.code));
 },[history]);
 const monthTotals=useMemo(()=>({present:history.filter(r=>r.status==='present').length,late:history.filter(r=>r.status==='late').length,absent:history.filter(r=>r.status==='absent').length,excused:history.filter(r=>r.status==='excused').length}),[history]);
 return <>
 <div className="card" style={{padding:20}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:12,flexWrap:'wrap',marginBottom:16}}>
     <div><h3 style={{margin:'0 0 5px'}}>Điểm danh</h3><span style={{fontSize:13,color:'#667085'}}>Chọn lớp và ngày học để điểm danh</span></div>
     <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
       <select className="input" value={classId} onChange={e=>setClassId(e.target.value)} style={{minWidth:220}}>{classes.map(c=><option key={c.id} value={c.id}>{c.class_code?`[${c.class_code}] `:''}{c.name}{c.level?` - ${c.level}`:''}</option>)}</select>
       <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
     </div>
   </div>
   {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:10}}>{error}</div>}
   {saved&&<div style={{background:'#ecfdf3',color:'#067647',padding:10,borderRadius:8,marginBottom:10}}>{saved}</div>}
   <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
     <button className="btn btn-light" onClick={()=>markAll('present')}>✓ Có mặt tất cả</button>
     <button className="btn btn-light" onClick={()=>markAll('absent')}>Vắng tất cả</button>
     <button className="btn btn-primary" disabled={saving||loading||!students.length} onClick={save}>{saving?'Đang lưu...':'Lưu điểm danh'}</button>
   </div>
   <div className="table-wrap"><table className="table"><thead><tr><th>Mã HS</th><th>Họ tên</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>
     {loading&&<tr><td colSpan={4} style={{textAlign:'center',padding:30}}>Đang tải...</td></tr>}
     {!loading&&students.map(s=><tr key={s.id}><td><b>{s.student_code||'—'}</b></td><td>{s.full_name}</td><td><select className="input" value={marks[s.id]?.status||'present'} onChange={e=>setMark(s.id,'status',e.target.value)} style={{minWidth:130}}><option value="present">🟢 Có mặt</option><option value="late">🟡 Đi trễ</option><option value="absent">🔴 Vắng</option><option value="excused">🔵 Có phép</option></select></td><td><input className="input" value={marks[s.id]?.note||''} onChange={e=>setMark(s.id,'note',e.target.value)} placeholder="Ghi chú..."/></td></tr>)}
     {!loading&&!students.length&&<tr><td colSpan={4} style={{textAlign:'center',padding:30,color:'#667085'}}>Lớp này chưa có học viên đang học.</td></tr>}
   </tbody></table></div>
   {students.length>0&&<div style={{marginTop:14,color:'#667085',fontSize:13}}>Tổng {students.length} HS • Có mặt {students.filter(s=>marks[s.id]?.status==='present').length} • Đi trễ {students.filter(s=>marks[s.id]?.status==='late').length} • Vắng {students.filter(s=>marks[s.id]?.status==='absent').length} • Có phép {students.filter(s=>marks[s.id]?.status==='excused').length}</div>}
 </div>
 <div className="card" style={{padding:20,marginTop:16}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}><div><h3 style={{margin:'0 0 4px'}}>Chuyên cần tháng {date.slice(0,7)}</h3><div style={{fontSize:13,color:'#667085'}}>Theo dữ liệu điểm danh đã lưu của lớp đang chọn</div></div><div style={{fontSize:13,color:'#667085'}}>Có mặt {monthTotals.present} • Trễ {monthTotals.late} • Vắng {monthTotals.absent} • Có phép {monthTotals.excused}</div></div>
   <div className="table-wrap" style={{marginTop:14}}><table className="table"><thead><tr><th>Mã HS</th><th>Họ tên</th><th>Số buổi ghi nhận</th><th>Có mặt</th><th>Đi trễ</th><th>Vắng</th><th>Có phép</th><th>Chuyên cần</th></tr></thead><tbody>
     {loadingHistory&&<tr><td colSpan={8} style={{textAlign:'center',padding:25}}>Đang tải lịch sử...</td></tr>}
     {!loadingHistory&&summary.map((r:any)=><tr key={r.id}><td><b>{r.code}</b></td><td>{r.name}</td><td>{r.total}</td><td>{r.present}</td><td>{r.late}</td><td>{r.absent}</td><td>{r.excused}</td><td><span className={'pill '+(r.attendancePct>=90?'green':r.attendancePct>=75?'yellow':'blue')}>{r.attendancePct}%</span></td></tr>)}
     {!loadingHistory&&!summary.length&&<tr><td colSpan={8} style={{textAlign:'center',padding:25,color:'#667085'}}>Chưa có dữ liệu điểm danh trong tháng này.</td></tr>}
   </tbody></table></div>
   {history.length>0&&<div style={{marginTop:16}}><h4 style={{margin:'0 0 10px'}}>Lịch sử điểm danh</h4><div style={{display:'grid',gap:8,maxHeight:260,overflow:'auto'}}>{history.map((r:any,i:number)=><div key={r.student_id+'-'+r.lesson_date+'-'+i} style={{display:'flex',justifyContent:'space-between',gap:10,padding:'9px 10px',border:'1px solid #e4e7ec',borderRadius:8,fontSize:13}}><span><b>{r.lesson_date}</b> • {r.students?.student_code||'—'} • {r.students?.full_name||'—'}</span><span><b>{statusLabel(r.status)}</b>{r.note?` • ${r.note}`:''}</span></div>)}</div></div>}
 </div>
 </>;
}
type FeeRow={
 id?:string;
 student_id:string;
 class_id:string;
 month:string;
 amount_due:number;
 amount_paid:number;
 paid_at:string|null;
 status:string;
 note:string|null;
 students?:{student_code:string|null;full_name:string}|null;
 classes?:{class_code:string|null;name:string;tuition:number}|null;
};

function Fees(){
 const client=supabase();
 const [classes,setClasses]=useState<{id:string;class_code:string|null;name:string;level:string|null;tuition:number}[]>([]);
 const [classId,setClassId]=useState('all');
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
 const [rows,setRows]=useState<FeeRow[]>([]);
 const [q,setQ]=useState('');
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [saved,setSaved]=useState('');

 const load=async()=>{
   if(!month)return;
   setLoading(true);setError('');
   const [{data:c,error:ce},{data:f,error:fe}]=await Promise.all([
     client.from('classes').select('id,class_code,name,level,tuition').order('name'),
     client.from('fees').select('id,student_id,class_id,month,amount_due,amount_paid,paid_at,status,note,students(student_code,full_name),classes(class_code,name,tuition)').eq('month',month+'-01').order('created_at')
   ]);
   if(ce)setError(ce.message);
   if(fe)setError(fe.message);
   setClasses((c||[]) as any);
   setRows((f||[]) as any);
   setLoading(false);
 };

 const ensureRows=async()=>{
   if(!month)return;
   setLoading(true);setError('');
   const [{data:cls,error:ce},{data:existing,error:fe}]=await Promise.all([
     client.from('classes').select('id,class_code,name,level,tuition').eq('status','active').order('name'),
     client.from('fees').select('id,student_id,class_id,month,amount_due,amount_paid,paid_at,status,note,students(student_code,full_name),classes(class_code,name,tuition)').eq('month',month+'-01').order('created_at')
   ]);
   if(ce||fe){setError(ce?.message||fe?.message||'Không tải được dữ liệu.');setLoading(false);return;}
   setClasses((cls||[]) as any);
   const existingMap=new Map((existing||[]).map((r:any)=>[r.student_id,r]));
   const targetStudentsQuery=classId==='all'
     ? client.from('students').select('id,student_code,full_name,class_id,classes(id,class_code,name,tuition)').eq('status','active').order('student_code')
     : client.from('students').select('id,student_code,full_name,class_id,classes(id,class_code,name,tuition)').eq('status','active').eq('class_id',classId).order('student_code');
   const {data:students,error:se}=await targetStudentsQuery;
   if(se){setError(se.message);setLoading(false);return;}
   const next=(students||[]).map((s:any)=>existingMap.get(s.id)||({student_id:s.id,class_id:s.class_id,month:month+'-01',amount_due:Number(s.classes?.tuition||0),amount_paid:0,paid_at:null,status:'unpaid',note:null,students:{student_code:s.student_code,full_name:s.full_name},classes:{name:s.classes?.name||'',tuition:Number(s.classes?.tuition||0)}}));
   setRows(next as any);setLoading(false);
 };

 useEffect(()=>{load()},[month]);
 useEffect(()=>{ensureRows()},[classId,month]);

 const update=(id:string,key:string,value:any)=>setRows(rs=>rs.map(r=>r.student_id===id?({...r,[key]:value}):r));
 const statusOf=(due:number,paid:number)=>paid<=0?'unpaid':paid>=due?'paid':'partial';
 const save=async()=>{
   if(!rows.length)return;
   setSaving(true);setError('');setSaved('');
   const payload=rows.map(r=>{
     const due=Math.max(0,Number(r.amount_due||0));
     const paid=Math.max(0,Math.min(Number(r.amount_paid||0),due));
     const status=statusOf(due,paid);
     return {student_id:r.student_id,class_id:r.class_id,month:month+'-01',amount_due:due,amount_paid:paid,paid_at:paid>0?(r.paid_at||new Date().toISOString().slice(0,10)):null,status,note:r.note?.trim()||null};
   });
   const {error}=await client.from('fees').upsert(payload,{onConflict:'student_id,month'});
   if(error)setError(error.message);else{setSaved('Đã lưu học phí tháng '+month+'.');await load();await ensureRows()}
   setSaving(false);
 };

 const filtered=useMemo(()=>rows.filter(r=>`${r.students?.student_code||''} ${r.students?.full_name||''} ${r.classes?.class_code||''} ${r.classes?.name||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const totals=useMemo(()=>filtered.reduce((a,r)=>{a.due+=Number(r.amount_due||0);a.paid+=Number(r.amount_paid||0);return a}, {due:0,paid:0}),[filtered]);
 const unpaid=totals.due-totals.paid;
 const counts=useMemo(()=>({paid:filtered.filter(r=>Number(r.amount_paid||0)>=Number(r.amount_due||0)&&Number(r.amount_due||0)>0).length,partial:filtered.filter(r=>Number(r.amount_paid||0)>0&&Number(r.amount_paid||0)<Number(r.amount_due||0)).length,unpaid:filtered.filter(r=>Number(r.amount_paid||0)<=0).length}),[filtered]);
 const money=(n:number)=>Number(n||0).toLocaleString('vi-VN')+'đ';
 return <>
  <div className="card" style={{padding:20}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:12,flexWrap:'wrap',marginBottom:16}}>
    <div><h3 style={{margin:'0 0 5px'}}>Học phí</h3><span style={{fontSize:13,color:'#667085'}}>Quản lý học phí theo tháng và mã lớp</span></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <select className="input" value={classId} onChange={e=>setClassId(e.target.value)} style={{minWidth:220}}><option value="all">Tất cả lớp</option>{classes.map(c=><option key={c.id} value={c.id}>{c.class_code?`[${c.class_code}] `:''}{c.name}{c.level?` - ${c.level}`:''}</option>)}</select>
      <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/>
    </div>
   </div>
   {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:10}}>{error}</div>}
   {saved&&<div style={{background:'#ecfdf3',color:'#067647',padding:10,borderRadius:8,marginBottom:10}}>{saved}</div>}
   <div className="stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
    {[[money(totals.due),'Tổng phải thu'],[money(totals.paid),'Đã thu'],[money(unpaid),'Còn nợ'],[filtered.length,`Học viên • ${counts.paid} đã đóng`]].map(([v,l])=><div key={String(l)} style={{border:'1px solid #e4e7ec',borderRadius:10,padding:14}}><div style={{fontSize:20,fontWeight:800}}>{v}</div><div style={{fontSize:12,color:'#667085',marginTop:4}}>{l}</div></div>)}
   </div>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:12}}>
     <div style={{display:'flex',gap:8,fontSize:13,color:'#667085'}}>Đã đóng: {counts.paid} • Đóng một phần: {counts.partial} • Chưa đóng: {counts.unpaid}</div>
     <div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:10,top:11,color:'#98a2b3'}}/><input className="input" style={{width:260,paddingLeft:34}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm mã, tên, lớp..."/></div>
   </div>
   <div className="table-wrap"><table className="table"><thead><tr><th>Mã HS</th><th>Họ tên</th><th>Mã lớp</th><th>Lớp</th><th>Phải thu</th><th>Đã thu</th><th>Còn nợ</th><th>Ngày đóng</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>
    {loading&&<tr><td colSpan={10} style={{textAlign:'center',padding:30}}>Đang tải...</td></tr>}
    {!loading&&filtered.map(r=>{const due=Number(r.amount_due||0),paid=Number(r.amount_paid||0),debt=Math.max(0,due-paid),st=statusOf(due,paid);return <tr key={r.student_id}>
      <td><b>{r.students?.student_code||'—'}</b></td><td>{r.students?.full_name||'—'}</td><td><b>{r.classes?.class_code||'—'}</b></td><td>{r.classes?.name||'—'}</td><td>{money(due)}</td>
      <td><input className="input" type="number" min="0" max={due} value={paid} onChange={e=>update(r.student_id,'amount_paid',Number(e.target.value||0))} style={{width:120}}/></td>
      <td><b>{money(debt)}</b></td><td><input className="input" type="date" value={r.paid_at||''} onChange={e=>update(r.student_id,'paid_at',e.target.value||null)} style={{width:135}}/></td>
      <td><span className={'pill '+(st==='paid'?'green':st==='partial'?'yellow':'blue')}>{st==='paid'?'Đã đóng':st==='partial'?'Đóng một phần':'Chưa đóng'}</span></td>
      <td><input className="input" value={r.note||''} onChange={e=>update(r.student_id,'note',e.target.value)} placeholder="Ghi chú..."/></td>
    </tr>})}
    {!loading&&!filtered.length&&<tr><td colSpan={10} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có học viên trong lựa chọn này.</td></tr>}
   </tbody></table></div>
   <button className="btn btn-primary" style={{marginTop:16}} disabled={saving||loading||!filtered.length} onClick={save}>{saving?'Đang lưu...':'Lưu học phí tháng '+month}</button>
  </div>
 </>;
}
function Teachers(){
 const client=supabase();
 const [rows,setRows]=useState<Teacher[]>([]);
 const [q,setQ]=useState('');
 const [open,setOpen]=useState(false);
 const [editing,setEditing]=useState<Teacher|null>(null);
 const [error,setError]=useState('');
 const [classCounts,setClassCounts]=useState<Record<string,number>>({});
 const load=async()=>{
   const [{data,error:te},{data:classes,error:ce}]=await Promise.all([
     client.from('teachers').select('id,full_name,phone,email,status,created_at').order('full_name'),
     client.from('classes').select('teacher_id')
   ]);
   if(te)setError(te.message); else setRows((data||[]) as Teacher[]);
   if(ce)setError(ce.message);
   const counts:Record<string,number>={};
   (classes||[]).forEach((r:any)=>{if(r.teacher_id)counts[r.teacher_id]=(counts[r.teacher_id]||0)+1});
   setClassCounts(counts);
 };
 useEffect(()=>{load();const h=()=>{setEditing(null);setOpen(true)};window.addEventListener('open-teacher-modal',h);return()=>window.removeEventListener('open-teacher-modal',h)},[]);
 const filtered=useMemo(()=>rows.filter(t=>`${t.full_name||''} ${t.phone||''} ${t.email||''} ${t.status||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const remove=async(id:string)=>{
   const count=classCounts[id]||0;
   if(count>0){alert(`Không thể xóa giáo viên này vì đang được phân công ${count} lớp. Hãy chuyển giáo viên sang trạng thái Nghỉ trước.`);return;}
   if(!confirm('Xóa giáo viên này?'))return;
   const {error}=await client.from('teachers').delete().eq('id',id);
   if(error)setError(error.message);else load();
 };
 return <>
  <div className="card" style={{padding:20}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:16}}>
    <div><h3 style={{margin:'0 0 4px'}}>Quản lý giáo viên</h3><span style={{fontSize:13,color:'#667085'}}>Thêm, sửa, tìm kiếm và quản lý trạng thái giáo viên</span></div>
    <div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:10,top:11,color:'#98a2b3'}}/><input className="input" style={{width:280,paddingLeft:34}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên, SĐT, email..."/></div>
   </div>
   {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:12}}>{error}</div>}
   <div className="stats" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
    <div style={{border:'1px solid #e4e7ec',borderRadius:10,padding:14}}><div style={{fontSize:24,fontWeight:800}}>{rows.length}</div><div style={{fontSize:12,color:'#667085'}}>Tổng giáo viên</div></div>
    <div style={{border:'1px solid #e4e7ec',borderRadius:10,padding:14}}><div style={{fontSize:24,fontWeight:800}}>{rows.filter(t=>t.status==='active').length}</div><div style={{fontSize:12,color:'#667085'}}>Đang hoạt động</div></div>
    <div style={{border:'1px solid #e4e7ec',borderRadius:10,padding:14}}><div style={{fontSize:24,fontWeight:800}}>{Object.values(classCounts).reduce((a,b)=>a+b,0)}</div><div style={{fontSize:12,color:'#667085'}}>Lớp đang phân công</div></div>
   </div>
   <div className="table-wrap"><table className="table"><thead><tr><th>Họ tên</th><th>Số điện thoại</th><th>Email</th><th>Số lớp</th><th>Trạng thái</th><th></th></tr></thead><tbody>
    {filtered.map(t=><tr key={t.id}><td><b>{t.full_name}</b></td><td>{t.phone||'—'}</td><td>{t.email||'—'}</td><td>{classCounts[t.id]||0}</td><td><span className={'pill '+(t.status==='active'?'green':'blue')}>{t.status==='active'?'Đang hoạt động':'Nghỉ'}</span></td><td><div style={{display:'flex',gap:5}}><button className="btn btn-light" title="Sửa" onClick={()=>{setEditing(t);setOpen(true)}}><Pencil size={15}/></button><button className="btn btn-light" title="Xóa" onClick={()=>remove(t.id)}><Trash2 size={15}/></button></div></td></tr>)}
    {!filtered.length&&<tr><td colSpan={6} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có giáo viên phù hợp.</td></tr>}
   </tbody></table></div>
  </div>
  {open&&<TeacherModal row={editing} close={()=>setOpen(false)} saved={()=>{setOpen(false);load()}}/>}
 </>;
}

function TeacherModal({row,close,saved}:{row:Teacher|null;close:()=>void;saved:()=>void}){
 const client=supabase();
 const [form,setForm]=useState({full_name:row?.full_name||'',phone:row?.phone||'',email:row?.email||'',status:row?.status||'active'});
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const save=async()=>{
   if(!form.full_name.trim()){setError('Vui lòng nhập họ tên giáo viên.');return}
   setBusy(true);setError('');
   const payload={full_name:form.full_name.trim(),phone:form.phone.trim()||null,email:form.email.trim()||null,status:form.status};
   const res=row?await client.from('teachers').update(payload).eq('id',row.id):await client.from('teachers').insert(payload);
   if(res.error)setError(res.error.message);else saved();
   setBusy(false);
 };
 return <div className="modal-overlay"><div className="card modal">
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>{row?'Sửa giáo viên':'Thêm giáo viên'}</h2><button className="btn btn-light" onClick={close}><X/></button></div>
   <div className="form-grid">
    <label>Họ tên *<input className="input" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Nguyễn Văn A"/></label>
    <label>Số điện thoại<input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="09..."/></label>
    <label>Email<input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="teacher@example.com"/></label>
    <label>Trạng thái<select className="input" value={form.status} onChange={e=>set('status',e.target.value)}><option value="active">Đang hoạt động</option><option value="inactive">Nghỉ</option></select></label>
   </div>
   {error&&<div style={{color:'#b42318',marginTop:10}}>{error}</div>}
   <button className="btn btn-primary" style={{width:'100%',marginTop:16}} disabled={busy} onClick={save}>{busy?'Đang lưu...':'Lưu giáo viên'}</button>
  </div></div>;
}

function Reports(){
 const client=supabase();
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
 const [classId,setClassId]=useState('all');
 const [classes,setClasses]=useState<{id:string;class_code:string|null;name:string;tuition:number;status:string}[]>([]);
 const [data,setData]=useState({students:0,classes:0,teachers:0,due:0,paid:0,debt:0,paidStudents:0,partialStudents:0,unpaidStudents:0,attendanceTotal:0,attendancePresent:0,attendanceLate:0,attendanceAbsent:0,attendanceExcused:0});
 const [classRows,setClassRows]=useState<any[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const money=(n:number)=>Number(n||0).toLocaleString('vi-VN')+'đ';
 const monthStart=`${month}-01`;
 const nextMonth=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),1).toISOString().slice(0,10);
 const load=async()=>{
   setLoading(true);setError('');
   const [{data:c,error:ce},{data:s,error:se},{data:t,error:te},{data:f,error:fe},{data:a,error:ae}]=await Promise.all([
     client.from('classes').select('id,class_code,name,tuition,status').order('name'),
     client.from('students').select('id,class_id,status').eq('status','active'),
     client.from('teachers').select('id,status').eq('status','active'),
     client.from('fees').select('student_id,class_id,amount_due,amount_paid,status').eq('month',monthStart),
     client.from('attendance').select('student_id,class_id,status,lesson_date').gte('lesson_date',monthStart).lt('lesson_date',nextMonth)
   ]);
   const firstErr=ce||se||te||fe||ae;
   if(firstErr){setError(firstErr.message);setLoading(false);return;}
   const cls=(c||[]) as any[];
   const students=(s||[]) as any[];
   const teachers=(t||[]) as any[];
   const fees=(f||[]) as any[];
   const att=(a||[]) as any[];
   const activeClassIds=new Set(cls.filter(x=>x.status==='active').map(x=>x.id));
   const filteredStudents=classId==='all'?students:students.filter(x=>x.class_id===classId);
   const filteredFees=classId==='all'?fees:fees.filter(x=>x.class_id===classId);
   const filteredAtt=classId==='all'?att:att.filter(x=>x.class_id===classId);
   const due=filteredFees.reduce((n,r)=>n+Number(r.amount_due||0),0);
   const paid=filteredFees.reduce((n,r)=>n+Number(r.amount_paid||0),0);
   const classMap=new Map(cls.map(x=>[x.id,x]));
   const grouped=new Map<string,any>();
   filteredStudents.forEach(st=>{if(!grouped.has(st.class_id)){const c=classMap.get(st.class_id);grouped.set(st.class_id,{id:st.class_id,name:c?.name||'Chưa xếp lớp',students:0,due:0,paid:0,debt:0,paidStudents:0,partialStudents:0,unpaidStudents:0})}grouped.get(st.class_id).students++});
   filteredFees.forEach(r=>{if(!grouped.has(r.class_id)){const c=classMap.get(r.class_id);grouped.set(r.class_id,{id:r.class_id,name:c?.name||'—',students:0,due:0,paid:0,debt:0,paidStudents:0,partialStudents:0,unpaidStudents:0})}const x=grouped.get(r.class_id);const d=Number(r.amount_due||0),p=Number(r.amount_paid||0);x.due+=d;x.paid+=p;x.debt+=Math.max(0,d-p);if(d>0&&p>=d)x.paidStudents++;else if(p>0)x.partialStudents++;else x.unpaidStudents++});
   setClasses(cls);setClassRows(Array.from(grouped.values()).sort((x,y)=>x.name.localeCompare(y.name)));
   setData({students:filteredStudents.length,classes:classId==='all'?cls.filter(x=>x.status==='active').length:activeClassIds.has(classId)?1:0,teachers:teachers.length,due,paid,debt:Math.max(0,due-paid),paidStudents:filteredFees.filter(r=>Number(r.amount_due||0)>0&&Number(r.amount_paid||0)>=Number(r.amount_due||0)).length,partialStudents:filteredFees.filter(r=>Number(r.amount_paid||0)>0&&Number(r.amount_paid||0)<Number(r.amount_due||0)).length,unpaidStudents:filteredFees.filter(r=>Number(r.amount_paid||0)<=0).length,attendanceTotal:filteredAtt.length,attendancePresent:filteredAtt.filter(r=>r.status==='present').length,attendanceLate:filteredAtt.filter(r=>r.status==='late').length,attendanceAbsent:filteredAtt.filter(r=>r.status==='absent').length,attendanceExcused:filteredAtt.filter(r=>r.status==='excused').length});
   setLoading(false);
 };
 useEffect(()=>{load()},[month,classId]);
 const collectionPct=data.due?Math.round(data.paid/data.due*100):0;
 const attendancePct=data.attendanceTotal?Math.round((data.attendancePresent+data.attendanceLate)/data.attendanceTotal*100):0;
 const maxRevenue=Math.max(1,...classRows.map(r=>Number(r.paid||0)));
 return <>
  <div className="card" style={{padding:20}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:12,flexWrap:'wrap',marginBottom:18}}>
    <div><h3 style={{margin:'0 0 5px'}}>Báo cáo tổng hợp</h3><span style={{fontSize:13,color:'#667085'}}>Tổng hợp học viên, học phí và chuyên cần theo tháng</span></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select className="input" value={classId} onChange={e=>setClassId(e.target.value)} style={{minWidth:220}}><option value="all">Tất cả lớp</option>{classes.map(c=><option key={c.id} value={c.id}>{c.class_code?`[${c.class_code}] `:''}{c.name}</option>)}</select><input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div>
   </div>
   {error&&<div style={{background:'#fef3f2',color:'#b42318',padding:10,borderRadius:8,marginBottom:12}}>{error}</div>}
   <div className="stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
    {[[data.students,'Học viên đang học'],[data.classes,'Lớp đang học'],[data.teachers,'Giáo viên'],[data.attendanceTotal,'Lượt điểm danh']].map(([v,l])=><div key={String(l)} style={{border:'1px solid #e4e7ec',borderRadius:10,padding:15}}><div style={{fontSize:24,fontWeight:800}}>{v}</div><div style={{fontSize:12,color:'#667085',marginTop:4}}>{l}</div></div>)}
   </div>
  </div>
  <div className="stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:16}}>
   {[[money(data.due),'Tổng phải thu'],[money(data.paid),'Đã thu'],[money(data.debt),'Còn nợ'],[collectionPct+'%','Tỷ lệ thu']].map(([v,l])=><div className="card" key={String(l)} style={{padding:18}}><div style={{fontSize:22,fontWeight:800}}>{v}</div><div style={{fontSize:12,color:'#667085',marginTop:4}}>{l}</div></div>)}
  </div>
  <div className="stats" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
   <div className="card" style={{padding:20}}><h3 style={{marginTop:0}}>Trạng thái học phí</h3><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}><div style={{padding:14,borderRadius:10,background:'#ecfdf3'}}><b>{data.paidStudents}</b><div style={{fontSize:12,marginTop:4}}>Đã đóng</div></div><div style={{padding:14,borderRadius:10,background:'#fffaeb'}}><b>{data.partialStudents}</b><div style={{fontSize:12,marginTop:4}}>Đóng một phần</div></div><div style={{padding:14,borderRadius:10,background:'#eff8ff'}}><b>{data.unpaidStudents}</b><div style={{fontSize:12,marginTop:4}}>Chưa đóng</div></div></div></div>
   <div className="card" style={{padding:20}}><h3 style={{marginTop:0}}>Chuyên cần</h3><div style={{fontSize:28,fontWeight:800}}>{attendancePct}%</div><div style={{fontSize:12,color:'#667085',marginBottom:12}}>Tỷ lệ có mặt + đi trễ</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:12}}><span>🟢 {data.attendancePresent}</span><span>🟡 {data.attendanceLate}</span><span>🔴 {data.attendanceAbsent}</span><span>🔵 {data.attendanceExcused}</span></div></div>
  </div>
  <div className="card" style={{padding:20,marginTop:16}}><h3 style={{marginTop:0}}>Doanh thu theo lớp</h3>{loading?<div style={{padding:25,textAlign:'center'}}>Đang tải...</div>:<div className="table-wrap"><table className="table"><thead><tr><th>Lớp</th><th>Học viên</th><th>Phải thu</th><th>Đã thu</th><th>Còn nợ</th><th>Tiến độ thu</th></tr></thead><tbody>{classRows.map(r=>{const pct=r.due?Math.round(r.paid/r.due*100):0;return <tr key={r.id}><td><b>{r.name}</b></td><td>{r.students}</td><td>{money(r.due)}</td><td>{money(r.paid)}</td><td><b>{money(r.debt)}</b></td><td><div style={{display:'flex',alignItems:'center',gap:8,minWidth:150}}><div style={{height:8,background:'#e4e7ec',borderRadius:99,flex:1,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,pct)}%`,background:'#2563eb'}}/></div><span style={{fontSize:12}}>{pct}%</span></div></td></tr>})}{!classRows.length&&<tr><td colSpan={6} style={{textAlign:'center',padding:30,color:'#667085'}}>Chưa có dữ liệu học phí trong tháng này.</td></tr>}</tbody></table></div>}</div>
  <div className="card" style={{padding:20,marginTop:16}}><h3 style={{marginTop:0}}>Tóm tắt</h3><p style={{margin:'6px 0',color:'#475467'}}>Tháng <b>{month}</b>: trung tâm đang có <b>{data.students}</b> học viên đang học, tổng phải thu <b>{money(data.due)}</b>, đã thu <b>{money(data.paid)}</b> và còn nợ <b>{money(data.debt)}</b>.</p><p style={{margin:'6px 0',color:'#475467'}}>Chuyên cần ghi nhận <b>{data.attendanceTotal}</b> lượt, tỷ lệ có mặt + đi trễ <b>{attendancePct}%</b>.</p></div>
 </>;
}
