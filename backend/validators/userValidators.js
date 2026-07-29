const { body, param } = require('express-validator');

/**
 * Update profile validation rules
 */
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Full name must be between 1 and 60 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Bio cannot exceed 160 characters'),
  
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

/**
 * User ID validation
 */
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

module.exports = {
  updateProfileValidation,
  userIdValidation,
};