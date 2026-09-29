import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  BookOpen, Users, LayoutDashboard, Bookmark, DollarSign, LogOut, Search, QrCode, TrendingUp, AlertTriangle, MessageSquare, MapPin, Settings, Menu, Bell, Sun, Moon, X, ChevronRight, PanelLeftClose, PanelLeftOpen, UserCircle, ShoppingCart, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../services/api';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingCart, setIsSubmittingCart] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmittingCart(true);
    try {
      const bookIds = cartItems.map(item => item.id);
      await api.post('/reservations/batch', { bookIds });
      toast.success('Successfully requested selected books!');
      clearCart();
      setIsCartOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request books');
    } finally {
      setIsSubmittingCart(false);
    }
  };

  const adminNavGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      ]
    },
    {
      label: 'Library',
      items: [
        { to: '/admin/books', icon: BookOpen, label: 'Inventory' },
        { to: '/admin/digital-library', icon: BookOpen, label: 'Digital Library' },
      ]
    },
    {
      label: 'Circulation',
      items: [
        { to: '/admin/issues', icon: Bookmark, label: 'Issues & Returns' },
        { to: '/admin/reservations', icon: Bookmark, label: 'Reservations' },
      ]
    },
    {
      label: 'Members',
      items: [
        { to: '/admin/students', icon: Users, label: 'Students' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { to: '/admin/fines', icon: DollarSign, label: 'Fines' },
        { to: '/admin/seats', icon: MapPin, label: 'Seats & Rooms' },
        { to: '/admin/purchase-requests', icon: MessageSquare, label: 'Purchase Requests' },
        { to: '/admin/book-conditions', icon: AlertTriangle, label: 'Lost & Damaged' },
      ]
    },
    {
      label: 'Insights & System',
      items: [
        { to: '/admin/stats', icon: TrendingUp, label: 'Analytics' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
        { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
      ]
    }
  ];

  const studentNavGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
      ]
    },
    {
      label: 'Library',
      items: [
        { to: '/student/browse', icon: Search, label: 'Browse Books' },
        { to: '/student/digital-library', icon: BookOpen, label: 'Digital Library' },
        { to: '/student/request', icon: MessageSquare, label: 'Request a Book' },
      ]
    },
    {
      label: 'My Account',
      items: [
        { to: '/student/my-books', icon: Bookmark, label: 'My Borrowing' },
        { to: '/student/fines', icon: DollarSign, label: 'My Fines' },
        { to: '/student/seat-booking', icon: MapPin, label: 'Book a Seat' },
        { to: '/student/id', icon: QrCode, label: 'Digital ID Card' },
        { to: '/student/profile', icon: UserCircle, label: 'Profile' },
      ]
    }
  ];

  const navGroups = user?.role === 'ADMIN' ? adminNavGroups : studentNavGroups;

  // Render Sidebar content
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--card)] border-r border-[var(--border)] pt-5 pb-4">
      <div className={`flex items-center px-4 mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-[var(--color-primary-600)]" />
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">SmartLib</span>
          </div>
        )}
        {isCollapsed && <BookOpen className="h-8 w-8 text-[var(--color-primary-600)]" />}
      </div>
      <div className="mt-2 flex-grow flex flex-col px-3">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-4">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-400)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon
                    className={`${
                      isCollapsed ? 'mr-0' : 'mr-3'
                    } h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Cart overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* Cart Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 transform bg-[var(--card)] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-[var(--border)] ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Book Cart
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-[var(--muted-foreground)]">
              <ShoppingCart className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-[var(--muted)] p-3 rounded-lg">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded" />
                ) : (
                  <div className="w-12 h-16 bg-gray-200 flex items-center justify-center rounded">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">{item.author?.name || 'Unknown'}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-600 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/50">
          <Button 
            className="w-full" 
            disabled={cartItems.length === 0 || isSubmittingCart}
            onClick={handleCheckout}
          >
            {isSubmittingCart ? 'Requesting...' : `Request Selected Books (${cartItems.length})`}
          </Button>
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[var(--card)] transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-0 right-0 pt-2 -mr-12">
          <button
            type="button"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
        {renderSidebarContent()}
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {renderSidebarContent()}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-4">
            <button
              type="button"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden lg:block text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            
            <div className="hidden sm:flex flex-1 items-center max-w-md ml-4">
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search books, members, issues..."
                  className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-1.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.role === 'STUDENT' && (
              <button
                type="button"
                className="relative p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-[10px] font-bold text-white transform translate-x-1 -translate-y-1">
                    {cartItems.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              className="relative p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-danger-500)]"></span>
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative flex items-center gap-3 border-l border-[var(--border)] pl-4 ml-2">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="block text-sm font-medium text-[var(--foreground)] leading-tight">{user?.name}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{user?.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-700)] font-bold border border-[var(--color-primary-200)]">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--color-danger-500)] focus:outline-none transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
