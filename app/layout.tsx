import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Trung Tâm Tiếng Anh Cô Thuý Nga | Vững nền tảng – Tự tin tương lai',
  description: 'Môi trường học tiếng Anh tích cực cho trẻ em và học sinh. Khám phá khóa học, đội ngũ giáo viên và đăng ký học thử tại Trung Tâm Tiếng Anh Cô Thuý Nga.',
  keywords: ['Trung tâm tiếng Anh Cô Thuý Nga', 'tiếng Anh trẻ em', 'Starters', 'Movers', 'Flyers', 'IELTS'],
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
