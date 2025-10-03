const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters'],
    default: 'General'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set completedAt when task is completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  // Clear completedAt if task is not completed
  if (this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
  }
  
  next();
});

// Index for better query performance
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });

// Static method to get user tasks with filtering
taskSchema.statics.getUserTasks = function(userId, filter = {}) {
  const query = { user: userId };
  
  // Add status filter if provided
  if (filter.status) {
    query.status = filter.status;
  }
  
  // Add priority filter if provided
  if (filter.priority) {
    query.priority = filter.priority;
  }
  
  // Add category filter if provided
  if (filter.category) {
    query.category = new RegExp(filter.category, 'i');
  }
  
  // Add search filter if provided
  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ];
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;