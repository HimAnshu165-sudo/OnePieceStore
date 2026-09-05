'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  X,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getStoredProducts,
  saveStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  getStoredOrders,
  saveStoredOrders,
  updateStoredOrderStatus,
  getStoredUsers,
  saveStoredUsers
} from '@/lib/mockData';
import { Product } from '@/types';
import { StoreOrder, AuthUser, AccountStatus } from '@/types/auth';
import { AuthModal } from '@/components/AuthModal/AuthModal';
import styles from './admin.module.css';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'analytics' | 'settings';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, isLoaded, logout, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [usersList, setUsersList] = useState<AuthUser[]>([]);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Product Modals (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodJpName, setProdJpName] = useState('');
  const [prodCrew, setProdCrew] = useState('STRAW_HAT');
  const [prodPrice, setProdPrice] = useState('88');
  const [prodComparePrice, setProdComparePrice] = useState('110');
  const [prodStock, setProdStock] = useState('25');
  const [prodGsm, setProdGsm] = useState('500');
  const [prodCut, setProdCut] = useState('Oversized Boxy Silhouette');
  const [prodFabric, setProdFabric] = useState('100% Japanese Combed Loopback Cotton');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('/images/luffy-sun-god.jpg');

  // Order Detail modal
  const [viewingOrder, setViewingOrder] = useState<StoreOrder | null>(null);

  // Settings State
  const [storeName, setStoreName] = useState('SHIN SEKAI // GRAND LINE SUPPLY CO.');
  const [storeEmail, setStoreEmail] = useState('hq@grandlinesupply.jp');
  const [freeShipThreshold, setFreeShipThreshold] = useState('150');
  const [dispatchNotice, setDispatchNotice] = useState('WORLDWIDE AIR EXPRESS DISPATCH FROM TOKYO');

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      // 1. Fetch real products from backend
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products) && isMounted) {
            setProducts(data.products);
            saveStoredProducts(data.products);
          }
        } else {
          // Fallback to public products endpoint
          const publicRes = await fetch('/api/products');
          if (publicRes.ok) {
            const publicData = await publicRes.json();
            if (publicData.success && Array.isArray(publicData.products) && isMounted) {
              setProducts(publicData.products);
              saveStoredProducts(publicData.products);
            }
          } else if (isMounted) {
            setProducts(getStoredProducts());
          }
        }
      } catch (err) {
        console.warn('Failed to load products from API, using fallback:', err);
        if (isMounted) setProducts(getStoredProducts());
      }

      // 2. Fetch real users from backend if admin
      try {
        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success && Array.isArray(usersData.users) && isMounted) {
            const mappedUsers: AuthUser[] = usersData.users.map((u: { id?: string; _id?: string; name: string; email: string; role: 'user' | 'admin'; status?: AccountStatus; avatar?: string; createdAt?: string }) => ({
              id: u.id || u._id || '',
              name: u.name,
              email: u.email,
              role: u.role,
              status: u.status || 'active',
              avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              createdAt: u.createdAt || new Date().toISOString(),
              ordersCount: 0
            }));
            setUsersList(mappedUsers);
          }
        } else if (isMounted) {
          const loadedUsers = getStoredUsers().map(({ passwordHash: _, ...u }) => u);
          setUsersList(loadedUsers);
        }
      } catch (err) {
        if (isMounted) {
          const loadedUsers = getStoredUsers().map(({ passwordHash: _, ...u }) => u);
          setUsersList(loadedUsers);
        }
      }

      // 3. Fetch real orders from backend
      try {
        const ordersRes = await fetch('/api/admin/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.orders) && isMounted) {
            setOrders(ordersData.orders);
            saveStoredOrders(ordersData.orders);
          }
        } else if (isMounted) {
          setOrders(getStoredOrders());
        }
      } catch (err) {
        if (isMounted) setOrders(getStoredOrders());
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open Add Product modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdJpName('');
    setProdCrew('STRAW_HAT');
    setProdPrice('88');
    setProdComparePrice('110');
    setProdStock('25');
    setProdGsm('500');
    setProdCut('Oversized Boxy Silhouette');
    setProdFabric('100% Japanese Combed Loopback Cotton');
    setProdDesc('500 GSM loopback cotton heavyweight tee crafted in Tokyo.');
    setProdImage('/images/luffy-sun-god.jpg');
    setIsProductModalOpen(true);
  };

  // Open Edit Product modal
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdJpName(p.japaneseName);
    setProdCrew(p.crew);
    setProdPrice(p.price.toString());
    setProdComparePrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setProdStock(p.stock.toString());
    setProdGsm(p.gsm.toString());
    setProdCut(p.cut);
    setProdFabric(p.fabric);
    setProdDesc(p.description);
    setProdImage(p.images[0] || '/images/luffy-sun-god.jpg');
    setIsProductModalOpen(true);
  };

  // Save Product (Create / Update) with Real MongoDB Sync
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      showToast('Product name and price are required.', 'error');
      return;
    }

    if (editingProduct) {
      // Update existing product
      const updatedProd: Product = {
        ...editingProduct,
        name: prodName,
        japaneseName: prodJpName,
        crew: prodCrew,
        price: parseFloat(prodPrice) || 88,
        compareAtPrice: prodComparePrice ? parseFloat(prodComparePrice) : undefined,
        stock: parseInt(prodStock) || 10,
        gsm: parseInt(prodGsm) || 500,
        cut: prodCut,
        fabric: prodFabric,
        description: prodDesc,
        images: [prodImage, ...editingProduct.images.slice(1)]
      };

      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(editingProduct.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProd)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.product) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
          updateStoredProduct(data.product);
          showToast(`Product "${prodName}" updated in database.`, 'success');
          setIsProductModalOpen(false);
        } else {
          const errorMsg = data.error || data.message || `Failed to update product in database (HTTP ${res.status})`;
          showToast(errorMsg, 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error: Failed to update product in database.', 'error');
      }
    } else {
      // Create new product
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `prod-${Date.now()}`,
        name: prodName,
        japaneseName: prodJpName || '新作 // 500GSM ボクシー',
        crew: prodCrew,
        character: 'Shin Sekai Crew',
        price: parseFloat(prodPrice) || 88,
        compareAtPrice: prodComparePrice ? parseFloat(prodComparePrice) : undefined,
        description: prodDesc || 'Heavyweight Japanese streetwear garment.',
        story: 'Limited edition Tokyo cut.',
        details: [
          `${prodGsm} GSM Japanese Heavyweight Cotton`,
          'Pre-shrunk vintage boxy fit',
          'Reinforced double-needle collar',
          'Limited numbered edition'
        ],
        gsm: parseInt(prodGsm) || 500,
        cut: prodCut,
        fabric: prodFabric,
        color: 'Obsidian Black',
        colorHex: '#141414',
        colors: [{ name: 'Obsidian Black', hex: '#141414', image: prodImage }],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: parseInt(prodStock) || 20,
        images: [prodImage, '/images/collection-red-hair.jpg'],
        tags: ['Heavyweight', 'Limited Edition', 'Drop 01'],
        isNewDrop: true
      };

      try {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.product) {
          setProducts((prev) => [data.product, ...prev]);
          addStoredProduct(data.product);
          showToast(`New garment "${prodName}" registered in MongoDB.`, 'success');
          setIsProductModalOpen(false);
        } else {
          const errorMsg = data.error || data.message || `Failed to create garment in database (HTTP ${res.status})`;
          showToast(errorMsg, 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error: Failed to register garment in database.', 'error');
      }
    }
  };

  // Delete Product with Real MongoDB Sync
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!id) {
      showToast('Product ID is missing.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to permanently decommission "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        // ONLY update UI state and local storage AFTER backend successfully deleted from MongoDB
        setProducts((prev) => prev.filter((p) => p.id !== id && (p as any)._id !== id && p.slug !== id));
        deleteStoredProduct(id);
        showToast(`Product "${name}" permanently deleted from database.`, 'success');
      } else {
        // Database deletion failed: do NOT remove from UI state
        const errorMsg = data.error || data.message || `Failed to delete "${name}" from database. (HTTP ${res.status})`;
        showToast(errorMsg, 'error');
        console.error('Failed to delete product from database:', { status: res.status, data });
      }
    } catch (err: any) {
      // Network/server error: do NOT remove from UI state
      const errorMsg = err?.message || 'Network error: Failed to communicate with server to delete product.';
      showToast(errorMsg, 'error');
      console.error('Network error during product deletion:', err);
    }
  };

  // Adjust Stock Quickly with Real Backend Sync
  const handleStockChange = async (p: Product, delta: number) => {
    const nextStock = Math.max(0, p.stock + delta);
    const prevStock = p.stock;
    const updatedProd = { ...p, stock: nextStock };
    setProducts((prev) => prev.map((item) => (item.id === p.id ? updatedProd : item)));

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nextStock })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        updateStoredProduct(updatedProd);
      } else {
        // Revert on failure
        const revertedProd = { ...p, stock: prevStock };
        setProducts((prev) => prev.map((item) => (item.id === p.id ? revertedProd : item)));
        showToast(data.error || 'Failed to update stock in database.', 'error');
      }
    } catch (err: any) {
      const revertedProd = { ...p, stock: prevStock };
      setProducts((prev) => prev.map((item) => (item.id === p.id ? revertedProd : item)));
      showToast(err?.message || 'Network error updating stock.', 'error');
    }
  };

  // Change Order Status with Real Backend Sync
  const handleOrderStatusChange = async (orderId: string, status: StoreOrder['orderStatus']) => {
    const updated = updateStoredOrderStatus(orderId, status);
    setOrders(updated);

    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
    } catch (err) {
      console.warn('Failed to sync order status update to MongoDB:', err);
    }

    showToast(`Order ${orderId} updated to status "${status}".`, 'success');
  };

  // Toggle User Status
  const handleToggleUserStatus = (targetUser: AuthUser) => {
    const stored = getStoredUsers();
    const nextStatus: AccountStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const updated = stored.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u));
    saveStoredUsers(updated);
    setUsersList(updated.map(({ passwordHash: _, ...u }) => u));
    showToast(
      `User ${targetUser.name} is now ${nextStatus === 'active' ? 'ACTIVE' : 'SUSPENDED'}.`,
      nextStatus === 'active' ? 'success' : 'error'
    );
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Store settings and dispatch parameters updated.', 'success');
  };

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => ['Pending', 'Processing', 'Shipped'].includes(o.orderStatus)).length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.japaneseName.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter === 'ALL' || p.crew === productCategoryFilter;
    return matchSearch && matchCat;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  // Route Protection: Guest
  if (isLoaded && !isAuthenticated) {
    return (
      <main className={styles.adminContainer} style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            background: '#101010',
            border: '1px solid rgba(181, 18, 27, 0.4)',
            borderRadius: '6px',
            padding: '40px',
            maxWidth: '460px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(181, 18, 27, 0.2)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(181, 18, 27, 0.15)',
              color: '#ff8087',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <Shield size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            COMMAND CLEARANCE REQUIRED
          </h1>
          <p style={{ color: '#a8a49c', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
            The Shin Sekai Administration Console requires authenticated Command Level 05 clearance.
          </p>
          <button
            onClick={() => openAuthModal({ defaultRole: 'admin', defaultTab: 'LOGIN' })}
            className={styles.primaryActionBtn}
            style={{ width: '100%', justifyContent: 'center', height: '44px' }}
          >
            AUTHORIZE ADMIN ACCESS
          </button>
          <Link
            href="/"
            style={{ display: 'inline-block', marginTop: '16px', color: '#646059', fontSize: '12px', textDecoration: 'none' }}
          >
            ← Return to Public Storefront
          </Link>
        </div>
        <AuthModal />
      </main>
    );
  }

  // Route Protection: Non-Admin Authenticated User
  if (isLoaded && isAuthenticated && !isAdmin) {
    return (
      <main className={styles.adminContainer} style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            background: '#101010',
            border: '1px solid rgba(255, 77, 79, 0.4)',
            borderRadius: '6px',
            padding: '40px',
            maxWidth: '460px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 77, 79, 0.12)',
              color: '#ff4d4f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            CLEARANCE LEVEL DENIED
          </h1>
          <p style={{ color: '#a8a49c', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
            Account <strong>{user?.email}</strong> possesses Customer Crew clearance only. Administrative management tools are restricted to store directors.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/dashboard"
              className={styles.primaryActionBtn}
              style={{ justifyContent: 'center', textDecoration: 'none', height: '42px' }}
            >
              GO TO MY CUSTOMER DASHBOARD
            </Link>
            <button
              onClick={() => {
                logout();
                openAuthModal({ defaultRole: 'admin', defaultTab: 'LOGIN' });
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(245, 242, 235, 0.1)',
                color: '#f5f2eb',
                padding: '10px',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Log in with Admin Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.sidebarBrand}>SHIN SEKAI</span>
            <span className={styles.sidebarSub}>ADMIN CONSOLE // v1.0</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav} aria-label="Admin Navigation">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.navButton} ${activeTab === 'overview' ? styles.activeNavButton : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`${styles.navButton} ${activeTab === 'products' ? styles.activeNavButton : ''}`}
          >
            <Package size={16} />
            <span>Products</span>
            <span className={styles.navBadge}>{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.navButton} ${activeTab === 'orders' ? styles.activeNavButton : ''}`}
          >
            <ShoppingBag size={16} />
            <span>Orders</span>
            <span className={styles.navBadge}>{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.navButton} ${activeTab === 'users' ? styles.activeNavButton : ''}`}
          >
            <Users size={16} />
            <span>Users</span>
            <span className={styles.navBadge}>{usersList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`${styles.navButton} ${activeTab === 'analytics' ? styles.activeNavButton : ''}`}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`${styles.navButton} ${activeTab === 'settings' ? styles.activeNavButton : ''}`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUserBadge}>
            <div className={styles.adminAvatarSmall}>C</div>
            <div className={styles.adminInfoText}>
              <span className={styles.adminName}>{user?.name || 'Commander'}</span>
              <span className={styles.adminRoleTag}>CHIEF LOGISTICS</span>
            </div>
          </div>

          <button onClick={logout} className={styles.sidebarLogoutBtn}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <h1 className={styles.pageHeadingTitle}>
            {activeTab === 'overview' && 'SYSTEM OVERVIEW & METRICS'}
            {activeTab === 'products' && 'PRODUCT CATALOGUE & INVENTORY'}
            {activeTab === 'orders' && 'ORDER FULFILLMENT & DISPATCH'}
            {activeTab === 'users' && 'CUSTOMER ACCOUNTS & ACCESS'}
            {activeTab === 'analytics' && 'REVENUE & SALES ANALYTICS'}
            {activeTab === 'settings' && 'STORE CONFIGURATION'}
          </h1>

          <div className={styles.topBarActions}>
            <Link href="/" target="_blank" className={styles.viewStoreLink}>
              <span>View Live Store</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        <div className={styles.contentPadding}>
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* KPI Cards */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox}>
                    <DollarSign size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>TOTAL REVENUE</span>
                    <span className={styles.kpiValue}>${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox}>
                    <ShoppingBag size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>TOTAL ORDERS</span>
                    <span className={styles.kpiValue}>{orders.length}</span>
                  </div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox}>
                    <Package size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>ACTIVE PRODUCTS</span>
                    <span className={styles.kpiValue}>{products.length}</span>
                  </div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox}>
                    <Users size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>REGISTERED CREW</span>
                    <span className={styles.kpiValue}>{usersList.length}</span>
                  </div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox} style={{ background: 'rgba(250, 173, 20, 0.12)', color: '#faad14' }}>
                    <Clock size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>PENDING DISPATCH</span>
                    <span className={styles.kpiValue}>{pendingOrdersCount}</span>
                  </div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiIconBox} style={{ background: 'rgba(255, 77, 79, 0.12)', color: '#ff4d4f' }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>LOW STOCK CUTS</span>
                    <span className={styles.kpiValue}>{lowStockCount}</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>LATEST ORDER DISPATCHES</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={styles.viewStoreLink}
                    style={{ cursor: 'pointer', background: 'none' }}
                  >
                    Manage All Orders →
                  </button>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{order.id}</td>
                          <td>
                            <div>{order.customerName}</div>
                            <div style={{ fontSize: '10.5px', color: '#646059' }}>{order.userEmail}</div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${order.total}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <span style={{ color: '#52c41a', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleOrderStatusChange(order.id, e.target.value as StoreOrder['orderStatus'])
                              }
                              className={styles.statusSelect}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => setViewingOrder(order)}
                              className={styles.iconActionBtn}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS MANAGEMENT TAB */}
          {activeTab === 'products' && (
            <div className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div className={styles.controlsRow}>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search garments..."
                    className={styles.searchInput}
                  />

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="ALL">All Crews / Drops</option>
                    <option value="STRAW_HAT">Straw Hat</option>
                    <option value="HEART">Heart Pirates</option>
                    <option value="RED_HAIR">Red Hair</option>
                    <option value="MARINE">Marine / Justice</option>
                    <option value="WANO">Wano Kuni</option>
                  </select>
                </div>

                <button onClick={handleOpenAddProduct} className={styles.primaryActionBtn}>
                  <Plus size={15} />
                  <span>ADD NEW PRODUCT</span>
                </button>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Title</th>
                      <th>Crew / Drop</th>
                      <th>Price</th>
                      <th>GSM / Cut</th>
                      <th>Stock Controls</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          {prod.images?.[0] && (
                            <img src={prod.images[0]} alt={prod.name} className={styles.productThumb} />
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f5f2eb' }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: '#c7a76c', fontFamily: 'var(--font-mono)' }}>
                            {prod.japaneseName}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#a8a49c' }}>
                            {prod.crew}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          ${prod.price}
                          {prod.compareAtPrice && (
                            <span style={{ color: '#646059', textDecoration: 'line-through', marginLeft: '6px', fontSize: '11px' }}>
                              ${prod.compareAtPrice}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '11px' }}>{prod.gsm} GSM</div>
                          <div style={{ fontSize: '10px', color: '#646059' }}>{prod.cut}</div>
                        </td>
                        <td>
                          <div className={styles.stockControlBox}>
                            <button
                              onClick={() => handleStockChange(prod, -1)}
                              className={styles.stockBtn}
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                minWidth: '24px',
                                textAlign: 'center',
                                color: prod.stock <= 5 ? '#ff7875' : '#ffffff'
                              }}
                            >
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => handleStockChange(prod, 1)}
                              className={styles.stockBtn}
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className={styles.iconActionBtn}
                              title="Edit Garment"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                              title="Delete Garment"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ORDERS MANAGEMENT TAB */}
          {activeTab === 'orders' && (
            <div className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div className={styles.controlsRow}>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID or name..."
                    className={styles.searchInput}
                  />

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items Summary</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status Changer</th>
                      <th>Manifest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{order.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                          <div style={{ fontSize: '11px', color: '#646059' }}>{order.userEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '11.5px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.items.map((it) => `${it.product?.name || 'Item'} (${it.selectedSize})`).join(', ')}
                          </div>
                          <div style={{ fontSize: '10px', color: '#a8a49c' }}>
                            {order.items.reduce((s, it) => s + it.quantity, 0)} total units
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${order.total}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value as StoreOrder['orderStatus'])
                            }
                            className={styles.statusSelect}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => setViewingOrder(order)}
                            className={styles.iconActionBtn}
                            title="Inspect Receipt"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. USERS MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div className={styles.controlsRow}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search crew members by name or email..."
                    className={styles.searchInput}
                    style={{ width: '280px' }}
                  />
                </div>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Crew Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Member Since</th>
                      <th>Orders</th>
                      <th>Toggle Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: '#a8a49c' }}>{u.email}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: u.role === 'admin' ? '#ff8087' : '#c7a76c'
                            }}
                          >
                            {u.role === 'admin' ? 'COMMANDER' : 'CREW'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '2px',
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              background: u.status === 'active' ? 'rgba(82, 196, 26, 0.12)' : 'rgba(255, 77, 79, 0.12)',
                              color: u.status === 'active' ? '#52c41a' : '#ff4d4f'
                            }}
                          >
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{u.ordersCount ?? 0}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              style={{
                                background: u.status === 'active' ? 'rgba(255, 77, 79, 0.08)' : 'rgba(82, 196, 26, 0.08)',
                                border: '1px solid rgba(245, 242, 235, 0.1)',
                                color: u.status === 'active' ? '#ff7875' : '#52c41a',
                                padding: '4px 10px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div>
              <div className={styles.chartsGrid}>
                {/* Monthly Revenue Trend */}
                <div className={styles.chartCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>MONTHLY REVENUE TRAJECTORY</h3>
                    <span style={{ fontSize: '11px', color: '#c7a76c', fontFamily: 'var(--font-mono)' }}>
                      FY2024 (USD)
                    </span>
                  </div>

                  <div className={styles.barChartContainer}>
                    {[
                      { month: 'APR', height: 45, val: '$18K' },
                      { month: 'MAY', height: 60, val: '$24K' },
                      { month: 'JUN', height: 75, val: '$31K' },
                      { month: 'JUL', height: 90, val: '$38K' },
                      { month: 'AUG', height: 80, val: '$34K' },
                      { month: 'SEP', height: 100, val: '$42K' }
                    ].map((bar) => (
                      <div key={bar.month} className={styles.barColumn}>
                        <span style={{ fontSize: '9px', color: '#c7a76c', fontFamily: 'var(--font-mono)' }}>
                          {bar.val}
                        </span>
                        <div className={styles.barPillar} style={{ height: `${bar.height}%` }} />
                        <span className={styles.barLabel}>{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales By Drop / Category */}
                <div className={styles.chartCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>SALES BY CREW / THEME</h3>
                    <span style={{ fontSize: '11px', color: '#a8a49c', fontFamily: 'var(--font-mono)' }}>
                      DISTRIBUTION
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
                    {[
                      { label: 'Straw Hat Mythology (Sun God / Zoro)', pct: 45, color: '#b5121b' },
                      { label: 'Heart Pirates Tactical (Trafalgar Law)', pct: 28, color: '#c7a76c' },
                      { label: 'Wano Country Blades (Oni / Ronin)', pct: 15, color: '#40a9ff' },
                      { label: 'Red Hair Emperors (Shanks Archive)', pct: 12, color: '#52c41a' }
                    ].map((cat) => (
                      <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#f5f2eb' }}>{cat.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: cat.color }}>
                            {cat.pct}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#1c1c1c', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best Selling Products */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>BEST-PERFORMING GARMENTS</h3>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Piece Name</th>
                        <th>Price</th>
                        <th>Units Dispatched</th>
                        <th>Gross Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: '#01', name: 'Sun God Nika // Heavyweight Vintage Boxy Tee', price: '$95', units: 142, gross: '$13,490' },
                        { rank: '#02', name: 'Santoryu Oni Killer // Wano Swordsman Tee', price: '$88', units: 98, gross: '$8,624' },
                        { rank: '#03', name: 'Heart Pirates Tactical Fleece Hoodie', price: '$145', units: 76, gross: '$11,020' },
                        { rank: '#04', name: 'Red Hair Yonko Heavyweight Acid Washed Crewneck', price: '$110', units: 65, gross: '$7,150' }
                      ].map((item) => (
                        <tr key={item.rank}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c', fontWeight: 700 }}>{item.rank}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{item.price}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{item.units}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#52c41a', fontWeight: 700 }}>{item.gross}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className={styles.dataCard} style={{ maxWidth: '700px' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>COMMERCE CONFIGURATION</h3>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>STORE IDENTITY NAME</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PRIMARY CONTACT EMAIL</label>
                  <input
                    type="email"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>FREE SHIPPING DISPATCH THRESHOLD ($ USD)</label>
                  <input
                    type="number"
                    value={freeShipThreshold}
                    onChange={(e) => setFreeShipThreshold(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>DISPATCH / BANNER TELEMETRY BROADCAST</label>
                  <input
                    type="text"
                    value={dispatchNotice}
                    onChange={(e) => setDispatchNotice(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <button type="submit" className={styles.primaryActionBtn} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                  SAVE SETTINGS
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsProductModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800 }}>
                {editingProduct ? 'EDIT GARMENT PIECE' : 'REGISTER NEW GARMENT DROP'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#a8a49c', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.modalFormGrid}>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>GARMENT TITLE</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Flame Hashira // Kyojuro Heavyweight Tee"
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>JAPANESE TITLE</label>
                  <input
                    type="text"
                    value={prodJpName}
                    onChange={(e) => setProdJpName(e.target.value)}
                    placeholder="e.g. 炎柱 煉獄 // 500GSM ボクシー"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CREW / THEME CATEGORY</label>
                  <select
                    value={prodCrew}
                    onChange={(e) => setProdCrew(e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="STRAW_HAT">Straw Hat / Sun God</option>
                    <option value="HEART">Heart Pirates</option>
                    <option value="RED_HAIR">Red Hair</option>
                    <option value="MARINE">Marine / Justice</option>
                    <option value="WANO">Wano Kuni / Swordsman</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>RETAIL PRICE ($ USD)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>COMPARE AT PRICE ($ USD)</label>
                  <input
                    type="number"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="Optional original price"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>STOCK UNITS</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>GSM FABRIC WEIGHT</label>
                  <input
                    type="number"
                    value={prodGsm}
                    onChange={(e) => setProdGsm(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>SILHOUETTE / CUT</label>
                  <input
                    type="text"
                    value={prodCut}
                    onChange={(e) => setProdCut(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>FABRIC COMPOSITION</label>
                  <input
                    type="text"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>IMAGE ASSET PATH / URL</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>DESCRIPTION / ARCHIVE STORY</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className={styles.formTextarea}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.primaryActionBtn}
                style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '10px' }}
              >
                {editingProduct ? 'APPLY PRODUCT MODIFICATIONS' : 'REGISTER GARMENT IN TOKYO INVENTORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ORDER VIEW MODAL */}
      {viewingOrder && (
        <div className={styles.modalBackdrop} onClick={() => setViewingOrder(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c7a76c' }}>
                  ORDER MANIFEST
                </span>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700 }}>
                  {viewingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                style={{ background: 'none', border: 'none', color: '#a8a49c', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{viewingOrder.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Email:</span>
                <span>{viewingOrder.userEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Address:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%' }}>
                  {viewingOrder.shippingAddress?.address}, {viewingOrder.shippingAddress?.city},{' '}
                  {viewingOrder.shippingAddress?.country}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>Tracking Number:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c' }}>
                  {viewingOrder.trackingNumber || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(245, 242, 235, 0.08)', paddingTop: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8c8c8c' }}>ORDER ITEMS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {viewingOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span>
                      {it.product?.name} ({it.selectedSize}) × {it.quantity}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>${it.product?.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(245, 242, 235, 0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
              <span>TOTAL BILLED:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#c7a76c' }}>${viewingOrder.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
