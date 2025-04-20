import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "./context/ProfileContext";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
