const express = require('express');
const router = express.Router();
const { register, login, verify, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../validators/authValidators');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/verify', protect, verify);
router.get('/me', protect, getMe);

module.exports = router;
