import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerValidation, loginValidation } from '../validation/auth.js';
import validator from 'validator';
import xss from 'xss';
import User from '../models/User.js';

const router = express.Router();

const setCookie = (res, token) => {
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name, role = 'customer' } = req.body;

    // Sanitize inputs
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedName = xss(name.trim());

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    setCookie(res, token);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Sanitize email
    const sanitizedEmail = validator.normalizeEmail(email);

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    setCookie(res, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user info (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;