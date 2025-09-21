"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import SearchBar from "./SearchBar";
import { useTranslation } from "@/hooks/useTranslation";
import { getAllProducts, Product } from "@/services/productService";

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await getAllProducts();
        setAllProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(t("products.errorMessage"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If search is empty, show all products
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredProducts(filtered);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder={t("search.placeholder")}
              className="w-full"
            />
          </div>
        </div>

        {searchQuery && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("search.resultsFor")} &quot;{searchQuery}&quot;
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {filteredProducts.length} {t("search.resultsFound")}
            </p>
          </div>
        )}

        {/* <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('products.featured')}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t('products.description')}</p>
        </div> */}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300">
                {t("products.loading")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t("products.error")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("products.retry")}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery ? t("search.noResults") : t("products.empty")}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {searchQuery
                  ? t("search.noResultsMessage")
                  : t("products.emptyMessage")}
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.title}
                  description={product.description}
                  priceUSD={product.price}
                  image={product.image}
                  rating={product.rating}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
