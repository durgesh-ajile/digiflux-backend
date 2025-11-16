import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './config/db.js';

import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import statsRoutes from './routes/stats.js';
import categoryRoutes from './routes/category.js';
import { createAdmin } from './utils/scripts.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDb(); // connect to mongodb

// await createAdmin()


app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/stats', statsRoutes);
app.use('/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.send('Expense Tracker API is up');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
