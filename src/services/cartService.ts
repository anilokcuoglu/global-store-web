import { Product } from './productService';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'global-store-cart';

export class CartService {
  private static instance: CartService;
  private cart: Cart = {
    items: [],
    totalItems: 0,
    totalPrice: 0
  };

  private constructor() {
    this.loadCartFromStorage();
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  private loadCartFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        this.cart = {
          ...parsedCart,
          items: parsedCart.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        };
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cart = { items: [], totalItems: 0, totalPrice: 0 };
    }
  }

  private saveCartToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private updateTotals(): void {
    this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    this.cart.totalPrice = this.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  public getCart(): Cart {
    return { ...this.cart };
  }

  public addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cart.items.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({
        id: product.id, // Use product ID as item ID
        product,
        quantity,
        addedAt: new Date()
      });
    }

    this.updateTotals();
    this.saveCartToStorage();
  }

  public removeFromCart(productId: number): void {
    this.cart.items = this.cart.items.filter(item => item.product.id !== productId);
    this.updateTotals();
    this.saveCartToStorage();
  }

  public updateQuantity(productId: number, quantity: number): void {
    const item = this.cart.items.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateTotals();
        this.saveCartToStorage();
      }
    }
  }

  public clearCart(): void {
    this.cart = { items: [], totalItems: 0, totalPrice: 0 };
    this.saveCartToStorage();
  }

  public getItemCount(): number {
    return this.cart.totalItems;
  }

  public getTotalPrice(): number {
    return this.cart.totalPrice;
  }

  public isInCart(productId: number): boolean {
    return this.cart.items.some(item => item.product.id === productId);
  }

  public getItemQuantity(productId: number): number {
    const item = this.cart.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  public getCartSummary(): {
    totalItems: number;
    totalPrice: number;
    uniqueItems: number;
  } {
    return {
      totalItems: this.cart.totalItems,
      totalPrice: this.cart.totalPrice,
      uniqueItems: this.cart.items.length
    };
  }

  public getCartItems(): any[] {
    return this.cart.items.map(item => ({
      id: item.id, // Use item ID (which is now product ID)
      title: item.product.title,
      price: item.product.price,
      description: item.product.description,
      category: item.product.category,
      image: item.product.image,
      rating: item.product.rating,
      quantity: item.quantity
    }));
  }
}

// Export singleton instance
export const cartService = CartService.getInstance();

// Utility functions
export function formatCartPrice(price: number, currency: string = 'USD'): string {
  const symbols = {
    USD: '$',
    EUR: '€',
    TRY: '₺'
  };
  
  return `${symbols[currency as keyof typeof symbols] || '$'}${price.toFixed(2)}`;
}

export function calculateCartTotals(items: CartItem[], currency: string = 'USD'): {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
} {
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total
  };
}
