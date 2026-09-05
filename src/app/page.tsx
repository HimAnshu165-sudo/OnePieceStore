'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { fetchProductBySlug } from '@/lib/products';
import { Navbar } from '@/components/Navbar/Navbar';
import { Hero } from '@/components/Hero/Hero';
import { Marquee } from '@/components/Marquee/Marquee';
import { ProductRail } from '@/components/ProductRail/ProductRail';
import { Lookbook } from '@/components/Lookbook/Lookbook';
import { BrandStory } from '@/components/BrandStory/BrandStory';
import { Footer } from '@/components/Footer/Footer';
import { ProductDetailModal } from '@/components/ProductDetailModal/ProductDetailModal';
import { SearchModal } from '@/components/SearchModal/SearchModal';
import { CartDrawer } from '@/components/CartDrawer/CartDrawer';
import { WishlistDrawer } from '@/components/WishlistDrawer/WishlistDrawer';
import { CheckoutModal } from '@/components/CheckoutModal/CheckoutModal';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
  };

  const handleExploreProductFromLookbook = async (productId: string) => {
    const product = await fetchProductBySlug(productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  return (
    <main className="min-h-screen bg-[#070707] text-[#f4f0e8] selection:bg-[#b5121b] selection:text-white">
      {/* Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Cinematic Hero with Cursor-Controlled Video */}
      <Hero />

      {/* Editorial Marquee Ticker */}
      <Marquee />

      {/* Curated Product Collection */}
      <ProductRail onOpenQuickView={handleOpenProduct} />

      {/* Tokyo Lookbook Campaign */}
      <Lookbook onExploreProduct={handleExploreProductFromLookbook} />

      {/* Craftsmanship & 500 GSM Story */}
      <BrandStory />

      {/* Footer */}
      <Footer />

      {/* Interactive Overlays & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={handleCloseProduct}
        onInstantCheckout={() => {
          handleCloseProduct();
          setIsCheckoutOpen(true);
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleOpenProduct}
      />

      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <WishlistDrawer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </main>
  );
}
