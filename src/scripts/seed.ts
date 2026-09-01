import mongoose from 'mongoose';
import { PRODUCTS } from '../data/products';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onepiece_store';

const ColorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
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
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seed() {
  console.log('Connecting to local MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  console.log(`Seeding ${PRODUCTS.length} products...`);
  for (const item of PRODUCTS) {
    await Product.findOneAndUpdate(
      { id: item.id },
      { $set: item },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`✓ Seeded: ${item.name} (${item.id})`);
  }

  const count = await Product.countDocuments();
  console.log(`\n🎉 Seeding complete! Total products in local MongoDB: ${count}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
