export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE_URL = "https://fakestoreapi.com";

// Cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAllProducts(): Promise<Product[]> {
  const now = Date.now();

  if (productsCache && now - cacheTimestamp < CACHE_DURATION) {
    return productsCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (!response.ok) {
      throw new Error(`Products API error: ${response.status}`);
    }

    const products: Product[] = await response.json();
    
    productsCache = products;
    cacheTimestamp = now;
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    
    // Return mock data as fallback
    return getMockProducts();
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Product API error: ${response.status}`);
    }

    const product: Product = await response.json();
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
    
    if (!response.ok) {
      throw new Error(`Category API error: ${response.status}`);
    }

    const products: Product[] = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error(`Categories API error: ${response.status}`);
    }

    const categories: string[] = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return ["electronics", "jewelery", "men's clothing", "women's clothing"];
  }
}

export function searchProducts(products: Product[], filters: ProductFilters): Product[] {
  let filteredProducts = [...products];

  // Search by title or description
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by category
  if (filters.category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category === filters.category
    );
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= filters.minPrice!
    );
  }

  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.price <= filters.maxPrice!
    );
  }

  // Filter by rating
  if (filters.rating !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.rating.rate >= filters.rating!
    );
  }

  return filteredProducts;
}

export function sortProducts(products: Product[], sortBy: 'price-asc' | 'price-desc' | 'rating' | 'name'): Product[] {
  const sortedProducts = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'rating':
      return sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    case 'name':
      return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedProducts;
  }
}

// Mock data for fallback
function getMockProducts(): Product[] {
  return [
    {
      id: 1,
      title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      price: 109.95,
      description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      rating: {
        rate: 3.9,
        count: 120
      }
    },
    {
      id: 2,
      title: "Mens Casual Premium Slim Fit T-Shirts",
      price: 22.3,
      description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
      rating: {
        rate: 4.1,
        count: 259
      }
    },
    {
      id: 3,
      title: "Mens Cotton Jacket",
      price: 55.99,
      description: "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      rating: {
        rate: 4.7,
        count: 500
      }
    }
  ];
}
