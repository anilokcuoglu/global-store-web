'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useApp } from '@/contexts/AppContext';
import { cartService } from '@/services';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GiftModal from '@/components/GiftModal';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CartItem {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
  quantity: number;
}

export default function CartPage() {
  const { t } = useTranslation();
  const { convertAndFormatPrice } = useApp();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isGifting, setIsGifting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const loadCartItems = () => {
      const items = cartService.getCartItems();
      setCartItems(items);
      setLoading(false);
    };

    loadCartItems();

    // Listen for cart changes
    const handleStorageChange = () => {
      loadCartItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    cartService.updateQuantity(id, newQuantity);
    const items = cartService.getCartItems();
    setCartItems(items);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const removeItem = (id: number) => {
    cartService.removeFromCart(id);
    const items = cartService.getCartItems();
    setCartItems(items);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const clearCart = () => {
    cartService.clearCart();
    setCartItems([]);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleGift = async (userId: number, userName: string) => {
    setIsGifting(true);
    
    // Simulate gift processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear cart after successful gift
    cartService.clearCart();
    setCartItems([]);
    
    // Dispatch custom event to update header
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Show success message
    alert(t('gift.successMessage'));
    console.log(`Cart gifted to user ${userId} (${userName})`);
    
    // Close modal and show redirecting state
    setShowGiftModal(false);
    setIsGifting(false);
    setIsRedirecting(true);
    
    // Redirect to home page after showing loading state
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300">{t('cart.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t('gift.success')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {t('gift.successMessage')}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 dark:text-slate-300">{t('gift.redirecting')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('cart.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t('cart.subtitle')}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 007 20h10a1 1 0 00.96-.74L20 13M7 13h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('cart.empty')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              {t('cart.emptyMessage')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('cart.continueShopping')}
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {t('cart.items')} ({getTotalItems()})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    {t('cart.clearAll')}
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{t('products.product')}</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                          {convertAndFormatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-600 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-md bg-white dark:bg-slate-500 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-400 transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-semibold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-md bg-white dark:bg-slate-500 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-400 transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('cart.removeItem')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {t('cart.orderSummary')}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{t('cart.subtotal')}</span>
                    <span>{convertAndFormatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{t('cart.shipping')}</span>
                    <span>{t('cart.free')}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
                      <span>{t('cart.total')}</span>
                      <span>{convertAndFormatPrice(getTotalPrice() * 1.18)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium mb-4"
                >
                  {t('cart.checkout')}
                </button>

                <button 
                  onClick={() => setShowGiftModal(true)}
                  className="w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  {t('cart.gift')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gift Modal */}
        <GiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          onGift={handleGift}
          isGifting={isGifting}
        />
      </div>
    </div>
    </ProtectedRoute>
  );
}
