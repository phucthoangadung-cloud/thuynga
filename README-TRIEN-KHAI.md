# Nâng cấp website Trung Tâm Tiếng Anh Cô Thuý Nga

## Các tệp trong gói
- `app/page.tsx`: trang giới thiệu công khai mới.
- `app/globals.css`: giao diện công khai + giữ các lớp CSS quản lý cũ.
- `app/admin/page.tsx`: bản sao trang quản lý cũ, đã sửa đường dẫn import Supabase.
- `app/api/register/route.ts`: API nhận đăng ký, lưu vào Supabase phía máy chủ.
- `supabase/registration-schema.sql`: tạo bảng đăng ký riêng.

## Cách cập nhật GitHub an toàn
1. Trước khi sửa, tạo nhánh hoặc tải ZIP sao lưu repository hiện tại.
2. Tải `app/admin/page.tsx` trong gói này lên repository. Tệp này là bản sao của trang quản lý cũ từ nội dung bạn đã gửi; kiểm tra kỹ rằng bản sao đúng với phiên bản mới nhất trong GitHub.
3. Thay `app/page.tsx` bằng `app/page.tsx` trong gói.
4. Thay `app/globals.css` bằng `app/globals.css` trong gói.
5. Thêm `app/api/register/route.ts` và `supabase/registration-schema.sql` theo đúng đường dẫn.
6. Cập nhật `app/layout.tsx` metadata theo mẫu bên dưới.
7. Trong Supabase SQL Editor, chạy `supabase/registration-schema.sql`.
8. Trong Vercel Project Settings > Environment Variables, cấu hình `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` cho Production/Preview theo nhu cầu. Khóa service role chỉ dùng server, tuyệt đối không có tiền tố NEXT_PUBLIC.
9. Redeploy và kiểm tra trang chủ, `/admin`, gửi thử biểu mẫu và bản ghi trong `course_registrations`.

## Metadata gợi ý cho app/layout.tsx
```tsx
import './globals.css';
export const metadata = {
  title: 'Trung Tâm Tiếng Anh Cô Thuý Nga',
  description: 'Các khóa học tiếng Anh cho trẻ em, học sinh và luyện thi Cambridge, KET, PET, IELTS.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
```

## Lưu ý
- Bản quản lý cũ được chuyển từ `/` sang `/admin`; URL nội bộ sẽ đổi.
- Không chạy SQL xóa bảng cũ. SQL trong gói chỉ tạo bảng `course_registrations`.
- Chưa thể xác nhận build/deploy thật nếu chưa có quyền GitHub/Vercel/Supabase. Sau khi tải lên, kiểm tra Vercel Build Logs.
