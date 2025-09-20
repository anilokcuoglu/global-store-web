'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useTranslation } from '@/hooks/useTranslation';
import { getAllProducts, Product } from '@/services/productService';
import { cartService } from '@/services';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await getAllProducts();
        setAllProducts(fetchedProducts);
        // İlk 8 ürünü featured olarak göster
        setProducts(fetchedProducts.slice(0, 8));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('products.errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (id: number) => {
    // This function is called from ProductCard after successful add to cart
    // No need to add to cart here since ProductCard handles it
    console.log(`Ürün ${id} sepete eklendi`);
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDisplayCount = displayCount + 8;
    const newProducts = allProducts.slice(0, newDisplayCount);
    
    setProducts(newProducts);
    setDisplayCount(newDisplayCount);
    setLoadingMore(false);
  };

  const hasMoreProducts = displayCount < allProducts.length;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('products.featured')}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t('products.description')}</p>
        </div> */}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300">{t('products.loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('products.error')}</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('products.retry')}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('products.empty')}</h3>
              <p className="text-slate-600 dark:text-slate-300">{t('products.emptyMessage')}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.title}
                  description={product.description}
                  priceUSD={product.price}
                  image={product.image}
                  rating={product.rating}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('products.loadingMore')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{t('products.loadMore')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMoreProducts && allProducts.length > 8 && (
              <div className="text-center mt-8">
                <p className="text-slate-600 dark:text-slate-300">
                  {t('products.allShown')} ({allProducts.length} {t('products.totalProducts')})
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
