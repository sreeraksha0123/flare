import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: {
    default: "WebWise - Smart Bookmark Management",
    template: "%s | WebWise"
  },
  description: "Organize, sync, and access your bookmarks seamlessly across all devices. The intelligent bookmark manager built for productivity.",
  keywords: ["bookmark manager", "productivity tool", "link organization", "cross-device sync", "web bookmarks", "link management"],
  authors: [{ name: "Sree Raksha S P" }],
  creator: "Sree Raksha S P",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WebWise",
    title: "WebWise - Smart Bookmark Management",
    description: "Organize, sync, and access your bookmarks seamlessly across all devices.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebWise - Smart Bookmark Management",
    description: "Organize, sync, and access your bookmarks seamlessly across all devices.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}