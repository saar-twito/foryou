import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed data
await connectDB();


// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});