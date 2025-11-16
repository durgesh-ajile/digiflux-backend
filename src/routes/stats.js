import express from 'express';
import auth from '../middleware/auth.js';
import {
  top3Days,
  monthOverMonthChange,
  predictNextMonth
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/top-days', auth, top3Days);          // returns top 3 days by sum
router.get('/mom-change', auth, monthOverMonthChange); // previous and current month totals + percent change
router.get('/predict-next', auth, predictNextMonth); // predicted next month based on last 3 months

export default router;
