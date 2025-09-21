export interface FakeStoreUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
  address: {
    geolocation: {
      lat: string;
      long: string;
    };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  __v: number;
}

export interface LoginResponse {
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Available demo users from FakeStore API
export const DEMO_USERS = [
  {
    id: 1,
    username: 'johnd',
    password: 'm38rmF$',
    name: { firstname: 'John', lastname: 'Doe' },
    email: 'john@gmail.com'
  },
  {
    id: 2,
    username: 'mor_2314',
    password: '83r5^_',
    name: { firstname: 'David', lastname: 'Morrison' },
    email: 'morrison@gmail.com'
  },
  {
    id: 3,
    username: 'kevinryan',
    password: 'kev02937@',
    name: { firstname: 'Kevin', lastname: 'Ryan' },
    email: 'kevin@gmail.com'
  },
  {
    id: 4,
    username: 'donero',
    password: 'ewedon',
    name: { firstname: 'Don', lastname: 'Romer' },
    email: 'don@gmail.com'
  },
  {
    id: 5,
    username: 'derek',
    password: 'jklg*_56',
    name: { firstname: 'Derek', lastname: 'Powell' },
    email: 'derek@gmail.com'
  }
];

export class AuthService {
  private static readonly API_BASE = 'https://fakestoreapi.com';

  /**
   * Login with real FakeStore API
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  /**
   * Get user details by ID from FakeStore API
   */
  static async getUserById(userId: number): Promise<FakeStoreUser> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Failed to fetch user details.');
    }
  }

  /**
   * Get all users from FakeStore API
   */
  static async getAllUsers(): Promise<FakeStoreUser[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error('Failed to fetch users.');
    }
  }

  /**
   * Mock login using real API with demo user
   */
  static async mockLogin(): Promise<{ user: FakeStoreUser; token: string }> {
    try {
      // Use the first demo user for mock login
      const demoUser = DEMO_USERS[0];
      
      // Login with real API
      const loginResponse = await this.login({
        username: demoUser.username,
        password: demoUser.password
      });

      // Get full user details
      const fullUser = await this.getUserById(demoUser.id);

      return {
        user: fullUser,
        token: loginResponse.token
      };
    } catch (error) {
      console.error('Mock login error:', error);
      throw new Error('Mock login failed. Please try again.');
    }
  }

  /**
   * Register a new user (simulated - FakeStore API doesn't support registration)
   */
  static async register(email: string, password: string, firstName: string, lastName: string): Promise<{ user: any; token: string }> {
    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Since FakeStore API doesn't support registration, we'll create a mock user
      const mockUser = {
        id: Date.now(),
        email,
        username: email.split('@')[0],
        name: {
          firstname: firstName,
          lastname: lastName
        },
        phone: '',
        address: {
          geolocation: { lat: '0', long: '0' },
          city: '',
          street: '',
          number: 0,
          zipcode: ''
        },
        __v: 0
      };

      // Generate a mock token
      const mockToken = `mock_token_${Date.now()}`;

      return {
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }
}
