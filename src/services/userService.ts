export interface User {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE_URL = "https://fakestoreapi.com";
const AUTH_STORAGE_KEY = 'global-store-auth';

export class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  private constructor() {
    this.loadAuthFromStorage();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private loadAuthFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { user, token } = JSON.parse(storedAuth);
        this.currentUser = user;
        this.authToken = token;
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      this.clearAuth();
    }
  }

  private saveAuthToStorage(user: User, token: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  }

  private clearAuth(): void {
    this.currentUser = null;
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const { token } = await response.json();
      
      // Get user data
      const userResponse = await fetch(`${API_BASE_URL}/users/1`); // Mock user for demo
      const user: User = await userResponse.json();

      this.currentUser = user;
      this.authToken = token;
      this.saveAuthToStorage(user, token);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const newUser: User = await response.json();
      const token = 'mock-token-' + Date.now(); // Mock token for demo

      this.currentUser = newUser;
      this.authToken = token;
      this.saveAuthToStorage(newUser, token);

      return { token, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  public logout(): void {
    this.clearAuth();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public async updateProfile(userData: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${this.currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...this.currentUser, ...userData }),
      });

      if (!response.ok) {
        throw new Error(`Profile update failed: ${response.status}`);
      }

      const updatedUser: User = await response.json();
      this.currentUser = updatedUser;
      this.saveAuthToStorage(updatedUser, this.authToken!);

      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Profile update failed. Please try again.');
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Mock password change for demo
    console.log('Password change requested for user:', this.currentUser.id);
    
    // In a real app, you would send this to your backend
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  public async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${this.currentUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Account deletion failed: ${response.status}`);
      }

      this.clearAuth();
    } catch (error) {
      console.error('Account deletion error:', error);
      throw new Error('Account deletion failed. Please try again.');
    }
  }

  public getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.name.firstname} ${this.currentUser.name.lastname}`;
  }

  public getInitials(): string {
    if (!this.currentUser) return '';
    const { firstname, lastname } = this.currentUser.name;
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  }

  public async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const users: User[] = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users. Please try again.');
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance();

// Utility functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatUserAddress(user: User): string {
  const { address } = user;
  return `${address.street} ${address.number}, ${address.city} ${address.zipcode}`;
}
