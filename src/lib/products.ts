import { Product, CategoryFilterType, SortOption } from '@/types';
import { PRODUCTS } from '@/data/products';

export interface FetchProductsOptions {
  q?: string;
  crew?: CategoryFilterType | string;
  sort?: SortOption | string;
}

/**
 * Maps frontend SortOption to backend API sort parameter
 */
export function mapSortOptionToApi(sort?: SortOption | string): string | undefined {
  if (!sort) return undefined;
  switch (sort) {
    case 'PRICE_LOW':
    case 'price_asc':
      return 'price_asc';
    case 'PRICE_HIGH':
    case 'price_desc':
      return 'price_desc';
    case 'GSM':
    case 'gsm':
      return 'gsm';
    case 'NEWEST':
    case 'newest':
      return 'newest';
    case 'FEATURED':
    default:
      return undefined;
  }
}

/**
 * Fetches products list from public API (GET /api/products)
 * Safely falls back to local static catalog on network/server errors to prevent UI crash.
 */
export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  try {
    const params = new URLSearchParams();

    if (options.q?.trim()) {
      params.set('q', options.q.trim());
    }

    if (options.crew && options.crew !== 'ALL') {
      params.set('crew', options.crew.trim());
    }

    const apiSort = mapSortOptionToApi(options.sort);
    if (apiSort) {
      params.set('sort', apiSort);
    }

    const queryString = params.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Product API returned status ${res.status}, falling back to static data.`);
      return getStaticFallbackProducts(options);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    }

    return getStaticFallbackProducts(options);
  } catch (err) {
    console.warn('Failed to fetch products from API, using fallback:', err);
    return getStaticFallbackProducts(options);
  }
}

/**
 * Fetches single product by slug or custom ID from public API (GET /api/products/[slug])
 */
export async function fetchProductBySlug(slugOrId: string): Promise<Product | null> {
  if (!slugOrId?.trim()) return null;

  const trimmed = slugOrId.trim();
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(trimmed)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      // Fallback search in static data
      const fallback = PRODUCTS.find((p) => p.slug === trimmed || p.id === trimmed);
      return fallback || null;
    }

    const data = await res.json();
    if (data.success && data.product) {
      return data.product;
    }

    const fallback = PRODUCTS.find((p) => p.slug === trimmed || p.id === trimmed);
    return fallback || null;
  } catch (err) {
    console.warn(`Failed to fetch product "${slugOrId}" from API:`, err);
    const fallback = PRODUCTS.find((p) => p.slug === trimmed || p.id === trimmed);
    return fallback || null;
  }
}

/**
 * Local fallback filter in case API is temporarily unavailable
 */
function getStaticFallbackProducts(options: FetchProductsOptions): Product[] {
  let result = [...PRODUCTS];

  if (options.crew && options.crew !== 'ALL') {
    result = result.filter((p) => p.crew === options.crew);
  }

  if (options.q?.trim()) {
    const query = options.q.toLowerCase().trim();
    result = result.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.character.toLowerCase().includes(query) ||
        p.crew.toLowerCase().includes(query) ||
        p.japaneseName.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }

  const apiSort = mapSortOptionToApi(options.sort);
  if (apiSort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (apiSort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (apiSort === 'gsm') {
    result.sort((a, b) => b.gsm - a.gsm);
  } else if (apiSort === 'newest') {
    result.sort((a, b) => (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0));
  }

  return result;
}
