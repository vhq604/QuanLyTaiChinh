const express = require('express');
const router = express.Router();
const CategoriesController = require('../controllers/CategoriesController.js');
const auth = require('../middleware/auth.js');

// All category routes require authentication
router.use(auth);

router.get('/', CategoriesController.getCategories);
router.get('/:id', CategoriesController.getCategoryById);
router.post('/', CategoriesController.createCategory);
router.put('/:id', CategoriesController.updateCategory);
router.delete('/:id', CategoriesController.deleteCategory);

module.exports = router;
