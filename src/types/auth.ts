import { Product } from './index';

export type UserRole = 'user' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createdAt: string;
  ordersCount?: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface OrderItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface StoreOrder {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  shippingAddress: {
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface UserAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserSettings {
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  promotionsEmail: boolean;
  newDropNotifications: boolean;
  twoFactorAuth: boolean;
}

export type PendingAction =
  | {
      type: 'ADD_TO_CART';
      product: Product;
      size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
      color: string;
      quantity: number;
    }
  | {
      type: 'CHECKOUT';
    }
  | null;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

export type AuthTokenPayload = JWTPayload;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  user?: SafeUser;
  users?: SafeUser[];
  data?: T;
}

