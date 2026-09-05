export interface ProductInput {
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
  details?: string[];
  gsm: number;
  cut: string;
  fabric: string;
  color: string;
  colorHex: string;
  colors?: { name: string; hex: string; image: string }[];
  sizes?: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stock: number;
  images?: string[];
  tags?: string[];
  isNewDrop?: boolean;
  isLimited?: boolean;
  isBestseller?: boolean;
  editionNumber?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

/**
 * Validates complete product creation payload
 */
export function validateCreateProductInput(input: unknown): ValidationResult<ProductInput> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { body: 'Invalid or missing request body' },
    };
  }

  const raw = input as Record<string, unknown>;

  // Required String Fields
  const requiredStrings = [
    { key: 'id', label: 'Product ID' },
    { key: 'slug', label: 'Slug' },
    { key: 'name', label: 'Name' },
    { key: 'japaneseName', label: 'Japanese Name' },
    { key: 'crew', label: 'Crew' },
    { key: 'character', label: 'Character' },
    { key: 'description', label: 'Description' },
    { key: 'story', label: 'Story' },
    { key: 'cut', label: 'Cut' },
    { key: 'fabric', label: 'Fabric' },
    { key: 'color', label: 'Color' },
    { key: 'colorHex', label: 'Color Hex' },
  ];

  for (const { key, label } of requiredStrings) {
    if (typeof raw[key] !== 'string' || !raw[key].trim()) {
      errors[key] = `${label} is required and must be a non-empty string`;
    }
  }

  // Price validation
  if (typeof raw.price !== 'number' || isNaN(raw.price) || raw.price < 0) {
    errors.price = 'Price is required and must be a non-negative number';
  }

  // GSM validation
  if (typeof raw.gsm !== 'number' || isNaN(raw.gsm) || raw.gsm <= 0) {
    errors.gsm = 'GSM is required and must be a positive number';
  }

  // Stock validation
  if (typeof raw.stock !== 'number' || isNaN(raw.stock) || raw.stock < 0) {
    errors.stock = 'Stock is required and must be a non-negative integer';
  }

  // CompareAtPrice validation (optional)
  if ('compareAtPrice' in raw && raw.compareAtPrice !== undefined && raw.compareAtPrice !== null) {
    if (typeof raw.compareAtPrice !== 'number' || isNaN(raw.compareAtPrice) || raw.compareAtPrice < 0) {
      errors.compareAtPrice = 'Compare At Price must be a non-negative number';
    }
  }

  // Arrays validation
  if ('sizes' in raw && raw.sizes !== undefined) {
    if (!Array.isArray(raw.sizes)) {
      errors.sizes = 'Sizes must be an array';
    } else {
      for (const size of raw.sizes) {
        if (!VALID_SIZES.includes(size as (typeof VALID_SIZES)[number])) {
          errors.sizes = `Invalid size "${size}". Supported sizes: ${VALID_SIZES.join(', ')}`;
          break;
        }
      }
    }
  }

  if ('colors' in raw && raw.colors !== undefined) {
    if (!Array.isArray(raw.colors)) {
      errors.colors = 'Colors must be an array';
    } else {
      for (const c of raw.colors) {
        if (!c || typeof c !== 'object' || !c.name || !c.hex || !c.image) {
          errors.colors = 'Each color item must have name, hex, and image properties';
          break;
        }
      }
    }
  }

  if ('details' in raw && raw.details !== undefined && !Array.isArray(raw.details)) {
    errors.details = 'Details must be an array of strings';
  }

  if ('images' in raw && raw.images !== undefined && !Array.isArray(raw.images)) {
    errors.images = 'Images must be an array of strings';
  }

  if ('tags' in raw && raw.tags !== undefined && !Array.isArray(raw.tags)) {
    errors.tags = 'Tags must be an array of strings';
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return { isValid: false, errors };
  }

  const data: ProductInput = {
    id: (raw.id as string).trim(),
    slug: (raw.slug as string).trim().toLowerCase(),
    name: (raw.name as string).trim(),
    japaneseName: (raw.japaneseName as string).trim(),
    crew: (raw.crew as string).trim(),
    character: (raw.character as string).trim(),
    price: raw.price as number,
    compareAtPrice: typeof raw.compareAtPrice === 'number' ? raw.compareAtPrice : undefined,
    description: (raw.description as string).trim(),
    story: (raw.story as string).trim(),
    details: Array.isArray(raw.details) ? raw.details.map(String) : [],
    gsm: raw.gsm as number,
    cut: (raw.cut as string).trim(),
    fabric: (raw.fabric as string).trim(),
    color: (raw.color as string).trim(),
    colorHex: (raw.colorHex as string).trim(),
    colors: Array.isArray(raw.colors) ? (raw.colors as { name: string; hex: string; image: string }[]) : [],
    sizes: Array.isArray(raw.sizes) ? (raw.sizes as ('S' | 'M' | 'L' | 'XL' | 'XXL')[]) : [],
    stock: Math.floor(raw.stock as number),
    images: Array.isArray(raw.images) ? raw.images.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    isNewDrop: typeof raw.isNewDrop === 'boolean' ? raw.isNewDrop : false,
    isLimited: typeof raw.isLimited === 'boolean' ? raw.isLimited : false,
    isBestseller: typeof raw.isBestseller === 'boolean' ? raw.isBestseller : false,
    editionNumber: typeof raw.editionNumber === 'string' ? raw.editionNumber.trim() : undefined,
  };

  return { isValid: true, errors: {}, data };
}

