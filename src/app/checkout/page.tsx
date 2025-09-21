"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useApp } from "@/contexts/AppContext";
import { cartService } from "@/services";
import {
  orderService,
  OrderItem,
  PaymentInfo,
  validateCardNumber,
  getCardType,
  formatCardNumber,
  formatExpiryDate,
} from "@/services/orderService";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { convertAndFormatPrice } = useApp();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    cardType: "other",
  });

  useEffect(() => {
    const loadCartItems = () => {
      const items = cartService.getCartItems();
      setCartItems(items);
      setLoading(false);
    };

    loadCartItems();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentInfo.cardNumber.trim())
      newErrors.cardNumber = t("checkout.errors.cardNumberRequired");
    else if (!validateCardNumber(paymentInfo.cardNumber))
      newErrors.cardNumber = t("checkout.errors.cardNumberInvalid");
    if (!paymentInfo.cardHolder.trim())
      newErrors.cardHolder = t("checkout.errors.cardHolderRequired");
    if (!paymentInfo.expiryDate.trim())
      newErrors.expiryDate = t("checkout.errors.expiryDateRequired");
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate))
      newErrors.expiryDate = t("checkout.errors.expiryDateInvalid");
    if (!paymentInfo.cvv.trim())
      newErrors.cvv = t("checkout.errors.cvvRequired");
    else if (!/^\d{3,4}$/.test(paymentInfo.cvv))
      newErrors.cvv = t("checkout.errors.cvvInvalid");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
      const cardType = getCardType(value);
      setPaymentInfo((prev) => ({ ...prev, cardType }));
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    }

    setPaymentInfo((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const order = await orderService.createOrder(cartItems, paymentInfo);

      // Clear cart
      cartService.clearCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(t("checkout.errors.orderFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300">
                {t("checkout.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 007 20h10a1 1 0 00.96-.74L20 13M7 13h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t("checkout.emptyCart")}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              {t("checkout.emptyCartMessage")}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("checkout.continueShopping")}
            </button>
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
            {t("checkout.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t("checkout.subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                {t("checkout.paymentInfo")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("checkout.cardNumber")} *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) =>
                      handlePaymentChange("cardNumber", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardNumber
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("checkout.cardHolder")} *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardHolder}
                    onChange={(e) =>
                      handlePaymentChange("cardHolder", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardHolder
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                    placeholder={t("checkout.cardHolderPlaceholder")}
                  />
                  {errors.cardHolder && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardHolder}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("checkout.expiryDate")} *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) =>
                        handlePaymentChange("expiryDate", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiryDate
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-600"
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("checkout.cvv")} *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) =>
                        handlePaymentChange("cvv", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cvv
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-600"
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t("checkout.orderSummary")}
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {t("products.product")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-xs">
                        {t("checkout.quantity")}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {convertAndFormatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{convertAndFormatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{t("checkout.shipping")}</span>
                  <span>{t("checkout.free")}</span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
                    <span>{t("checkout.total")}</span>
                    <span>{convertAndFormatPrice(getTotalPrice() * 1.18)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("checkout.processing")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("checkout.placeOrder")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
}
