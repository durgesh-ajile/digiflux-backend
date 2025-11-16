import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

/**
 * List expenses.
 * - Admin: can see all, or can pass ?userId= to filter
 * - User: only own expenses
 */
// GET /expenses
export async function getExpenses(req, res) {
  try {
    let query = {};

    // If normal user -> only own expenses
    if (req.user.role !== "admin") {
      query.user = req.user.id;
    }

    const list = await Expense.find(query)
      .populate("user", "name email")
      .populate("category", "name")
      .sort({ date: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Get expenses error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


/**
 * Add expense. body: { category, amount, date?, description? }
 */
export async function addExpense(req, res) {
  try {
    const { category, amount, date, description } = req.body;
    if (!category || !amount) return res.status(400).json({ message: 'Category and amount required' });

    // ensure category exists
    const catExists = await Category.findById(category);
    if (!catExists) return res.status(400).json({ message: 'Invalid category' });

    const exp = new Expense({
      user: req.user.id,
      category,
      amount,
      date: date ? new Date(date) : new Date(),
      description: description || ''
    });

    await exp.save();
    // populate category name for response
    await exp.populate('category', 'name');

    return res.status(201).json(exp);
  } catch (err) {
    console.error('Add expense err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update expense. Only owner or admin can update.
 * body may contain: { category, amount, date, description }
 */
export async function updateExpense(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const exp = await Expense.findById(id);
    if (!exp) return res.status(404).json({ message: 'Expense not found' });

    // permission check
    if (String(exp.user) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // manual field updates (no Object.assign)
    const { category, amount, date, description } = req.body;

    if (category) {
      const catExists = await Category.findById(category);
      if (!catExists) return res.status(400).json({ message: 'Invalid category' });
      exp.category = category;
    }

    if (amount !== undefined) {
      exp.amount = amount;
    }

    if (date) {
      exp.date = new Date(date);
    }

    if (description !== undefined) {
      exp.description = description;
    }

    await exp.save();
    await exp.populate('category', 'name');

    return res.json(exp);
  } catch (err) {
    console.error('Update expense err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete expense. Only owner or admin.
 */
export async function deleteExpense(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const exp = await Expense.findById(id);
    if (!exp) return res.status(404).json({ message: 'Expense not found' });

    // permission check
    if (String(exp.user) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Expense.deleteOne({ _id: id });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete expense err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}


