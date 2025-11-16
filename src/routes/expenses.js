import express from 'express';
import auth from '../middleware/auth.js';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenses
} from '../controllers/expenseController.js';

const router = express.Router();

// all routes except register/login require auth
router.get('/', auth, getExpenses);   // list (admin sees all or filtered by userId query)
router.post('/', auth, addExpense);    // add expense
router.put('/:id', auth, updateExpense); // update expense
router.delete('/:id', auth, deleteExpense); // delete expense

export default router;
