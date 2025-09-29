import type { Metadata } from "next";
import { Geist, Geist_Mono, Allan, Merriweather } from "next/font/google";
import "./globals.css";
import "animate.css";
import SessionProvider from "@/providers/SessionProvider";
import Navbar from "@/components/Navigation/Navbar";
import SideBar from "@/components/Navigation/SideBar";
import ModalProvider from "@/providers/ModalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const allan = Allan({
  variable: "--font-allan",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-main",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskky - Tu gestor de tareas simple y eficiente",
  description: "Una aplicación simple y eficiente para gestionar tus tareas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${allan.variable} ${merriweather.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ModalProvider>
            <div className="flex h-screen bg-gray-50">
              <SideBar />
              <div className="flex flex-1 flex-col gap-4 bg-white p-4 rounded-lg h-screen shadow-xs">
                <Navbar />
                <main className="flex-1 overflow-y-hidden h-[calc(100vh-112px)]">
                  {children}
                </main>
              </div>
            </div>
          </ModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
