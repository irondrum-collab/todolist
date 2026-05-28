const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getList, create, update, remove } = require('../controllers/categoryController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getList);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
