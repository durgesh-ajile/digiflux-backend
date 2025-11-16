import Expense from '../models/Expense.js';
import mongoose from 'mongoose';
import predict from '../utils/predict.js';

/**
 * Top 3 days by total expenditure for a user.
 * Admin can pass ?userId= to get for a specific user.
 *
 * Uses aggregation (allowed for stats).
 */
export async function top3Days(req, res) {
  try {
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const rows = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 3 }
    ]);

    return res.json(rows);
  } catch (err) {
    console.error('Top3 err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Month-over-month percentage change.
 * Returns { previous, current, percentChange }
 *
 * Uses aggregation to compute sums per month.
 */
export async function monthOverMonthChange(req, res) {
  try {
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // current month total
    const curAgg = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: currentMonthStart, $lte: now } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const cur = (curAgg[0] && curAgg[0].total) ? curAgg[0].total : 0;

    // prev month total
    const prevAgg = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const prev = (prevAgg[0] && prevAgg[0].total) ? prevAgg[0].total : 0;

    const percentChange = prev === 0 ? (cur === 0 ? 0 : 100) : Math.round(((cur - prev) / prev) * 10000) / 100;

    return res.json({ previous: prev, current: cur, percentChange });
  } catch (err) {
    console.error('MoM err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Predict next month based on average of last 3 complete months.
 * Uses the predict util which uses aggregation.
 */
export async function predictNextMonth(req, res) {
  try {
    const userId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const prediction = await predict(userId);
    return res.json({ predictedNextMonth: prediction });
  } catch (err) {
    console.error('Predict err:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
