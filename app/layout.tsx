import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "Catering Smart CRM",
  description: "Catering CRM & Master Data System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          body, .font-sans { font-family: 'Source Sans Pro', sans-serif !important; }
        `}} />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
