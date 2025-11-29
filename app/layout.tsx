import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rawsab.com"),
  title: {
    default: "Rawsab Said",
    template: "%s | Rawsab Said",
  },
  description:
    "Software Engineering student at the University of Waterloo with experience across startups and scaling products. Explore my projects and work showcased on this site.",
  keywords: [
    "Rawsab Said",
    "Software Engineer",
    "Full Stack Developer",
    "Security Engineer",
    "Portfolio",
    "Web Development",
    "React",
    "Next.js",
    "TypeScript",
    "Distributed Systems",
  ],
  authors: [{ name: "Rawsab Said" }],
  creator: "Rawsab Said",
  publisher: "Rawsab Said",
  other: {
    "theme-color": "#000000",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rawsab.com",
    siteName: "Rawsab Said",
    title: "Rawsab Said",
    description:
      "Software Engineering student at the University of Waterloo with experience across startups and scaling products. Explore my projects and work showcased on this site.",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "Rawsab Said",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rawsab Said",
    description:
      "Software Engineering student at the University of Waterloo with experience across startups and scaling products. Explore my projects and work showcased on this site.",
    creator: "@rawsab",
    images: ["/og_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme initialization script - runs before page renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Default to dark mode if no preference or preference is dark
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // If localStorage is not available, default to dark mode
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7JQDLM7YY5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7JQDLM7YY5');
          `}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
