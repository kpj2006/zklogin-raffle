import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ZkLoginProvider } from '@/contexts/ZkLoginContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zkLogin Raffle - Gasless Blockchain Raffles",
  description: "Join gasless raffles with zkLogin authentication and win amazing prizes on Sui blockchain",
  keywords: ["zkLogin", "Sui", "blockchain", "raffle", "NFT", "gasless", "Web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ZkLoginProvider>
          {children}
        </ZkLoginProvider>
      </body>
    </html>
  );
}
