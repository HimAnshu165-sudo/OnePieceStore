import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProductColor {
  name: string;
  hex: string;
  image: string;
}

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface IProductDocument extends Document {
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
  colors: IProductColor[];
  sizes: ProductSize[];
  stock: number;
  images: string[];
  tags: string[];
  isNewDrop?: boolean;
  isLimited?: boolean;
  isBestseller?: boolean;
  editionNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: [true, 'Color name is required'], trim: true },
    hex: { type: String, required: [true, 'Color hex is required'], trim: true },
    image: { type: String, required: [true, 'Color image URL is required'], trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    id: {
      type: String,
      required: [true, 'Please provide a product ID'],
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a product slug'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    japaneseName: {
      type: String,
      required: [true, 'Please provide a Japanese product name'],
      trim: true,
    },
    crew: {
      type: String,
      required: [true, 'Please provide a crew category'],
      trim: true,
      index: true,
    },
    character: {
      type: String,
      required: [true, 'Please provide a character name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be a positive number'],
      index: true,
    },
    compareAtPrice: {
      type: Number,
      required: false,
      min: [0, 'Compare price must be a positive number'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true,
    },
    story: {
      type: String,
      required: [true, 'Please provide a product story'],
      trim: true,
    },
    details: {
      type: [String],
      required: true,
      default: [],
    },
    gsm: {
      type: Number,
      required: [true, 'Please provide fabric GSM rating'],
      min: [0, 'GSM must be a positive number'],
      index: true,
    },
    cut: {
      type: String,
      required: [true, 'Please provide a garment cut silhouette'],
      trim: true,
    },
    fabric: {
      type: String,
      required: [true, 'Please provide fabric material composition'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Please provide a primary color name'],
      trim: true,
    },
    colorHex: {
      type: String,
      required: [true, 'Please provide a primary color hex code'],
      trim: true,
    },
    colors: {
      type: [ProductColorSchema],
      required: true,
      default: [],
    },
    sizes: {
      type: [String],
      enum: {
        values: ['S', 'M', 'L', 'XL', 'XXL'],
        message: '{VALUE} is not a valid size',
      },
      required: true,
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide inventory stock count'],
      min: [0, 'Stock cannot be negative'],
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
    isNewDrop: {
      type: Boolean,
      default: false,
      index: true,
    },
    isLimited: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    editionNumber: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for full-text search across product catalog
ProductSchema.index({
  name: 'text',
  japaneseName: 'text',
  character: 'text',
  crew: 'text',
  tags: 'text',
});

// Next.js hot module replacement cache safeguard
const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema);

export { Product };
export default Product;

