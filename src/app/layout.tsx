import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Caveat } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jan Sambad Assam — Civic Grievance Redressal Portal",
  description:
    "A unified digital public infrastructure for Assamese citizens to report, track, and resolve civic grievances directly with district officials across all 35 districts.",
  keywords: ["Assam", "Jan Sambad", "grievance redressal", "civic portal", "district administration", "Assam government"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${caveat.variable} font-sans antialiased bg-[#F7F6F2] text-[#111318]`}
      >
        {children}
      </body>
    </html>
  );
}
