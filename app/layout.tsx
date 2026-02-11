import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Transport Combiné 2026 — OTC/GNTC',
  description: 'Cartographie interactive des flux de transport combiné rail-route',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body className="font-display bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
