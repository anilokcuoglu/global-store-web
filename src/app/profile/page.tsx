"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useApp } from "@/contexts/AppContext";
import { orderService, Order } from "@/services/orderService";
import { userService, User } from "@/services/userService";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { convertAndFormatPrice } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: {
      city: "",
      street: "",
      number: "",
      zipcode: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load orders
        const userOrders = orderService.getAllOrders();
        setOrders(userOrders);

        // Load user profile (simulate getting current user)
        // In a real app, you'd get the current user ID from auth context
        const users = await userService.getAllUsers();
        if (users.length > 0) {
          const currentUser = users[0]; // Simulate current user
          setUser(currentUser);
          setProfileForm({
            firstname: currentUser.name.firstname,
            lastname: currentUser.name.lastname,
            email: currentUser.email,
            phone: currentUser.phone,
            address: {
              city: currentUser.address.city,
              street: currentUser.address.street,
              number: currentUser.address.number.toString(),
              zipcode: currentUser.address.zipcode,
            },
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you'd call userService.updateProfile()
      console.log("Profile updated:", profileForm);
      alert(t("profile.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t("profile.updateError"));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getTotalSpent = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getOrderStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      processing: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      shipped: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      delivered: "text-green-600 bg-green-100 dark:bg-green-900/20",
      cancelled: "text-red-600 bg-red-100 dark:bg-red-900/20",
    };
    return colors[status] || "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300">
                {t("profile.loading")}
              </p>
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
            {t("profile.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t("profile.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {t("profile.orderHistory")}
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {t("profile.myProfile")}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t("profile.totalOrders")}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {orders.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t("profile.totalSpent")}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {convertAndFormatPrice(getTotalSpent())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t("profile.deliveredOrders")}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {
                        orders.filter((order) => order.status === "delivered")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("profile.recentOrders")}
                </h3>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {t("profile.noOrders")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {t("profile.noOrdersMessage")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {order.orderNumber}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {orderService.formatOrderDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {orderService.getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-300">
                            <span>
                              {t("profile.items")}: {order.items.length}
                            </span>
                            <span>
                              {t("profile.total")}:{" "}
                              {convertAndFormatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {convertAndFormatPrice(order.total)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("profile.estimatedDelivery")}:{" "}
                            {orderService.formatOrderDate(
                              order.estimatedDelivery
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                {t("profile.updateProfile")}
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.firstName")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstname}
                      onChange={(e) =>
                        handleInputChange("firstname", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.lastName")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastname}
                      onChange={(e) =>
                        handleInputChange("lastname", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("profile.email")}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("profile.phone")}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.city")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.zipcode")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.address.zipcode}
                      onChange={(e) =>
                        handleInputChange("address.zipcode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.street")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.address.street}
                      onChange={(e) =>
                        handleInputChange("address.street", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t("profile.number")}
                    </label>
                    <input
                      type="text"
                      value={profileForm.address.number}
                      onChange={(e) =>
                        handleInputChange("address.number", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {updatingProfile ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("profile.updating")}</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{t("profile.updateProfile")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
