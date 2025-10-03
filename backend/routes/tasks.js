const express = require('express');
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema } = require('../middleware/validation');

const router = express.Router();

// In-memory storage for development (when MongoDB is not available)
const inMemoryTasks = new Map();
let taskCounter = 1;

// Helper function to create task (works with or without MongoDB)
const createTask = async (taskData) => {
  try {
    // Try MongoDB first
    const task = new Task(taskData);
    await task.save();
    return task;
  } catch (error) {
    // Fallback to in-memory storage
    const task = {
      _id: taskCounter++,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryTasks.set(task._id, task);
    return task;
  }
};

// Helper function to find tasks (works with or without MongoDB)
const findUserTasks = async (userId, filter = {}) => {
  try {
    // Try MongoDB first
    return await Task.getUserTasks(userId, filter);
  } catch (error) {
    // Fallback to in-memory storage
    let tasks = Array.from(inMemoryTasks.values())
      .filter(task => task.user == userId);
    
    // Apply filters
    if (filter.status) {
      tasks = tasks.filter(task => task.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    if (filter.category) {
      const categoryRegex = new RegExp(filter.category, 'i');
      tasks = tasks.filter(task => categoryRegex.test(task.category));
    }
    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      tasks = tasks.filter(task => 
        searchRegex.test(task.title) || 
        searchRegex.test(task.description) ||
        (task.tags && task.tags.some(tag => searchRegex.test(tag)))
      );
    }
    
    // Sort by creation date (newest first)
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// Helper function to find task by ID
const findTaskById = async (taskId, userId) => {
  try {
    // Try MongoDB first
    const task = await Task.findOne({ _id: taskId, user: userId });
    return task;
  } catch (error) {
    // Fallback to in-memory storage
    const task = inMemoryTasks.get(parseInt(taskId));
    return task && task.user == userId ? task : null;
  }
};

// Helper function to update task
const updateTask = async (taskId, userId, updateData) => {
  try {
    // Try MongoDB first
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );
    return task;
  } catch (error) {
    // Fallback to in-memory storage
    const task = inMemoryTasks.get(parseInt(taskId));
    if (task && task.user == userId) {
      Object.assign(task, updateData, { updatedAt: new Date() });
      
      // Handle completion logic
      if (updateData.status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
      } else if (updateData.status !== 'completed' && task.completedAt) {
        task.completedAt = null;
      }
      
      return task;
    }
    return null;
  }
};

// Helper function to delete task
const deleteTask = async (taskId, userId) => {
  try {
    // Try MongoDB first
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    return task;
  } catch (error) {
    // Fallback to in-memory storage
    const task = inMemoryTasks.get(parseInt(taskId));
    if (task && task.user == userId) {
      inMemoryTasks.delete(parseInt(taskId));
      return task;
    }
    return null;
  }
};

// @route   GET /api/tasks
// @desc    Get user tasks with filtering and search
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) filter.search = search;
    
    // Get tasks
    const tasks = await findUserTasks(req.user.id, filter);
    
    // Implement pagination for in-memory storage
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        tasks: paginatedTasks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(tasks.length / limit),
          count: paginatedTasks.length,
          totalTasks: tasks.length
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', authenticate, validate(createTaskSchema), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user: req.user.id
    };
    
    const task = await createTask(taskData);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await findTaskById(req.params.id, req.user.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', authenticate, validate(updateTaskSchema), async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.user.id, req.body);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await deleteTask(req.params.id, req.user.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
});

// @route   GET /api/tasks/stats/summary
// @desc    Get task statistics
// @access  Private
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const tasks = await findUserTasks(req.user.id);
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      highPriority: tasks.filter(task => task.priority === 'high').length,
      overdue: tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        task.status !== 'completed'
      ).length
    };
    
    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task statistics'
    });
  }
});

module.exports = router;