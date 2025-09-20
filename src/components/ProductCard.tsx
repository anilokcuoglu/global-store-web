"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useApp } from "@/contexts/AppContext";
import { favoriteService, cartService } from "@/services";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  priceUSD: number;
  image?: string;
  rating?: {
    rate: number;
    count: number;
  };
  onAddToCart?: (id: number) => void;
}

export default function ProductCard({
  id,
  name,
  description,
  priceUSD,
  image,
  rating,
  onAddToCart,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { convertAndFormatPrice } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  useEffect(() => {
    setIsFavorite(favoriteService.isFavorite(id));
  }, [id]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity >= 1) {
      setIsUpdatingQuantity(true);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setQuantity(newQuantity);
      setIsUpdatingQuantity(false);
    }
  };

  const handleAddToCartWithQuantity = async () => {
    setIsAddingToCart(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const product = {
      id,
      title: name,
      price: priceUSD,
      description,
      category: "",
      image: image || "",
      rating: rating || { rate: 0, count: 0 },
    };

    // Add to cart with current quantity
    cartService.addToCart(product, quantity);

    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Call the callback after successful addition (no double addition)
    if (onAddToCart) {
      onAddToCart(id);
    }
    
    setIsAddingToCart(false);
  };

  const handleToggleFavorite = () => {
    const newFavoriteState = favoriteService.toggleFavorite(id);
    setIsFavorite(newFavoriteState);
  };

  const renderStars = (rate: number) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <svg
              className="w-4 h-4 text-gray-300 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <svg
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="w-4 h-4 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative flex flex-col h-full">
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 group"
        title={
          isFavorite
            ? t("products.removeFromFavorites")
            : t("products.addToFavorites")
        }
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            isFavorite
              ? "text-red-500 fill-current"
              : "text-slate-400 group-hover:text-red-500"
          }`}
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Product Image - Fixed Height */}
      <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Rating */}
        {rating && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(rating.rate)}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {rating.rate.toFixed(1)} ({rating.count})
            </span>
          </div>
        )}

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        {/* Bottom Section - Fixed at bottom */}
        <div className="mt-auto space-y-4">
          {/* Price */}
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {convertAndFormatPrice(priceUSD)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("products.quantity")}
              </span>
              <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-8 h-8 rounded-md bg-white dark:bg-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1 || isUpdatingQuantity}
                >
                  {isUpdatingQuantity ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  )}
                </button>
                <span className="w-8 text-center font-semibold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 rounded-md bg-white dark:bg-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdatingQuantity}
                >
                  {isUpdatingQuantity ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div>
            <button
              onClick={handleAddToCartWithQuantity}
              disabled={isAddingToCart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("products.addingToCart")}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 007 20h10a1 1 0 00.96-.74L20 13M7 13h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                  <span>{t("products.addToCart")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
