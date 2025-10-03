const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');

const router = express.Router();

// In-memory storage for development (when MongoDB is not available)
const inMemoryUsers = new Map();
let userCounter = 1;

// Helper function to create user (works with or without MongoDB)
const createUser = async (userData) => {
  try {
    // Try MongoDB first
    const user = new User(userData);
    await user.save();
    return user.getPublicProfile();
  } catch (error) {
    // Fallback to in-memory storage
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = {
      _id: userCounter++,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryUsers.set(user.email, user);
    
    const { password, ...publicProfile } = user;
    return publicProfile;
  }
};

// Helper function to find user (works with or without MongoDB)
const findUserByEmail = async (email) => {
  try {
    // Try MongoDB first
    const user = await User.findByEmail(email).select('+password');
    return user;
  } catch (error) {
    // Fallback to in-memory storage
    return inMemoryUsers.get(email.toLowerCase());
  }
};

// Helper function to verify password
const verifyPassword = async (inputPassword, hashedPassword, user) => {
  if (user.matchPassword) {
    // MongoDB user with method
    return await user.matchPassword(inputPassword);
  } else {
    // In-memory user
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await createUser({ name, email, password });

    // Generate token
    const token = generateToken({ id: user._id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password, user);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login (if MongoDB is available)
    if (user.save) {
      user.lastLogin = new Date();
      await user.save();
    } else if (inMemoryUsers.has(email.toLowerCase())) {
      inMemoryUsers.get(email.toLowerCase()).lastLogin = new Date();
    }

    // Generate token
    const token = generateToken({ id: user._id });

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject ? user.getPublicProfile() : user;
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    // Find user (req.user is set by authenticate middleware)
    const user = await findUserByEmail(req.user.email);
    
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

// @route   POST /api/auth/logout
// @desc    Logout user (mainly for client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing the token
  // This endpoint is mainly for logging purposes and client confirmation
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;