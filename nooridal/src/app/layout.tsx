import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "./context/ProfileContext";
import { AddressProvider } from './context/AddressContext';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nooridal",
  description: "Nooridal Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script 
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ProfileProvider>
          <AddressProvider>
            {children}
          </AddressProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
