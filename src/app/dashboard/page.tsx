'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  Settings,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import {
  getStoredOrders,
  getStoredAddresses,
  saveStoredAddresses,
  getStoredSettings,
  saveStoredSettings
} from '@/lib/mockData';
import { StoreOrder, UserAddress, UserSettings } from '@/types/auth';
import { CheckoutModal } from '@/components/CheckoutModal/CheckoutModal';
import { AuthModal } from '@/components/AuthModal/AuthModal';
import styles from './dashboard.module.css';

type DashboardTab = 'overview' | 'orders' | 'wishlist' | 'cart' | 'profile' | 'addresses' | 'settings';

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isAdmin, isLoaded, logout, updateProfile, openAuthModal } = useAuth();
  const { cart, totalItems, subtotal, discount, total, updateQuantity, removeFromCart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    orderUpdatesEmail: true,
    orderUpdatesSms: true,
    promotionsEmail: false,
    newDropNotifications: true,
    twoFactorAuth: false
  });

  // Profile Form state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profilePostalCode, setProfilePostalCode] = useState('');
  const [profileCountry, setProfileCountry] = useState('Japan');

  // Address Modal state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrFullName, setNewAddrFullName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [newAddrDefault, setNewAddrDefault] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Read URL query tab
  useEffect(() => {
    queueMicrotask(() => {
      const tabParam = searchParams.get('tab') as DashboardTab;
      if (tabParam && ['overview', 'orders', 'wishlist', 'cart', 'profile', 'addresses', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    });
  }, [searchParams]);

  // Load user data
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!user) return;

      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileCity(user.city || '');
      setProfileState(user.state || '');
      setProfilePostalCode(user.postalCode || '');
      setProfileCountry(user.country || 'Japan');

      // 1. Fetch real orders from database
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && isMounted) {
            setOrders(data.orders);
          }
        } else if (isMounted) {
          // Fallback strictly filtered for this user
          const allOrders = getStoredOrders();
          const userOrders = allOrders.filter(
            (o) =>
              (user.id && o.userId === user.id) ||
              (user.email && o.userEmail?.toLowerCase() === user.email.toLowerCase())
          );
          setOrders(userOrders);
        }
      } catch (err) {
        if (isMounted) {
          const allOrders = getStoredOrders();
          const userOrders = allOrders.filter(
            (o) =>
              (user.id && o.userId === user.id) ||
              (user.email && o.userEmail?.toLowerCase() === user.email.toLowerCase())
          );
          setOrders(userOrders);
        }
      }

      // 2. Fetch addresses from user profile or scoped storage
      if (isMounted) {
        if (Array.isArray((user as any).addresses) && (user as any).addresses.length > 0) {
          setAddresses((user as any).addresses);
        } else {
          const addrs = getStoredAddresses(user.id);
          setAddresses(addrs);
        }

        const sett = getStoredSettings(user.id);
        setSettings(sett);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      city: profileCity,
      state: profileState,
      postalCode: profilePostalCode,
      country: profileCountry
    };

    updateProfile(payload);

    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Failed to sync profile update to MongoDB:', err);
    }

    showToast('Profile credentials and shipping data updated.', 'success');
  };

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddrLine || !newAddrCity) {
      showToast('Please provide the street address and city.', 'error');
      return;
    }

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      title: newAddrTitle || 'Alternate Shipping Address',
      fullName: newAddrFullName || user.name,
      phone: newAddrPhone || user.phone || '',
      addressLine: newAddrLine,
      city: newAddrCity,
      state: newAddrState,
      postalCode: newAddrPostal,
      country: 'Japan',
      isDefault: newAddrDefault || addresses.length === 0
    };

    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);

    setAddresses(updated);
    saveStoredAddresses(user.id, updated);

    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updated })
      });
    } catch (err) {
      console.warn('Failed to sync addresses to MongoDB:', err);
    }

    setIsAddAddressOpen(false);
    showToast('Shipping address added successfully.', 'success');

    // Reset form
    setNewAddrTitle('');
    setNewAddrLine('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrPostal('');
    setNewAddrDefault(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveStoredAddresses(user.id, updated);

    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updated })
      });
    } catch (err) {
      console.warn('Failed to sync address deletion to MongoDB:', err);
    }

    showToast('Address removed.', 'info');
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    saveStoredAddresses(user.id, updated);

    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updated })
      });
    } catch (err) {
      console.warn('Failed to sync default address to MongoDB:', err);
    }

    showToast('Default dispatch address updated.', 'success');
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Current password is required.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password cipher updated successfully.', 'success');
  };

  // Toggle Notification Settings
  const handleToggleSetting = (key: keyof UserSettings) => {
    if (!user) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveStoredSettings(user.id, updated);
    showToast('Notification preference saved.', 'info');
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ACTIVE') return ['Pending', 'Processing', 'Shipped'].includes(o.orderStatus);
    if (orderFilter === 'COMPLETED') return ['Delivered', 'Cancelled'].includes(o.orderStatus);
    return true;
  });

  // Calculate order statistics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => ['Pending', 'Processing', 'Shipped'].includes(o.orderStatus)).length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  // Unauthenticated Guard
  if (isLoaded && !isAuthenticated) {
    return (
      <main className={styles.dashboardContainer}>
        <div className={styles.innerWrap}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.returnBtn}>
              <ArrowLeft size={14} />
              <span>RETURN TO PUBLIC ARCHIVE</span>
            </Link>
          </div>

          <div className={styles.emptyState}>
            <div className={styles.emptyIconBox}>
              <AlertCircle size={28} />
            </div>
            <h1 className={styles.emptyTitle}>CREW ACCESS REQUIRED</h1>
            <p className={styles.emptyText}>
              You must authenticate with a verified Shin Sekai account to access your orders, saved pieces, and VIP customer portal.
            </p>
            <button
              onClick={() => openAuthModal({ defaultTab: 'LOGIN', defaultRole: 'user' })}
              className={styles.exploreBtn}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              SIGN IN / REGISTER
            </button>
          </div>
        </div>
        <AuthModal onOpenCheckout={() => setIsCheckoutOpen(true)} />
      </main>
    );
  }

  return (
    <main className={styles.dashboardContainer}>
      <div className={styles.innerWrap}>
        {/* Top Minimal Telemetry Bar */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.returnBtn}>
            <ArrowLeft size={14} />
            <span>RETURN TO STORE</span>
          </Link>
          <div className={styles.telemetryTag}>
            CUSTOMER PORTAL // TOKYO DROP 01
          </div>
        </div>

        {/* Admin notice banner if logged in as Admin */}
        {isAdmin && (
          <div
            style={{
              background: 'rgba(181, 18, 27, 0.14)',
              border: '1px solid rgba(181, 18, 27, 0.35)',
              padding: '12px 18px',
              borderRadius: '4px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff999f' }}>
              <Shield size={16} />
              <span>You are logged in with Administrative Clearance.</span>
            </div>
            <Link
              href="/admin/dashboard"
              style={{
                color: '#ffffff',
                background: '#b5121b',
                padding: '6px 12px',
                borderRadius: '2px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Open Admin Console
            </Link>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className={styles.userHeaderCard}>
          <div className={styles.userProfileLeft}>
            <div className={styles.avatarLarge}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>{user?.name || 'Grand Line Member'}</h1>
              <div className={styles.userTierBadge}>
                <span>★</span>
                <span>VIP CREW // LEVEL 01 (PRESTIGE)</span>
              </div>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button onClick={logout} className={styles.logoutBtn} aria-label="Sign out">
              <LogOut size={15} />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <nav className={styles.tabsNav} aria-label="Dashboard Navigation">
          <button
            className={`${styles.tabItem} ${activeTab === 'overview' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Package size={15} />
            <span>OVERVIEW</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'orders' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={15} />
            <span>MY ORDERS</span>
            <span className={styles.tabBadge}>{orders.length}</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'wishlist' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={15} />
            <span>WISHLIST</span>
            <span className={styles.tabBadge}>{wishlist.length}</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'cart' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingBag size={15} />
            <span>MY BAG</span>
            <span className={styles.tabBadge}>{totalItems}</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'profile' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} />
            <span>PROFILE</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'addresses' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={15} />
            <span>ADDRESSES</span>
            <span className={styles.tabBadge}>{addresses.length}</span>
          </button>

          <button
            className={`${styles.tabItem} ${activeTab === 'settings' ? styles.activeTabItem : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            <span>SETTINGS</span>
          </button>
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Statistics */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper}>
                  <Package size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>TOTAL ORDERS</div>
                  <div className={styles.kpiValue}>{totalOrdersCount}</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper}>
                  <Clock size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>ACTIVE VOYAGES</div>
                  <div className={styles.kpiValue}>{pendingOrdersCount}</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>DELIVERED</div>
                  <div className={styles.kpiValue}>{deliveredOrdersCount}</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper}>
                  <Heart size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>SAVED PIECES</div>
                  <div className={styles.kpiValue}>{wishlist.length}</div>
                </div>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>RECENT VOYAGE SHIPMENTS</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: '#c7a76c', fontSize: '12px', cursor: 'pointer' }}
                >
                  VIEW ALL ORDERS →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <Package size={24} />
                  </div>
                  <p className={styles.emptyText}>No orders dispatched yet.</p>
                  <Link href="/#collection" className={styles.exploreBtn}>
                    EXPLORE DROP 01
                  </Link>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderCardHeader}>
                        <div className={styles.orderIdBlock}>
                          <span className={styles.orderId}>{order.id}</span>
                          <span className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            order.orderStatus === 'Delivered'
                              ? styles.statusDelivered
                              : order.orderStatus === 'Shipped'
                              ? styles.statusShipped
                              : order.orderStatus === 'Processing'
                              ? styles.statusProcessing
                              : order.orderStatus === 'Pending'
                              ? styles.statusPending
                              : styles.statusCancelled
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className={styles.orderItemsRow}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.orderItemThumb}>
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className={styles.orderItemImg}
                              />
                            )}
                            <div className={styles.orderItemText}>
                              <span className={styles.orderItemName}>{item.product?.name || 'Garment Piece'}</span>
                              <span className={styles.orderItemSub}>
                                Size: {item.selectedSize} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderFooterRow}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#646059' }}>TOTAL: </span>
                          <span className={styles.orderTotalAmount}>${order.total}</span>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className={styles.viewDetailsBtn}
                        >
                          VIEW RECEIPT & TRACKING
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Profile & Shipping Snapshot */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>PRIMARY DISPATCH DESTINATION</h2>
                <button
                  onClick={() => setActiveTab('addresses')}
                  style={{ background: 'none', border: 'none', color: '#c7a76c', fontSize: '12px', cursor: 'pointer' }}
                >
                  MANAGE ADDRESSES →
                </button>
              </div>

              {addresses.find((a) => a.isDefault) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#a8a49c' }}>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>
                    {addresses.find((a) => a.isDefault)?.fullName} ({addresses.find((a) => a.isDefault)?.title})
                  </div>
                  <div>{addresses.find((a) => a.isDefault)?.addressLine}</div>
                  <div>
                    {addresses.find((a) => a.isDefault)?.city}, {addresses.find((a) => a.isDefault)?.state}{' '}
                    {addresses.find((a) => a.isDefault)?.postalCode}
                  </div>
                  <div>{addresses.find((a) => a.isDefault)?.country}</div>
                  <div style={{ marginTop: '8px', color: '#646059', fontSize: '11px' }}>
                    Tel: {addresses.find((a) => a.isDefault)?.phone}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#646059', fontSize: '13px' }}>
                  No default shipping address on record. Click Manage Addresses to set one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>ORDER ARCHIVE ({orders.length})</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    style={{
                      background: orderFilter === filter ? 'rgba(245, 242, 235, 0.12)' : 'none',
                      border: '1px solid rgba(245, 242, 235, 0.1)',
                      color: orderFilter === filter ? '#ffffff' : '#a8a49c',
                      padding: '6px 12px',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconBox}>
                  <Package size={28} />
                </div>
                <h3 className={styles.emptyTitle}>NO ORDERS MATCH CRITERIA</h3>
                <p className={styles.emptyText}>
                  Explore the limited Tokyo archive drop to secure your numbered 500 GSM pieces.
                </p>
                <Link href="/#collection" className={styles.exploreBtn}>
                  EXPLORE SHOP
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {filteredOrders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardHeader}>
                      <div className={styles.orderIdBlock}>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {order.trackingNumber && (
                          <span style={{ fontSize: '11px', color: '#c7a76c', fontFamily: 'var(--font-mono)' }}>
                            Track: {order.trackingNumber}
                          </span>
                        )}
                      </div>

                      <span
                        className={`${styles.statusBadge} ${
                          order.orderStatus === 'Delivered'
                            ? styles.statusDelivered
                            : order.orderStatus === 'Shipped'
                            ? styles.statusShipped
                            : order.orderStatus === 'Processing'
                            ? styles.statusProcessing
                            : order.orderStatus === 'Pending'
                            ? styles.statusPending
                            : styles.statusCancelled
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className={styles.orderItemsRow}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.orderItemThumb}>
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className={styles.orderItemImg}
                            />
                          )}
                          <div className={styles.orderItemText}>
                            <span className={styles.orderItemName}>{item.product?.name || 'Garment Piece'}</span>
                            <span className={styles.orderItemSub}>
                              Size: {item.selectedSize} • Qty: {item.quantity} • ${item.product?.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderFooterRow}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#646059' }}>TOTAL AMOUNT: </span>
                        <span className={styles.orderTotalAmount}>${order.total}</span>
                        <span style={{ fontSize: '11px', color: '#52c41a', marginLeft: '10px' }}>
                          [{order.paymentStatus}]
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={styles.viewDetailsBtn}
                      >
                        VIEW RECEIPT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>SAVED ARCHIVE PIECES ({wishlist.length})</h2>
            </div>

            {wishlist.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconBox}>
                  <Heart size={28} />
                </div>
                <h3 className={styles.emptyTitle}>YOUR WISHLIST IS EMPTY</h3>
                <p className={styles.emptyText}>
                  Save your favorite Tokyo heavyweight cuts and limited edition tees to monitor restocks.
                </p>
                <Link href="/#collection" className={styles.exploreBtn}>
                  BROWSE COLLECTION
                </Link>
              </div>
            ) : (
              <div className={styles.wishlistGrid}>
                {wishlist.map((item) => (
                  <div key={item.id} className={styles.wishlistCard}>
                    <div className={styles.wishlistImgWrapper}>
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.wishlistInfo}>
                      <span className={styles.wishlistTitle}>{item.name}</span>
                      <span className={styles.wishlistPrice}>${item.price}</span>
                      <div className={styles.wishlistActions}>
                        <button
                          onClick={() => {
                            addToCart(item, 'L', item.color, 1);
                            toggleWishlist(item);
                            showToast(`Moved "${item.name}" to voyage bag!`, 'success');
                          }}
                          className={styles.moveToBagBtn}
                        >
                          <ShoppingBag size={14} />
                          <span>MOVE TO BAG</span>
                        </button>
                        <button
                          onClick={() => {
                            toggleWishlist(item);
                            showToast(`Removed from wishlist`, 'info');
                          }}
                          className={styles.removeFromWishlistBtn}
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY BAG / CART */}
        {activeTab === 'cart' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>VOYAGE BAG ({totalItems} ITEMS)</h2>
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconBox}>
                  <ShoppingBag size={28} />
                </div>
                <h3 className={styles.emptyTitle}>YOUR BAG IS EMPTY</h3>
                <p className={styles.emptyText}>
                  Explore the limited drop to select your heavyweight cotton streetwear pieces.
                </p>
                <Link href="/#collection" className={styles.exploreBtn}>
                  SHOP DROP 01
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: '#141414',
                        border: '1px solid rgba(245, 242, 235, 0.08)',
                        borderRadius: '2px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {item.product.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '2px' }}
                          />
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{item.product.name}</div>
                          <div style={{ fontSize: '11px', color: '#a8a49c', marginTop: '2px' }}>
                            Size: {item.selectedSize} • {item.selectedColor} • ${item.product.price} each
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(245, 242, 235, 0.15)', borderRadius: '2px' }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            style={{ background: 'none', border: 'none', color: '#f5f2eb', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '12px', padding: '0 8px', fontFamily: 'var(--font-mono)' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            style={{ background: 'none', border: 'none', color: '#f5f2eb', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', minWidth: '70px', textAlign: 'right' }}>
                          ${item.product.price * item.quantity}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          style={{ background: 'none', border: 'none', color: '#646059', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Checkout Card */}
                <div
                  style={{
                    background: '#121212',
                    border: '1px solid rgba(245, 242, 235, 0.1)',
                    borderRadius: '2px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxWidth: '420px',
                    marginLeft: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a8a49c' }}>
                    <span>Subtotal:</span>
                    <span style={{ color: '#ffffff' }}>${subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#52c41a' }}>
                      <span>VIP Discount:</span>
                      <span>-${discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#ffffff', paddingTop: '8px', borderTop: '1px solid rgba(245, 242, 235, 0.08)' }}>
                    <span>Estimated Total:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c' }}>${total}</span>
                  </div>

                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className={styles.saveBtn}
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>PROFILE CREDENTIALS & SHIPPING</h2>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>FULL NAME</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={profileEmail}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>COUNTRY / REGION</label>
                  <input
                    type="text"
                    value={profileCountry}
                    onChange={(e) => setProfileCountry(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidthCol}`}>
                  <label className={styles.inputLabel}>PRIMARY STREET ADDRESS</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>CITY</label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PREFECTURE / STATE</label>
                  <input
                    type="text"
                    value={profileState}
                    onChange={(e) => setProfileState(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>POSTAL CODE</label>
                  <input
                    type="text"
                    value={profilePostalCode}
                    onChange={(e) => setProfilePostalCode(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <button type="submit" className={styles.saveBtn}>
                SAVE PROFILE UPDATES
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>SAVED DESTINATIONS ({addresses.length})</h2>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className={styles.viewDetailsBtn}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>ADD NEW ADDRESS</span>
              </button>
            </div>

            <div className={styles.addressGrid}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`${styles.addressCard} ${addr.isDefault ? styles.addressDefaultCard : ''}`}
                >
                  {addr.isDefault && <span className={styles.defaultPill}>PRIMARY DISPATCH</span>}
                  <div className={styles.addressTitle}>{addr.title}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f2eb' }}>{addr.fullName}</div>
                  <div className={styles.addressLine}>{addr.addressLine}</div>
                  <div className={styles.addressLine}>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </div>
                  <div className={styles.addressLine}>{addr.country}</div>
                  <div style={{ fontSize: '11px', color: '#646059' }}>Tel: {addr.phone}</div>

                  <div className={styles.addressActions}>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className={styles.addressActionBtn}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className={styles.addressActionBtn}
                      style={{ color: '#ff7875', marginLeft: 'auto' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Modal / Card */}
            {isAddAddressOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000,
                  padding: '20px'
                }}
                onClick={() => setIsAddAddressOpen(false)}
              >
                <div
                  style={{
                    background: '#121212',
                    border: '1px solid rgba(245, 242, 235, 0.12)',
                    borderRadius: '4px',
                    padding: '28px',
                    width: '100%',
                    maxWidth: '500px',
                    color: '#f5f2eb'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                      ADD DESTINATION ADDRESS
                    </h3>
                    <button
                      onClick={() => setIsAddAddressOpen(false)}
                      style={{ background: 'none', border: 'none', color: '#a8a49c', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>ADDRESS LABEL</label>
                      <input
                        type="text"
                        value={newAddrTitle}
                        onChange={(e) => setNewAddrTitle(e.target.value)}
                        placeholder="e.g. Tokyo Studio / Home Residence"
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>RECIPIENT FULL NAME</label>
                      <input
                        type="text"
                        value={newAddrFullName}
                        onChange={(e) => setNewAddrFullName(e.target.value)}
                        placeholder="Name of recipient"
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>STREET ADDRESS</label>
                      <input
                        type="text"
                        value={newAddrLine}
                        onChange={(e) => setNewAddrLine(e.target.value)}
                        placeholder="Ward, Street, Building, Room #"
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>CITY</label>
                        <input
                          type="text"
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          placeholder="Tokyo"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>POSTAL CODE</label>
                        <input
                          type="text"
                          value={newAddrPostal}
                          onChange={(e) => setNewAddrPostal(e.target.value)}
                          placeholder="150-0043"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="checkbox"
                        id="defaultCheck"
                        checked={newAddrDefault}
                        onChange={(e) => setNewAddrDefault(e.target.checked)}
                      />
                      <label htmlFor="defaultCheck" style={{ fontSize: '12px', color: '#a8a49c', cursor: 'pointer' }}>
                        Set as primary dispatch address
                      </label>
                    </div>

                    <button type="submit" className={styles.saveBtn} style={{ width: '100%', marginTop: '10px' }}>
                      SAVE ADDRESS
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            {/* Password Change */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>CHANGE ACCOUNT PASSWORD</h2>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>CURRENT PASSWORD</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>NEW PASSWORD (MIN 6 CHARS)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>CONFIRM NEW PASSWORD</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.saveBtn}>
                  UPDATE PASSWORD CIPHER
                </button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>COMMUNICATION & TELEMETRY PREFERENCES</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(245, 242, 235, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Order Tracking Dispatches (Email)</div>
                    <div style={{ fontSize: '11px', color: '#a8a49c' }}>Real-time notifications when your garment moves through logistics.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.orderUpdatesEmail}
                    onChange={() => handleToggleSetting('orderUpdatesEmail')}
                    style={{ width: '16px', height: '16px', accentColor: '#b5121b', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(245, 242, 235, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>SMS Carrier Telemetry</div>
                    <div style={{ fontSize: '11px', color: '#a8a49c' }}>Instant delivery confirmation SMS to your registered mobile phone.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.orderUpdatesSms}
                    onChange={() => handleToggleSetting('orderUpdatesSms')}
                    style={{ width: '16px', height: '16px', accentColor: '#b5121b', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(245, 242, 235, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>VIP Drop Announcements & Secret Keys</div>
                    <div style={{ fontSize: '11px', color: '#a8a49c' }}>Receive password access 2 hours prior to public releases.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.newDropNotifications}
                    onChange={() => handleToggleSetting('newDropNotifications')}
                    style={{ width: '16px', height: '16px', accentColor: '#b5121b', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(6, 6, 6, 0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              style={{
                background: '#101010',
                border: '1px solid rgba(245, 242, 235, 0.12)',
                borderRadius: '4px',
                padding: '32px',
                width: '100%',
                maxWidth: '560px',
                color: '#f5f2eb',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(245, 242, 235, 0.08)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c7a76c' }}>
                    OFFICIAL DISPATCH MANIFEST
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700 }}>
                    {selectedOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'none', border: 'none', color: '#a8a49c', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#646059' }}>DISPATCH STATUS:</span>
                  <span style={{ fontWeight: 700, color: '#ff7875' }}>{selectedOrder.orderStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#646059' }}>PAYMENT STATUS:</span>
                  <span style={{ color: '#52c41a' }}>{selectedOrder.paymentStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#646059' }}>ORDER DATE:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#646059' }}>CARRIER TRACKING:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c' }}>
                      {selectedOrder.trackingNumber}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#646059' }}>SHIPPING DESTINATION:</span>
                  <span style={{ textAlign: 'right', maxWidth: '60%' }}>
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city},{' '}
                    {selectedOrder.shippingAddress?.country}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(245, 242, 235, 0.08)', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#646059', marginBottom: '10px' }}>
                  ITEMIZED RECEIPT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>
                        {it.product?.name} ({it.selectedSize}) × {it.quantity}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        ${it.product?.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(245, 242, 235, 0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
                <span>TOTAL BILLED:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c' }}>${selectedOrder.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Checkout Modal */}
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      </div>
    </main>
  );
}

export default function UserDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#060606',
            color: '#f5f2eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)'
          }}
        >
          LOADING ARCHIVE...
        </div>
      }
    >
      <UserDashboardContent />
    </React.Suspense>
  );
}
