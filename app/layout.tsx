import './globals.css';

export const metadata = {
  title: 'Trung Tâm Tiếng Anh | Ms Thúy Nga',
  description: 'Trung Tâm Tiếng Anh Ms Thúy Nga – các khóa học tiếng Anh cho trẻ em, học sinh và luyện thi Cambridge, KET, PET, IELTS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
