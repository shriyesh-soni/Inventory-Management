import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthContextProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Professional inventory and stock control system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <AuthContextProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
