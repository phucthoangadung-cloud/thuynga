THUY NGA LANGUAGE CENTER - GÓI CẬP NHẬT TỔNG HỢP

Gói này hợp nhất các tệp mã nguồn có trong bản cập nhật gần nhất và các sửa lỗi build đã xác định:
- Trang chủ, trang quản trị, API đăng ký, CSS và SQL từ gói website email-registration-fixed.
- Trang /tkb hiển thị đồng thời 3 buổi Sáng - Chiều - Tối, có nút xuất ảnh PNG, in/lưu PDF và ngày hiệu lực.
- next.config.mjs thay cho next.config.ts (không để hai file cấu hình cùng tồn tại).
- Thêm dependency xlsx, @supabase/ssr và html2canvas.
- Thêm lib/supabase.ts dùng createBrowserClient.

TRƯỚC KHI TRIỂN KHAI:
1. Sao lưu repository hiện tại.
2. Đối chiếu và gộp các tệp trong thư mục thuynga-site vào repository hiện tại; không xóa các trang/API khác đang dùng mà không kiểm tra.
3. Đảm bảo ở thư mục gốc chỉ còn next.config.mjs, xóa next.config.ts nếu còn.
4. Đặt NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong Vercel > Settings > Environment Variables.
5. Cài dependency bằng npm install để tạo/cập nhật package-lock.json, sau đó commit package.json và package-lock.json.
6. Push lên GitHub và kiểm tra Build Logs.

LƯU Ý:
- Không có thông tin bí mật trong gói này; không đưa service-role key vào client.
- Trang thời khóa biểu đọc view public_timetable. Nếu chưa tạo view này trong Supabase, chạy file SQL đã được cung cấp trước đó hoặc dùng schema thực tế để tạo view đúng.
- Đây là gói hợp nhất từ các tệp nguồn có sẵn trong cuộc trò chuyện, không phải bản tải trực tiếp từ repository GitHub hiện tại. Hãy sao lưu và đối chiếu các thay đổi mới nhất của repository trước khi thay thế hàng loạt.
