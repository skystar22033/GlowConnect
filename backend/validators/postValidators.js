const { body, param } = require('express-validator');

/**
 * Post creation validation rules
 */
const postValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters')
    .notEmpty()
    .withMessage('Post content is required'),
];

/**
 * Comment validation rules
 */
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment content must be between 1 and 500 characters')
    .notEmpty()
    .withMessage('Comment content is required'),
];

/**
 * Post ID validation
 */
const postIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID format'),
];

/**
 * Comment ID validation
 */
const commentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID format'),
];

module.exports = {
  postValidation,
  commentValidation,
  postIdValidation,
  commentIdValidation,
};