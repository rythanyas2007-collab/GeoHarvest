import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrRole: { email?: string; role?: UserRole }) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('geoharvest_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const activeToken = localStorage.getItem('geoharvest_token');
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (params: { email?: string; role?: UserRole }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('geoharvest_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Role switch failed');
      }
      localStorage.setItem('geoharvest_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Error switching role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const activeToken = localStorage.getItem('geoharvest_token');
      if (activeToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
      }
    } catch {}
    localStorage.removeItem('geoharvest_token');
    setToken(null);
    // Fetch default public user
    await fetchCurrentUser();
  };

  const hasPermission = (permission: string): boolean => {
    const currentRole = user?.role || 'public_viewer';

    switch (permission) {
      case 'view_audit_logs':
        return ['super_admin', 'government_admin', 'district_admin'].includes(currentRole);
      case 'manage_users':
        return currentRole === 'super_admin';
      case 'assign_officers':
        return ['super_admin', 'government_admin', 'district_admin'].includes(currentRole);
      case 'submit_evidence':
        return ['field_officer', 'verification_officer', 'super_admin'].includes(currentRole);
      case 'verify_completion':
        return ['verification_officer', 'government_admin', 'super_admin'].includes(currentRole);
      case 'run_gis_analysis':
        return ['gis_analyst', 'government_admin', 'super_admin'].includes(currentRole);
      case 'submit_complaint':
        return true; // All roles can report issues
      case 'view_full_coordinates':
        return currentRole !== 'public_viewer';
      default:
        return true;
    }
  };

  const role = user?.role || 'public_viewer';
  const isAuthenticated = Boolean(user && user.role !== 'public_viewer');

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isLoading,
        login,
        switchRole,
        logout,
        hasPermission,
        refreshUser: fetchCurrentUser
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
