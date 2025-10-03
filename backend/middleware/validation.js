const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

// User registration validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be more than 50 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot be more than 128 characters',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'string.empty': 'Password is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// User profile update validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be more than 50 characters'
    }),
  avatar: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    })
});

// Task creation validation schema
const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Task title is required',
      'string.max': 'Title cannot be more than 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot be more than 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  category: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Category cannot be more than 50 characters'
    }),
  dueDate: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Due date cannot be in the past'
    }),
  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(30)
        .messages({
          'string.max': 'Each tag cannot be more than 30 characters'
        })
    )
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    })
});

// Task update validation schema (all fields optional)
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Task title cannot be empty',
      'string.max': 'Title cannot be more than 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot be more than 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  category: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Category cannot be more than 50 characters'
    }),
  dueDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date'
    }),
  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(30)
        .messages({
          'string.max': 'Each tag cannot be more than 30 characters'
        })
    )
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createTaskSchema,
  updateTaskSchema
};