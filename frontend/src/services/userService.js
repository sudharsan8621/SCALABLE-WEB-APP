import { apiService } from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiService.get('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiService.put('/users/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiService.get('/users/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Deactivate user account
  deactivateAccount: async () => {
    try {
      const response = await apiService.delete('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await apiService.get('/users');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload user avatar (if implemented)
  uploadAvatar: async (formData, onProgress = null) => {
    try {
      const response = await apiService.upload('/users/avatar', formData, onProgress);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user avatar (if implemented)
  deleteAvatar: async () => {
    try {
      const response = await apiService.delete('/users/avatar');
      return response;
    } catch (error) {
      throw error;
    }
  },
};