const { body } = require('express-validator');

/**
 * Registration validation rules
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and dots')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Full name must be between 1 and 60 characters')
    .notEmpty()
    .withMessage('Full name is required'),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
};