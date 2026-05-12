import type { Metadata } from "next";
import {
  Barlow,
  Berkshire_Swash,
  EB_Garamond,
  Geist_Mono,
  Libre_Caslon_Text,
  Outfit,
  Reenie_Beanie,
} from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

const outfit = Outfit({
  weight: ["600", "700", "800"],
  variable: "--font-outfit",
  subsets: ["latin"],
});

const reenie = Reenie_Beanie({
  weight: "400",
  variable: "--font-reenie",
  subsets: ["latin"],
});

const caslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  variable: "--font-caslon",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Candlelit marketing landing: swash display + book serif */
const landingDisplay = Berkshire_Swash({
  weight: "400",
  variable: "--font-landing-display",
  subsets: ["latin"],
});

const landingBody = EB_Garamond({
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gather",
  description:
    "Host-led gatherings in real rooms near you. Treat new friends like old ones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${outfit.variable} ${reenie.variable} ${caslon.variable} ${geistMono.variable} ${landingDisplay.variable} ${landingBody.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
