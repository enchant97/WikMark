import env from "@/env";
import { Metadata } from "next";
import React from "react";
import "./globals.css";
import Header from "./_ui/Header";
import Footer from "./_ui/Footer";

export const metadata: Metadata = {
  title: env.META_TITLE,
  description: env.META_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
