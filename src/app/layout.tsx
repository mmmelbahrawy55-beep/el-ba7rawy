import type { Metadata } from "next";
import { Geist, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from '@/components/theme-provider';
import { SvgFilters } from '@/components/ui/svg-filters';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: "البحراوي للدعاية والإعلان | ELBA7RAWY Advertising",
    template: "%s | البحراوي للدعاية والإعلان"
  },
  description: "وكالة البحراوي للدعاية والإعلان - حلول تسويقية مبتكرة، تصميم جرافيك، طباعة، وإدارة صفحات التواصل الاجتماعي بأحدث تقنيات الذكاء الاصطناعي.",
  keywords: ["دعاية وإعلان", "تسويق إلكتروني", "البحراوي", "تصميم جرافيك", "طباعة", "إدارة صفحات", "ذكاء اصطناعي", "طنطا", "مصر"],
  authors: [{ name: "ELBA7RAWY Team" }],
  creator: "ELBA7RAWY",
  publisher: "ELBA7RAWY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://elbahrawy-adv.com",
    siteName: "البحراوي للدعاية والإعلان",
    title: "البحراوي للدعاية والإعلان | ELBA7RAWY Advertising",
    description: "وكالة البحراوي للدعاية والإعلان - حلول تسويقية مبتكرة، تصميم جرافيك، طباعة، وإدارة صفحات التواصل الاجتماعي.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "البحراوي للدعاية والإعلان",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "البحراوي للدعاية والإعلان | ELBA7RAWY Advertising",
    description: "وكالة البحراوي للدعاية والإعلان - حلول تسويقية مبتكرة وتصميمات احترافية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${cairo.variable} font-arabic antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
