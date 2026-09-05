import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://grandlinesupply.jp'),
  title: 'SHIN SEKAI // GRAND LINE SUPPLY CO. | Luxury One Piece Streetwear',
  description:
    'Exclusive One Piece-inspired luxury streetwear. 500 GSM Japanese loopback cotton, vintage washed garments, limited edition cuts for the new era crew.',
  keywords: [
    'One Piece Streetwear',
    'Grand Line Supply',
    'Japanese Streetwear',
    'Heavyweight Tee',
    'Anime Fashion',
    '500 GSM Boxy Cut',
    'Luffy Sun God',
    'Shin Sekai'
  ],
  openGraph: {
    title: 'SHIN SEKAI // GRAND LINE SUPPLY CO.',
    description: 'Limited edition Japanese streetwear inspired by One Piece mythology.',
    type: 'website',
    images: ['/images/lookbook-night.jpg']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${jakarta.variable} ${space.variable}`}>
      <body className="antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
