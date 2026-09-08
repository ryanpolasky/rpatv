import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const rounded = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RPATV — Island News",
  description:
    "The island's most trusted source for world news, squad activity, and developing nonsense.",
};

export const viewport: Viewport = {
  themeColor: "#dff5fb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rounded.variable} ${mono.variable}`}>
        <a className="skipLink" href="#main">
          Skip to broadcast
        </a>
        {children}
      </body>
    </html>
  );
}
