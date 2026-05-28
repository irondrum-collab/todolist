const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { create, getList, update, remove } = require('../controllers/todoController');

const router = express.Router();

router.use(authMiddleware);
router.post('/', create);
router.get('/', getList);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
