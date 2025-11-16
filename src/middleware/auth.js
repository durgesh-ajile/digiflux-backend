import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const SECRET = process.env.JWT_SECRET;

export default async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    // payload contains { id, role } per your choice
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    // attach minimal user info to req (avoid passing password)
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}
