import Product from './models/Product.js';

export const seedData = async () => {
  try {
    // Check if we already have products
    const productCount = await Product.countDocuments();

    if (productCount > 0) {
      console.log('Products already exist, skipping seed...');
      return;
    }

    console.log('Creating sample products...');

    const sampleProducts = [
      { name: 'Laptop Computer', price: 999.99, category: 'Electronics', description: 'High-performance laptop for work and gaming' },
      { name: 'Wireless Headphones', price: 199.99, category: 'Electronics', description: 'Premium noise-cancelling headphones' },
      { name: 'Coffee Maker', price: 89.99, category: 'Home', description: 'Automatic drip coffee maker with timer' },
      { name: 'Running Shoes', price: 129.99, category: 'Sports', description: 'Comfortable running shoes for all terrains' },
      { name: 'Smartphone', price: 699.99, category: 'Electronics', description: 'Latest model smartphone with advanced camera' },
      { name: 'Yoga Mat', price: 39.99, category: 'Sports', description: 'Non-slip yoga mat for home workouts' },
      { name: 'Desk Chair', price: 249.99, category: 'Furniture', description: 'Ergonomic office chair with lumbar support' },
      { name: 'Water Bottle', price: 24.99, category: 'Sports', description: 'Insulated stainless steel water bottle' },
      { name: 'Cookbook', price: 29.99, category: 'Books', description: 'Collection of healthy recipes' },
      { name: 'Plant Pot', price: 19.99, category: 'Home', description: 'Ceramic plant pot for indoor plants' }
    ];

    await Product.insertMany(sampleProducts);
    console.log('✅ Created 10 sample products');

  } catch (error) {
    console.error('❌ Error creating seed data:', error);
  }
};