import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/providers/WalletProvider";
import ReactQueryClientProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRAECLAWB OS - Every Token Deserves a Brain",
  description: "Transform any Solana project into a self-operating autonomous organization powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ReactQueryClientProvider>
          <SolanaWalletProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SolanaWalletProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
