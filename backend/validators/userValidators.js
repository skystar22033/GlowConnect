const { body } = require('express-validator');

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Full name must be under 60 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Bio cannot exceed 160 characters'),
  body('profileImage').optional().trim().isURL().withMessage('Profile image must be a valid URL'),
];

module.exports = { updateProfileValidation };
