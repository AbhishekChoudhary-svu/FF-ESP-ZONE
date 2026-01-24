import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
   title: "FF-ESP-ZONE | Free Fire Esports Platform",
  description: "Join tournaments, recruit teammates, and dominate the Free Fire esports scene",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <ThemeProvider>
        {children}
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
