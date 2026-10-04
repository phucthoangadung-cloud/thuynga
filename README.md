# Language Center Manager V1

Ứng dụng quản lý lớp học ngoại ngữ OFFLINE.

## Chạy local
1. `npm install`
2. Copy `.env.example` thành `.env.local` và điền Supabase URL + anon key.
3. Trong Supabase SQL Editor, chạy `supabase/schema.sql`.
4. `npm run dev`

## V1
Dashboard, lớp học, học viên, lịch học, điểm danh, học phí, giáo viên, báo cáo; responsive mobile/desktop.

## Lưu ý
Trang UI V1 hiện có dữ liệu demo để kiểm tra giao diện. Bước tiếp theo là nối các màn hình CRUD trực tiếp vào Supabase và thêm trang đăng nhập.
