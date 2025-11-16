import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const expenseSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, default: '' }
}, { timestamps: true });

export default model('Expense', expenseSchema);
