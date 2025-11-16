import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// register: { name, email, password }
router.post('/register', register);

// login: { email, password }
router.post('/login', login);

export default router;
