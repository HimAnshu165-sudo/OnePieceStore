export interface Product {
  id: string;
  slug: string;
  name: string;
  japaneseName: string;
  crew: string;
  character: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  story: string;
  details: string[];
  gsm: number;
  cut: string;
  fabric: string;
  color: string;
  colorHex: string;
  colors: { name: string; hex: string; image: string }[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stock: number;
  images: string[];
  tags: string[];
  isNewDrop?: boolean;
  isLimited?: boolean;
  isBestseller?: boolean;
  editionNumber?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  selectedColor: string;
  quantity: number;
}

export type CategoryFilterType = 'ALL' | 'STRAW_HAT' | 'HEART' | 'RED_HAIR' | 'MARINE' | 'WANO';

export type SortOption = 'FEATURED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'NEWEST' | 'GSM';
