import express from 'express';
import xss from 'xss';
import Product from '../models/Product.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();


// GET /api/products - Paginated list with optional search (PUBLIC)
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = queryValidation(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { page, limit, search } = value;
    const skip = (page - 1) * limit;

    // Sanitize search term
    const sanitizedSearch = search ? xss(search.trim()) : '';

    // Build search query
    const searchQuery = sanitizedSearch ? {
      name: { $regex: sanitizedSearch, $options: 'i' }
    } : {};

    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get specific product (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const productId = xss(req.params.id.trim());

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product (ADMIN ONLY)
router.post('/', adminOnly, async (req, res) => {
  try {
    // Validate input
    const { error } = productValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, price, category, description } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      name: xss(name.trim()),
      price: parseFloat(price),
      category: xss(category.trim()),
      description: xss(description.trim())
    };

    const product = new Product(sanitizedData);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update existing product (ADMIN ONLY)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    // Validate input
    const { error } = productValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productId = xss(req.params.id.trim());
    const { name, price, category, description } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      name: xss(name.trim()),
      price: parseFloat(price),
      category: xss(category.trim()),
      description: xss(description.trim())
    };

    const product = await Product.findByIdAndUpdate(
      productId,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (ADMIN ONLY)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const productId = xss(req.params.id.trim());

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;