'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
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
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic products from MongoDB, utilizing offline fallback data:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
  };

  const handleExploreProductFromLookbook = (productId: string) => {
    const found = products.find((p) => p.id === productId) || PRODUCTS.find((p) => p.id === productId);
    if (found) {
      setSelectedProduct(found);
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
      <ProductRail products={products} onOpenQuickView={handleOpenProduct} />

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
        products={products}
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
