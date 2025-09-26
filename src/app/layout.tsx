import type {Metadata} from "next";

import {Inter} from "next/font/google";

import "./globals.css";
import {AuthProvider} from "@/domains/auth";
import {ClassroomDataProvider} from "@/domains/classroom";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Semillero Digital - Dashboard",
  description: "Dashboard de gestión educativa para Semillero Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ClassroomDataProvider>{children}</ClassroomDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
