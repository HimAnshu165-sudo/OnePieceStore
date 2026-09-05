import { AuthUser, StoreOrder, UserAddress, UserSettings } from '@/types/auth';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';

export const INITIAL_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: 'user-admin-01',
    name: 'Commander Kyojuro',
    email: 'admin@demonslayer.store',
    passwordHash: 'Admin@123',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+81 3-5555-0199',
    address: 'Chiyoda Ward, Marunouchi 1-1',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '100-0005',
    country: 'Japan',
    createdAt: '2024-01-15T09:00:00Z',
    ordersCount: 42
  },
  {
    id: 'user-demo-01',
    name: 'Tanjiro Kamado',
    email: 'tanjiro@demonslayer.store',
    passwordHash: 'Demon@123',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+81 90-1234-5678',
    address: 'Shibuya Ward, Dogenzaka 2-24-1',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '150-0043',
    country: 'Japan',
    createdAt: '2024-02-10T14:30:00Z',
    ordersCount: 3
  },
  {
    id: 'user-demo-02',
    name: 'Zenitsu Agatsuma',
    email: 'zenitsu@demonslayer.store',
    passwordHash: 'Thunder@123',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    phone: '+81 80-9876-5432',
    address: 'Shinjuku Ward, Kabukicho 1-8',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '160-0021',
    country: 'Japan',
    createdAt: '2024-03-01T10:15:00Z',
    ordersCount: 1
  },
  {
    id: 'user-demo-03',
    name: 'Nezuko Kamado',
    email: 'nezuko@demonslayer.store',
    passwordHash: 'Demon@123',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+81 90-4455-6677',
    address: 'Minato Ward, Roppongi 6-10',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '106-0032',
    country: 'Japan',
    createdAt: '2024-03-12T16:45:00Z',
    ordersCount: 4
  },
  {
    id: 'user-demo-04',
    name: 'Inosuke Hashibira',
    email: 'inosuke@demonslayer.store',
    passwordHash: 'Beast@123',
    role: 'user',
    status: 'suspended',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    phone: '+81 90-8888-9999',
    address: 'Meguro Ward, Nakameguro 3-12',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '153-0061',
    country: 'Japan',
    createdAt: '2024-03-20T11:20:00Z',
    ordersCount: 0
  }
];

export const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: 'ORD-849201-DS',
    userId: 'user-demo-01',
    userEmail: 'tanjiro@demonslayer.store',
    customerName: 'Tanjiro Kamado',
    items: [
      {
        product: PRODUCTS[0],
        selectedSize: 'L',
        selectedColor: 'Acid Washed Obsidian',
        quantity: 1
      },
      {
        product: PRODUCTS[1],
        selectedSize: 'XL',
        selectedColor: 'Deep Forest Moss',
        quantity: 1
      }
    ],
    subtotal: 183,
    discount: 20,
    total: 163,
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    trackingNumber: 'JP-EXP-992817263',
    shippingAddress: {
      address: 'Shibuya Ward, Dogenzaka 2-24-1',
      city: 'Tokyo',
      state: 'Tokyo Prefecture',
      postalCode: '150-0043',
      country: 'Japan'
    },
    createdAt: '2024-08-14T11:32:00Z'
  },
  {
    id: 'ORD-391824-DS',
    userId: 'user-demo-01',
    userEmail: 'tanjiro@demonslayer.store',
    customerName: 'Tanjiro Kamado',
    items: [
      {
        product: PRODUCTS[2] || PRODUCTS[0],
        selectedSize: 'L',
        selectedColor: 'Vintage Washed Black',
        quantity: 1
      }
    ],
    subtotal: 145,
    discount: 0,
    total: 145,
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    trackingNumber: 'JP-EXP-448102941',
    shippingAddress: {
      address: 'Shibuya Ward, Dogenzaka 2-24-1',
      city: 'Tokyo',
      state: 'Tokyo Prefecture',
      postalCode: '150-0043',
      country: 'Japan'
    },
    createdAt: '2024-09-01T15:20:00Z'
  },
  {
    id: 'ORD-552109-DS',
    userId: 'user-demo-01',
    userEmail: 'tanjiro@demonslayer.store',
    customerName: 'Tanjiro Kamado',
    items: [
      {
        product: PRODUCTS[3] || PRODUCTS[0],
        selectedSize: 'M',
        selectedColor: 'Natural Vintage White',
        quantity: 1
      }
    ],
    subtotal: 92,
    discount: 10,
    total: 82,
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    trackingNumber: 'JP-EXP-110293847',
    shippingAddress: {
      address: 'Shibuya Ward, Dogenzaka 2-24-1',
      city: 'Tokyo',
      state: 'Tokyo Prefecture',
      postalCode: '150-0043',
      country: 'Japan'
    },
    createdAt: '2024-09-04T08:45:00Z'
  },
  {
    id: 'ORD-670192-DS',
    userId: 'user-demo-02',
    userEmail: 'zenitsu@demonslayer.store',
    customerName: 'Zenitsu Agatsuma',
    items: [
      {
        product: PRODUCTS[0],
        selectedSize: 'M',
        selectedColor: 'Acid Washed Obsidian',
        quantity: 1
      }
    ],
    subtotal: 95,
    discount: 0,
    total: 95,
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    shippingAddress: {
      address: 'Shinjuku Ward, Kabukicho 1-8',
      city: 'Tokyo',
      state: 'Tokyo Prefecture',
      postalCode: '160-0021',
      country: 'Japan'
    },
    createdAt: '2024-09-05T02:10:00Z'
  }
];

