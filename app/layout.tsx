import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상호텍스트 지도 | Intertextuality Map",
  description:
    "소설 속에 인용되고 반향하는 다른 작품들을 네트워크로 시각화한 독서 지도입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
