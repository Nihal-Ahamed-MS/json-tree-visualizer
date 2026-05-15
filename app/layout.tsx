import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"] });

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
    <html lang="en" className={dmSans.className}>
      <body className="bg-[#faf9f6] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
