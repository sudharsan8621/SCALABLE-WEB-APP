const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, updateProfileSchema } = require('../middleware/validation');

const router = express.Router();

// In-memory storage for development (when MongoDB is not available)
const inMemoryUsers = new Map();

// Helper function to find user (works with or without MongoDB)
const findUserById = async (id) => {
  try {
    // Try MongoDB first
    const user = await User.findById(id);
    return user;
  } catch (error) {
    // Fallback to in-memory storage
    for (const user of inMemoryUsers.values()) {
      if (user._id == id) {
        return user;
      }
    }
    return null;
  }
};

// Helper function to update user (works with or without MongoDB)
const updateUser = async (id, updateData) => {
  try {
    // Try MongoDB first
    const user = await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
    return user ? user.getPublicProfile() : null;
  } catch (error) {
    // Fallback to in-memory storage
    for (const [email, user] of inMemoryUsers.entries()) {
      if (user._id == id) {
        Object.assign(user, updateData, { updatedAt: new Date() });
        const { password, ...publicProfile } = user;
        return publicProfile;
      }
    }
    return null;
  }
};

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const userResponse = user.getPublicProfile ? user.getPublicProfile() : { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update user
    const updatedUser = await updateUser(req.user.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
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
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Basic user stats
    const stats = {
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      profileCompletion: calculateProfileCompletion(user)
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    });
  }
});

// @route   DELETE /api/users/profile
// @desc    Deactivate user account
// @access  Private
router.delete('/profile', authenticate, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.user.id, { isActive: false });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating account'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    let users;
    
    try {
      // Try MongoDB first
      users = await User.find({ isActive: true }).select('-password');
    } catch (error) {
      // Fallback to in-memory storage
      users = Array.from(inMemoryUsers.values())
        .filter(user => user.isActive)
        .map(({ password, ...user }) => user);
    }

    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user) {
  let completedFields = 0;
  const totalFields = 4; // name, email, avatar, bio (if added later)
  
  if (user.name && user.name.trim()) completedFields++;
  if (user.email && user.email.trim()) completedFields++;
  if (user.avatar) completedFields++;
  // Add more fields as needed
  
  return Math.round((completedFields / totalFields) * 100);
}

module.exports = router;