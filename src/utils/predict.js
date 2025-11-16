import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

/**
 * Predict next month expenditure as average of last 3 complete months totals.
 * Uses aggregation for efficiency (allowed for stats).
 *
 * Returns number (rounded to 2 decimals).
 */
export default async function predict(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid userId');

  const now = new Date();
  // create ranges for last 3 complete months: for i=1..3
  const months = [];
  for (let i = 1; i <= 3; i += 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    months.push({ start, end });
  }

  const results = [];
  for (const m of months) {
    const agg = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: m.start, $lte: m.end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const total = (agg[0] && agg[0].total) ? agg[0].total : 0;
    results.push(total);
  }

  const avg = results.reduce((s, v) => s + v, 0) / results.length;
  return Math.round(avg * 100) / 100;
}
