'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, FakeStoreUser } from '@/services/authService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isDemo?: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  mockLogin: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, accept any email/password combination
      // In a real app, this would make an API call to your backend
      const userData: User = {
        id: Date.now().toString(),
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        isDemo: false
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create user directly
      // In a real app, this would make an API call to your backend
      const userData: User = {
        id: Date.now().toString(),
        email,
        firstName,
        lastName,
        isDemo: false
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const mockLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use real FakeStore API for mock login
      const { user: fakeStoreUser, token } = await AuthService.mockLogin();
      
      const userData: User = {
        id: fakeStoreUser.id.toString(),
        email: fakeStoreUser.email,
        firstName: fakeStoreUser.name.firstname,
        lastName: fakeStoreUser.name.lastname,
        isDemo: true,
        token: token
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Mock login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    mockLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
