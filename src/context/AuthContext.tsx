import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../database/storage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<User, 'id' | 'role' | 'status' | 'createdAt'>) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (emailOrPhone: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  switchDemoUser: (role: 'member' | 'admin' | 'pending') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      await StorageService.initDatabase();
      const currentId = await StorageService.getCurrentUserId();
      if (currentId) {
        const user = await StorageService.getUserById(currentId);
        if (user) {
          setCurrentUser(user);
        }
      }
    } catch (e) {
      console.error('Failed to init auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const user = await StorageService.getUserByEmailOrMemberNumber(identifier);
      if (!user) {
        return { success: false, message: 'Invalid Member Number, Email or National ID.' };
      }
      if (user.password !== password) {
        return { success: false, message: 'Incorrect password entered.' };
      }
      if (user.status === 'suspended') {
        return { success: false, message: 'This account has been suspended. Please contact SACCO management.' };
      }

      setCurrentUser(user);
      await StorageService.setCurrentUserId(user.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred during login.' };
    }
  };

  const register = async (
    userData: Omit<User, 'id' | 'role' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      // Check existing email
      const existingUser = await StorageService.getUserByEmailOrMemberNumber(userData.email);
      if (existingUser) {
        return { success: false, message: 'An account with this email address already exists.' };
      }

      const users = await StorageService.getUsers();
      // Generate unique member number
      const nextNum = 1040 + users.length + 1;
      const memberNumber = `SACCO-MBR-${nextNum}`;

      const newUser: User = {
        ...userData,
        id: `usr-${Date.now()}`,
        memberNumber,
        role: 'member',
        status: 'active', // Auto-active for demonstration ease
        createdAt: new Date().toISOString().split('T')[0],
      };

      await StorageService.addUser(newUser);
      setCurrentUser(newUser);
      await StorageService.setCurrentUserId(newUser.id);

      return { success: true, user: newUser };
    } catch (e) {
      return { success: false, message: 'Failed to create user account.' };
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await StorageService.setCurrentUserId(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updatedUser: User = { ...currentUser, ...updates };
      await StorageService.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'No active session.' };
    if (currentUser.password !== oldPass) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    const updated = { ...currentUser, password: newPass };
    await StorageService.updateUser(updated);
    setCurrentUser(updated);
    return { success: true, message: 'Password updated successfully.' };
  };

  const resetPassword = async (emailOrPhone: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    const user = await StorageService.getUserByEmailOrMemberNumber(emailOrPhone);
    if (!user) {
      return { success: false, message: 'No member account found with this identifier.' };
    }
    const updated = { ...user, password: newPass };
    await StorageService.updateUser(updated);
    return { success: true, message: 'Password has been reset. You can now log in.' };
  };

  const switchDemoUser = async (targetRole: 'member' | 'admin' | 'pending') => {
    const users = await StorageService.getUsers();
    let target: User | undefined;

    if (targetRole === 'admin') {
      target = users.find((u) => u.role === 'admin');
    } else if (targetRole === 'pending') {
      target = users.find((u) => u.status === 'pending');
    } else {
      target = users.find((u) => u.role === 'member' && u.status === 'active');
    }

    if (target) {
      setCurrentUser(target);
      await StorageService.setCurrentUserId(target.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        switchDemoUser,
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

