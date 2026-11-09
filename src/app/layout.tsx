import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paisa Kidhar - Pakistan-Focused Expense & Finance Tracker',
  description:
    'Smart household finance, Udhaar ledger, Kameti tracker, and Urdu voice expense manager for Pakistan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-[#f8fafc]">{children}</body>
    </html>
  );
}
