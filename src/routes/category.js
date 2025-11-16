import express from 'express';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import {
  addCategory,
  getCategories,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// only admin can add / delete categories
router.post('/', auth,  addCategory);
router.delete('/:id', auth, role('admin'), deleteCategory);

// both admin & users can view categories
router.get('/', auth, getCategories);

export default router;
