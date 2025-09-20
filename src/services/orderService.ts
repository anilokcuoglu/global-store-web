import { Product } from './productService';
import { User } from './userService';

export interface OrderItem {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  userId: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  userId?: number;
}

const API_BASE_URL = "https://fakestoreapi.com";
const ORDERS_STORAGE_KEY = 'global-store-orders';

export class OrderService {
  private static instance: OrderService;
  private orders: Order[] = [];

  private constructor() {
    this.loadOrdersFromStorage();
  }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  private loadOrdersFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        this.orders = parsedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      this.orders = [];
    }
  }

  private saveOrdersToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving orders to storage:', error);
    }
  }

  public async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      // Calculate totals
      const subtotal = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      const newOrder: Order = {
        id: Date.now(), // Simple ID generation
        userId: orderData.userId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentInfo: orderData.paymentInfo,
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        trackingNumber: this.generateTrackingNumber(),
        estimatedDelivery: this.calculateEstimatedDelivery()
      };

      // In a real app, you would send this to your backend
      // const response = await fetch(`${API_BASE_URL}/orders`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newOrder),
      // });

      this.orders.push(newOrder);
      this.saveOrdersToStorage();

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  }

  public async getOrderById(orderId: number): Promise<Order | null> {
    const order = this.orders.find(order => order.id === orderId);
    return order || null;
  }

  public async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orders.filter(order => order.userId === userId);
  }

  public async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    let filteredOrders = [...this.orders];

    if (filters) {
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }

      if (filters.userId) {
        filteredOrders = filteredOrders.filter(order => order.userId === filters.userId);
      }

      if (filters.startDate) {
        filteredOrders = filteredOrders.filter(order => order.createdAt >= filters.startDate!);
      }

      if (filters.endDate) {
        filteredOrders = filteredOrders.filter(order => order.createdAt <= filters.endDate!);
      }
    }

    return filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.find(order => order.id === orderId);
    
    if (!order) {
      return null;
    }

    order.status = status;
    order.updatedAt = new Date();

    // Update tracking info for shipped orders
    if (status === 'shipped' && !order.trackingNumber) {
      order.trackingNumber = this.generateTrackingNumber();
      order.estimatedDelivery = this.calculateEstimatedDelivery();
    }

    this.saveOrdersToStorage();
    return order;
  }

  public async cancelOrder(orderId: number): Promise<Order | null> {
    const order = this.orders.find(order => order.id === orderId);
    
    if (!order) {
      return null;
    }

    // Only allow cancellation of pending or confirmed orders
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new Error('Cannot cancel order in current status');
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    this.saveOrdersToStorage();

    return order;
  }

  public async refundOrder(orderId: number): Promise<Order | null> {
    const order = this.orders.find(order => order.id === orderId);
    
    if (!order) {
      return null;
    }

    // Only allow refund of delivered orders
    if (order.status !== 'delivered') {
      throw new Error('Can only refund delivered orders');
    }

    order.status = 'refunded';
    order.updatedAt = new Date();
    this.saveOrdersToStorage();

    return order;
  }

  public getOrderStatusText(status: OrderStatus): string {
    const statusTexts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };

    return statusTexts[status];
  }

  public getOrderStatusColor(status: OrderStatus): string {
    const statusColors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      processing: 'text-purple-600 bg-purple-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      refunded: 'text-gray-600 bg-gray-100'
    };

    return statusColors[status];
  }

  public getOrderStats(userId?: number): {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    statusCounts: Record<OrderStatus, number>;
  } {
    const userOrders = userId ? this.orders.filter(order => order.userId === userId) : this.orders;
    
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((total, order) => total + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const statusCounts = userOrders.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
      return counts;
    }, {} as Record<OrderStatus, number>);

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      statusCounts
    };
  }

  private generateTrackingNumber(): string {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
    return deliveryDate;
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();

// Utility functions
export function formatOrderDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatOrderTotal(total: number, currency: string = 'USD'): string {
  const symbols = {
    USD: '$',
    EUR: '€',
    TRY: '₺'
  };
  
  return `${symbols[currency as keyof typeof symbols] || '$'}${total.toFixed(2)}`;
}

export function validateShippingAddress(address: ShippingAddress): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!address.firstName.trim()) {
    errors.push('First name is required');
  }

  if (!address.lastName.trim()) {
    errors.push('Last name is required');
  }

  if (!address.address.trim()) {
    errors.push('Address is required');
  }

  if (!address.city.trim()) {
    errors.push('City is required');
  }

  if (!address.zipCode.trim()) {
    errors.push('ZIP code is required');
  }

  if (!address.country.trim()) {
    errors.push('Country is required');
  }

  if (!address.phone.trim()) {
    errors.push('Phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
