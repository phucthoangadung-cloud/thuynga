-- Bảng riêng để nhận đăng ký từ website công khai.
-- Không thay đổi các bảng students, classes, teachers, fees hiện có.
create table if not exists public.course_registrations (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  phone text not null,
  student_age text,
  course_interest text,
  note text,
  status text not null default 'new' check (status in ('new','contacted','enrolled','closed')),
  created_at timestamptz not null default now()
);

alter table public.course_registrations enable row level security;
-- Không tạo policy public; việc insert được thực hiện trong API route phía server.
-- Không đưa SUPABASE_SERVICE_ROLE_KEY vào client/browser.
