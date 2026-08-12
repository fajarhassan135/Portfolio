import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import MusicToggle from "@/components/MusicToggle";

export const metadata: Metadata = {
  title: "Fajar Hassan — Portfolio",
  description: "Full-stack & AI engineer — interactive portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <MusicToggle />
      </body>
    </html>
  );
}
