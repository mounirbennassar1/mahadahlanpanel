import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Fraunces } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahadahlan — Lead Management",
  description: "Centralised lead management for Mahadahlan landing pages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
