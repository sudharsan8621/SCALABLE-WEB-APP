import { apiService } from './api';

export const taskService = {
  // Get all user tasks with filtering
  getTasks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filtering parameters
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const query = queryParams.toString();
      const url = query ? `/tasks?${query}` : '/tasks';
      
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single task by ID
  getTask: async (taskId) => {
    try {
      const response = await apiService.get(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await apiService.post('/tasks', taskData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update existing task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await apiService.put(`/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await apiService.delete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async () => {
    try {
      const response = await apiService.get('/tasks/stats/summary');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update tasks
  bulkUpdateTasks: async (taskIds, updateData) => {
    try {
      const response = await apiService.put('/tasks/bulk', {
        taskIds,
        updateData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk delete tasks
  bulkDeleteTasks: async (taskIds) => {
    try {
      const response = await apiService.delete('/tasks/bulk', {
        data: { taskIds },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark task as completed
  completeTask: async (taskId) => {
    try {
      const response = await taskService.updateTask(taskId, {
        status: 'completed',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark task as in-progress
  startTask: async (taskId) => {
    try {
      const response = await taskService.updateTask(taskId, {
        status: 'in-progress',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset task to pending
  resetTask: async (taskId) => {
    try {
      const response = await taskService.updateTask(taskId, {
        status: 'pending',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export tasks (if implemented)
  exportTasks: async (format = 'json', filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await apiService.download(`/tasks/export?${queryParams.toString()}`, `tasks.${format}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};