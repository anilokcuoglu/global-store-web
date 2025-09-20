export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export class ApiService {
  private static instance: ApiService;
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds
  private defaultRetries: number = 3;

  private constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  public static getInstance(baseURL?: string): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(baseURL);
    }
    return ApiService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          data,
          success: true,
          status: response.status
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new ApiError(
      lastError?.message || 'Request failed',
      0,
      'NETWORK_ERROR'
    );
  }

  public async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  public async put<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  public async patch<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  public async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  public setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  public setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  public setDefaultRetries(retries: number): void {
    this.defaultRetries = retries;
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();

// Utility functions
export function createApiError(message: string, status: number, code?: string): ApiError {
  return new ApiError(message, status, code);
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function handleApiError(error: any): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// Mock API for development/testing
export class MockApiService {
  private static instance: MockApiService;
  private mockData: Map<string, any> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  private initializeMockData(): void {
    // Mock products
    this.mockData.set('/products', [
      {
        id: 1,
        title: "Fjallraven - Foldsack No. 1 Backpack",
        price: 109.95,
        description: "Your perfect pack for everyday use and walks in the forest.",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        rating: { rate: 3.9, count: 120 }
      }
    ]);

    // Mock categories
    this.mockData.set('/products/categories', [
      "electronics",
      "jewelery",
      "men's clothing",
      "women's clothing"
    ]);
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.mockData.get(endpoint) || [];
        resolve({
          data: data as T,
          success: true,
          status: 200
        });
      }, 500); // Simulate network delay
    });
  }

  public async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = Date.now();
        const newData = { ...data, id };
        resolve({
          data: newData as T,
          success: true,
          status: 201
        });
      }, 500);
    });
  }

  public setMockData(endpoint: string, data: any): void {
    this.mockData.set(endpoint, data);
  }
}

export const mockApiService = MockApiService.getInstance();

// Cache service for API responses
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public clear(): void {
    this.cache.clear();
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cacheService = CacheService.getInstance();