export const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-01',
    title: 'Tokyo Residence (HQ)',
    fullName: 'Tanjiro Kamado',
    phone: '+81 90-1234-5678',
    addressLine: 'Shibuya Ward, Dogenzaka 2-24-1, Residence 402',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '150-0043',
    country: 'Japan',
    isDefault: true
  },
  {
    id: 'addr-02',
    title: 'Studio Atelier',
    fullName: 'Tanjiro Kamado',
    phone: '+81 90-1234-5678',
    addressLine: 'Harajuku Jingumae 4-12, Atelier 2B',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    postalCode: '150-0001',
    country: 'Japan',
    isDefault: false
  }
];

export const INITIAL_SETTINGS: UserSettings = {
  orderUpdatesEmail: true,
  orderUpdatesSms: true,
  promotionsEmail: false,
  newDropNotifications: true,
  twoFactorAuth: false
};

// STORAGE KEYS
const USERS_KEY = 'ds_streetwear_users';
const ORDERS_KEY = 'ds_streetwear_orders';
const PRODUCTS_KEY = 'ds_streetwear_products';
const ADDRESSES_PREFIX = 'ds_streetwear_addr_';
const SETTINGS_PREFIX = 'ds_streetwear_settings_';

// SAFE LOCAL STORAGE HELPERS
export function getStoredUsers(): (AuthUser & { passwordHash: string })[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: (AuthUser & { passwordHash: string })[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
}

export function getStoredOrders(): StoreOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: StoreOrder[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders', err);
  }
}

export function addStoredOrder(order: StoreOrder) {
  const orders = getStoredOrders();
  const updated = [order, ...orders];
  saveStoredOrders(updated);
  return updated;
}

export function updateStoredOrderStatus(orderId: string, status: StoreOrder['orderStatus']) {
  const orders = getStoredOrders();
  const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
  saveStoredOrders(updated);
  return updated;
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products', err);
  }
}

export function addStoredProduct(product: Product): Product[] {
  const products = getStoredProducts();
  const updated = [product, ...products];
  saveStoredProducts(updated);
  return updated;
}

export function updateStoredProduct(product: Product): Product[] {
  const products = getStoredProducts();
  const updated = products.map((p) => (p.id === product.id ? product : p));
  saveStoredProducts(updated);
  return updated;
}

export function deleteStoredProduct(productId: string): Product[] {
  const products = getStoredProducts();
  const updated = products.filter((p) => p.id !== productId);
  saveStoredProducts(updated);
  return updated;
}

export function getStoredAddresses(userId: string): UserAddress[] {
  if (typeof window === 'undefined') return INITIAL_ADDRESSES;
  try {
    const raw = localStorage.getItem(`${ADDRESSES_PREFIX}${userId}`);
    if (!raw) {
      localStorage.setItem(`${ADDRESSES_PREFIX}${userId}`, JSON.stringify(INITIAL_ADDRESSES));
      return INITIAL_ADDRESSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADDRESSES;
  }
}

export function saveStoredAddresses(userId: string, addresses: UserAddress[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${ADDRESSES_PREFIX}${userId}`, JSON.stringify(addresses));
  } catch (err) {
    console.error('Failed to save addresses', err);
  }
}

export function getStoredSettings(userId: string): UserSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(`${SETTINGS_PREFIX}${userId}`);
    if (!raw) {
      localStorage.setItem(`${SETTINGS_PREFIX}${userId}`, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(userId: string, settings: UserSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${SETTINGS_PREFIX}${userId}`, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
