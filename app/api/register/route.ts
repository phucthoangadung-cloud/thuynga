import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parent_name = typeof body.parent_name === 'string' ? body.parent_name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const student_age = typeof body.student_age === 'string' ? body.student_age.trim() : '';
    const course_interest = typeof body.course_interest === 'string' ? body.course_interest.trim() : '';
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    if (!parent_name || !phone) return NextResponse.json({ error: 'Vui lòng nhập họ tên phụ huynh và số điện thoại.' }, { status: 400 });
    if (parent_name.length > 120 || phone.length > 25 || note.length > 1000 || course_interest.length > 120) return NextResponse.json({ error: 'Thông tin vượt quá độ dài cho phép.' }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: 'Biểu mẫu chưa được cấu hình. Vui lòng liên hệ trung tâm qua kênh trực tiếp.' }, { status: 503 });
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await db.from('course_registrations').insert({ parent_name, phone, student_age: student_age || null, course_interest: course_interest || null, note: note || null, status: 'new' });
    if (error) { console.error('Registration insert failed:', error.message); return NextResponse.json({ error: 'Chưa lưu được đăng ký. Vui lòng thử lại sau.' }, { status: 500 }); }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Dữ liệu gửi chưa hợp lệ.' }, { status: 400 });
  }
}
