const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { updateMe } = require('../controllers/userController');

const router = express.Router();
router.put('/me', authMiddleware, updateMe);
module.exports = router;
