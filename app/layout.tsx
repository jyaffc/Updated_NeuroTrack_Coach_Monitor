import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { OrbitaProvider } from "@/components/orbita-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NeuroTrack",
    template: "%s | NeuroTrack",
  },
  description:
    "Coach-facing cumulative head-impact exposure tracking for collegiate soccer sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07101a] text-white">
        <OrbitaProvider>{children}</OrbitaProvider>
      </body>
    </html>
  );
}
