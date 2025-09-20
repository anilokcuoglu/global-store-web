export interface OrderItem {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
  quantity: number;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType: "visa" | "mastercard" | "amex" | "other";
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentInfo: PaymentInfo;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
}

const ORDERS_STORAGE_KEY = "global-store-orders";

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
    if (typeof window === "undefined") return;

    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        this.orders = parsedOrders.map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          estimatedDelivery: new Date(order.estimatedDelivery),
        }));
      }
    } catch (error) {
      console.error("Error loading orders from storage:", error);
      this.orders = [];
    }
  }

  private saveOrdersToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
    } catch (error) {
      console.error("Error saving orders to storage:", error);
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `GS-${timestamp.slice(-6)}-${random}`;
  }

  private calculateDeliveryDate(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate;
  }

  public async createOrder(
    items: OrderItem[],
    paymentInfo: PaymentInfo
  ): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = 0;

    const total = subtotal + shipping;

    const order: Order = {
      id: `order_${Date.now()}`,
      orderNumber: this.generateOrderNumber(),
      items,
      subtotal,
      shipping,
      total,
      paymentInfo,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: this.calculateDeliveryDate(),
    };

    this.orders.unshift(order); // Add to beginning of array
    this.saveOrdersToStorage();

    return order;
  }

  public getAllOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(orderId: string): Order | null {
    return this.orders.find((order) => order.id === orderId) || null;
  }

  public getOrderByNumber(orderNumber: string): Order | null {
    return (
      this.orders.find((order) => order.orderNumber === orderNumber) || null
    );
  }

  public updateOrderStatus(orderId: string, status: Order["status"]): boolean {
    const order = this.orders.find((order) => order.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.saveOrdersToStorage();
      return true;
    }
    return false;
  }

  public getOrdersByStatus(status: Order["status"]): Order[] {
    return this.orders.filter((order) => order.status === status);
  }

  public getRecentOrders(limit: number = 5): Order[] {
    return this.orders.slice(0, limit);
  }

  public getTotalOrders(): number {
    return this.orders.length;
  }

  public getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  public deleteOrder(orderId: string): boolean {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter((order) => order.id !== orderId);

    if (this.orders.length < initialLength) {
      this.saveOrdersToStorage();
      return true;
    }
    return false;
  }

  public clearAllOrders(): void {
    this.orders = [];
    this.saveOrdersToStorage();
  }

  // Utility functions
  public formatOrderDate(date: Date): string {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  public getStatusText(status: Order["status"]): string {
    const statusMap = {
      pending: "Beklemede",
      processing: "İşleniyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
    };
    return statusMap[status] || status;
  }

  public getStatusColor(status: Order["status"]): string {
    const colorMap = {
      pending: "text-yellow-600 bg-yellow-100",
      processing: "text-blue-600 bg-blue-100",
      shipped: "text-purple-600 bg-purple-100",
      delivered: "text-green-600 bg-green-100",
      cancelled: "text-red-600 bg-red-100",
    };
    return colorMap[status] || "text-gray-600 bg-gray-100";
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();

// Utility functions
export function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, "");

  // Check if it's a valid length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function getCardType(cardNumber: string): PaymentInfo["cardType"] {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (cleaned.startsWith("4")) {
    return "visa";
  } else if (cleaned.startsWith("5") || cleaned.startsWith("2")) {
    return "mastercard";
  } else if (cleaned.startsWith("3")) {
    return "amex";
  } else {
    return "other";
  }
}

export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

export function formatExpiryDate(expiryDate: string): string {
  const cleaned = expiryDate.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
}
