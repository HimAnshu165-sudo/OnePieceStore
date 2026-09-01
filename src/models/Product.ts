import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product as ProductType } from '@/types';

export interface IProductDocument extends Omit<ProductType, 'id'>, Document {
  id: string;
}

const ColorVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema: Schema<IProductDocument> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    japaneseName: { type: String, required: true },
    crew: { type: String, required: true, index: true },
    character: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    description: { type: String, required: true },
    story: { type: String, required: true },
    details: { type: [String], default: [] },
    gsm: { type: Number, required: true },
    cut: { type: String, required: true },
    fabric: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    colors: { type: [ColorVariantSchema], default: [] },
    sizes: {
      type: [String],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      default: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    stock: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isNewDrop: { type: Boolean, default: false },
    isLimited: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    editionNumber: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
