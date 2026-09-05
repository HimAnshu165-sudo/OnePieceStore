import mongoose, { Schema, Model, Document } from 'mongoose';
import { OrderStatus, PaymentStatus, OrderItem } from '@/types/auth';

export interface IOrderDocument extends Document {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber: string;
  shippingAddress: {
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.Mixed,
      required: true,
    },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Japan' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    customerName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded'],
      default: 'Paid',
    },
    trackingNumber: { type: String, default: '' },
    shippingAddress: { type: ShippingAddressSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        if (ret._id) {
          ret._mongoId = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        if (ret._id) {
          ret._mongoId = ret._id.toString();
        }
        return ret;
      },
    },
  }
);

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export { Order };
export default Order;
