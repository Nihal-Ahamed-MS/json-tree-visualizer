import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './index.css';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "JSON Tree Visualizer",
  description:
    "The fastest JSON visualizer ever existed built on top of WebGPU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0a] text-zinc-50 antialiased font-sans selection:bg-cyan-500/30">
        {children}
      </body>
    </html>
  );
}
