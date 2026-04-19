
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "@/component/Menu";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "數位衣櫃",
  description: "您的專屬衣物配件管理空間",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="lofi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="m-0 flex min-h-screen items-center justify-center bg-white">
        <div className="relative h-[852px] min-h-[852px] max-h-[852px] w-[393px] min-w-[393px] max-w-[393px] overflow-hidden border border-black">
          {children}
          <Menu />
        </div>
      </body>
    </html>
  );
}
