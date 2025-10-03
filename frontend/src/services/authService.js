import { apiService } from './api';

export const authService = {
  // Register new user
  register: async (name, email, password) => {
    try {
      const response = await apiService.post('/auth/register', {
        name,
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiService.post('/auth/logout');
      return response;
    } catch (error) {
      // Don't throw error for logout, just log it
      console.error('Logout error:', error);
      return { success: true }; // Continue with client-side logout
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiService.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      const response = await apiService.get('/auth/verify');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token (if implemented on backend)
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiService.post('/auth/refresh', {
        refreshToken,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset (if implemented)
  requestPasswordReset: async (email) => {
    try {
      const response = await apiService.post('/auth/forgot-password', {
        email,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password (if implemented)
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};