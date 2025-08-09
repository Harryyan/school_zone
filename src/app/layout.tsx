import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EnvironmentBanner } from "@/components/ui/EnvironmentBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auckland School Finder",
  description: "Find primary and secondary schools in Auckland, New Zealand. Search by location, check enrolment zones, and discover school information.",
  keywords: "Auckland schools, New Zealand education, school zones, primary school, secondary school",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        <EnvironmentBanner />
        {children}
      </body>
    </html>
  );
}
