import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  godownName?: string;
  companyId: number;
  companyCode: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      // Re-hydrate user from localStorage or fallback
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [token, user]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/api/v1/auth/login', {
        username: username.trim(),
        password,
      });

      if (res.data.isValid && res.data.data?.token) {
        const receivedToken = res.data.data.token;
        const receivedUser = res.data.data.user;

        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      } else {
        return { success: false, error: res.data.message || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error('[Login Error]', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
