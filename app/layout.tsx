import { AppProvider } from "@/lib/auth-context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://cinemaplot.com'),
  title: {
    default: "CinemaPlot - Create, Share & Discover Amazing Events & Films",
    template: "%s | CinemaPlot"
  },
  description: "Build a community around your events and movies. Connect with audiences, get followers, and make your content discoverable. Join thousands of creators on CinemaPlot.",
  keywords: [
    "events",
    "movies",
    "films",
    "community",
    "creators",
    "filmmakers",
    "event planning",
    "movie sharing",
    "cinema",
    "entertainment",
    "indie films",
    "film festivals",
    "movie reviews",
    "event discovery"
  ],
  authors: [{ name: "CinemaPlot Team" }],
  creator: "CinemaPlot",
  publisher: "CinemaPlot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CinemaPlot",
    title: "CinemaPlot - Create, Share & Discover Amazing Events & Films",
    description: "Build a community around your events and movies. Connect with audiences, get followers, and make your content discoverable.",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "CinemaPlot - Create, Share & Discover Amazing Events & Films",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CinemaPlot - Create, Share & Discover Amazing Events & Films",
    description: "Build a community around your events and movies. Connect with audiences, get followers, and make your content discoverable.",
    images: ["/social-preview.png"],
    creator: "@cinemaplot",
    site: "@cinemaplot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: {
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION || '',
    },
  },
  category: 'entertainment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/public/file.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "CinemaPlot",
              "description": "Build a community around your events and movies. Connect with audiences, get followers, and make your content discoverable.",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://cinemaplot.com",
              "sameAs": [
                "https://twitter.com/cinemaplot",
                "https://facebook.com/cinemaplot",
                "https://instagram.com/cinemaplot"
              ],
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://cinemaplot.com"}/discover?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