/**
 * Validates product update payload (all fields optional except preventing stable ID tampering)
 */
export function validateUpdateProductInput(input: unknown): ValidationResult<Partial<ProductInput>> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { body: 'Invalid or missing request body' },
    };
  }

  const raw = input as Record<string, unknown>;
  const data: Partial<ProductInput> = {};

  // Disallow modifying ID if passed as different
  if ('id' in raw && typeof raw.id === 'string' && raw.id.trim()) {
    // If id is in payload, we keep it in data so the route handler can check matching
    data.id = raw.id.trim();
  }

  // String fields
  const stringFields = [
    'slug',
    'name',
    'japaneseName',
    'crew',
    'character',
    'description',
    'story',
    'cut',
    'fabric',
    'color',
    'colorHex',
    'editionNumber',
  ] as const;

  for (const key of stringFields) {
    if (key in raw && raw[key] !== undefined) {
      if (typeof raw[key] !== 'string' || !raw[key].trim()) {
        errors[key] = `${key} must be a non-empty string`;
      } else {
        (data as Record<string, unknown>)[key] = key === 'slug' ? raw[key].trim().toLowerCase() : raw[key].trim();
      }
    }
  }

  // Numeric fields
  if ('price' in raw && raw.price !== undefined) {
    if (typeof raw.price !== 'number' || isNaN(raw.price) || raw.price < 0) {
      errors.price = 'Price must be a non-negative number';
    } else {
      data.price = raw.price;
    }
  }

  if ('compareAtPrice' in raw && raw.compareAtPrice !== undefined) {
    if (raw.compareAtPrice === null) {
      data.compareAtPrice = undefined;
    } else if (typeof raw.compareAtPrice !== 'number' || isNaN(raw.compareAtPrice) || raw.compareAtPrice < 0) {
      errors.compareAtPrice = 'Compare At Price must be a non-negative number';
    } else {
      data.compareAtPrice = raw.compareAtPrice;
    }
  }

  if ('gsm' in raw && raw.gsm !== undefined) {
    if (typeof raw.gsm !== 'number' || isNaN(raw.gsm) || raw.gsm <= 0) {
      errors.gsm = 'GSM must be a positive number';
    } else {
      data.gsm = raw.gsm;
    }
  }

  if ('stock' in raw && raw.stock !== undefined) {
    if (typeof raw.stock !== 'number' || isNaN(raw.stock) || raw.stock < 0) {
      errors.stock = 'Stock must be a non-negative integer';
    } else {
      data.stock = Math.floor(raw.stock);
    }
  }

  // Array fields
  if ('sizes' in raw && raw.sizes !== undefined) {
    if (!Array.isArray(raw.sizes)) {
      errors.sizes = 'Sizes must be an array';
    } else {
      for (const size of raw.sizes) {
        if (!VALID_SIZES.includes(size as (typeof VALID_SIZES)[number])) {
          errors.sizes = `Invalid size "${size}". Supported sizes: ${VALID_SIZES.join(', ')}`;
          break;
        }
      }
      if (!errors.sizes) {
        data.sizes = raw.sizes as ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
      }
    }
  }

  if ('colors' in raw && raw.colors !== undefined) {
    if (!Array.isArray(raw.colors)) {
      errors.colors = 'Colors must be an array';
    } else {
      for (const c of raw.colors) {
        if (!c || typeof c !== 'object' || !c.name || !c.hex || !c.image) {
          errors.colors = 'Each color item must have name, hex, and image properties';
          break;
        }
      }
      if (!errors.colors) {
        data.colors = raw.colors as { name: string; hex: string; image: string }[];
      }
    }
  }

  if ('details' in raw && raw.details !== undefined) {
    if (!Array.isArray(raw.details)) {
      errors.details = 'Details must be an array of strings';
    } else {
      data.details = raw.details.map(String);
    }
  }

  if ('images' in raw && raw.images !== undefined) {
    if (!Array.isArray(raw.images)) {
      errors.images = 'Images must be an array of strings';
    } else {
      data.images = raw.images.map(String);
    }
  }

  if ('tags' in raw && raw.tags !== undefined) {
    if (!Array.isArray(raw.tags)) {
      errors.tags = 'Tags must be an array of strings';
    } else {
      data.tags = raw.tags.map(String);
    }
  }

  // Boolean fields
  if ('isNewDrop' in raw && raw.isNewDrop !== undefined) {
    data.isNewDrop = Boolean(raw.isNewDrop);
  }
  if ('isLimited' in raw && raw.isLimited !== undefined) {
    data.isLimited = Boolean(raw.isLimited);
  }
  if ('isBestseller' in raw && raw.isBestseller !== undefined) {
    data.isBestseller = Boolean(raw.isBestseller);
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? data : undefined,
  };
}
