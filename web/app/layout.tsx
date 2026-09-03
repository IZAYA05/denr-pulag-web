import "./(CSS)/globals.css";
import "./(CSS)/fullcalendar.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme/Theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "E-PULAG",
    template: "%s | E-PULAG",
  },
  description: "Official Mount Pulag Reservation System",
  keywords: [
    "Mount Pulag",
    "E-PULAG",
    "Reservation",
    "Booking",
    "DENR",
    "Benguet",
  ],
  authors: [{ name: "E-PULAG Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-zinc-900 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-white`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}