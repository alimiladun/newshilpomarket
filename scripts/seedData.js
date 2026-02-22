const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Supplier Schema
const supplierSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  companyName: String,
  companyType: String,
  tradeLicense: String,
  address: String,
  city: String,
  country: String,
  zipCode: String,
  industry: String,
  website: String,
  interestedCategories: [Number],
  profileImage: {
    url: String,
    public_id: String
  },
  rating: Number,
  reviewCount: Number,
  isApproved: Boolean,
  isActive: Boolean,
  isVerified: Boolean,
  createdAt: Date
});

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  category: Number,
  categoryName: String,
  description: String,
  price: Number,
  unit: String,
  minOrder: Number,
  maxOrder: Number,
  inStock: Boolean,
  stockQuantity: Number,
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  images: [{
    url: String,
    public_id: String
  }],
  primaryImage: String,
  tags: [String],
  rating: Number,
  reviewCount: Number,
  viewCount: Number,
  orderCount: Number,
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt: Date
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Buyer Schema
const buyerSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  companyName: String,
  companyType: String,
  address: String,
  city: String,
  country: String,
  zipCode: String,
  industry: String,
  createdAt: Date
});

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionId: String,
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  type: String,
  amount: Number,
  platformCommission: Number,
  netAmount: Number,
  status: String,
  paymentMethod: String,
  description: String,
  metadata: {
    productName: String,
    quantity: Number
  },
  createdAt: Date
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Sample data
const sampleSuppliers = [
  {
    email: 'jute@example.com',
    password: 'password123',
    firstName: 'Kamal',
    lastName: 'Rahman',
    phone: '+880 1700-123456',
    companyName: 'Bengal Jute Industries',
    companyType: 'Manufacturer',
    tradeLicense: 'TL123456',
    address: '45 Motijheel C/A',
    city: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1000',
    industry: 'Jute & Textiles',
    website: 'https://bengaljute.com',
    interestedCategories: [1],
    profileImage: {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300',
      public_id: 'sample1'
    },
    rating: 4.8,
    reviewCount: 124,
    isApproved: true,
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-01-15')
  },
  {
    email: 'garments@example.com',
    password: 'password123',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    phone: '+880 1800-234567',
    companyName: 'Star Garments Ltd',
    companyType: 'Manufacturer',
    tradeLicense: 'TL234567',
    address: '78 Export Processing Zone',
    city: 'Chittagong',
    country: 'Bangladesh',
    zipCode: '4100',
    industry: 'RMG & Textiles',
    website: 'https://stargarments.com',
    interestedCategories: [1, 2],
    profileImage: {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
      public_id: 'sample2'
    },
    rating: 4.9,
    reviewCount: 256,
    isApproved: true,
    isActive: true,
    isVerified: true,
    createdAt: new Date('2022-06-20')
  },
  {
    email: 'leather@example.com',
    password: 'password123',
    firstName: 'Rahim',
    lastName: 'Mia',
    phone: '+880 1900-345678',
    companyName: 'Premium Leather Works',
    companyType: 'Manufacturer',
    tradeLicense: 'TL345678',
    address: '23 Hazaribagh',
    city: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1209',
    industry: 'Leather Products',
    website: 'https://premiumleather.com',
    interestedCategories: [2],
    profileImage: {
      url: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=300',
      public_id: 'sample3'
    },
    rating: 4.6,
    reviewCount: 89,
    isApproved: true,
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-03-10')
  },
  {
    email: 'ceramics@example.com',
    password: 'password123',
    firstName: 'Nasrin',
    lastName: 'Sultana',
    phone: '+880 1600-456789',
    companyName: 'Royal Ceramics',
    companyType: 'Manufacturer',
    tradeLicense: 'TL456789',
    address: '56 Industrial Area',
    city: 'Gazipur',
    country: 'Bangladesh',
    zipCode: '1700',
    industry: 'Ceramics & Pottery',
    website: 'https://royalceramics.com',
    interestedCategories: [6],
    profileImage: {
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      public_id: 'sample4'
    },
    rating: 4.7,
    reviewCount: 145,
    isApproved: true,
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-08-22')
  }
];

const sampleBuyers = [
  {
    email: 'buyer1@example.com',
    password: 'password123',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    phone: '+880 1500-111222',
    companyName: 'Construction Solutions Ltd',
    companyType: 'Buyer',
    address: '12 Tejgaon Industrial Area',
    city: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1215',
    industry: 'Construction',
    createdAt: new Date('2023-05-10')
  },
  {
    email: 'buyer2@example.com',
    password: 'password123',
    firstName: 'Rashida',
    lastName: 'Khatun',
    phone: '+880 1600-333444',
    companyName: 'Fashion Retail Group',
    companyType: 'Buyer',
    address: '45 Banani Commercial Area',
    city: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1213',
    industry: 'Retail',
    createdAt: new Date('2023-07-15')
  },
  {
    email: 'buyer3@example.com',
    password: 'password123',
    firstName: 'Karim',
    lastName: 'Uddin',
    phone: '+880 1700-555666',
    companyName: 'Home Decor Enterprises',
    companyType: 'Buyer',
    address: '78 Gulshan Avenue',
    city: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1212',
    industry: 'Home & Living',
    createdAt: new Date('2023-09-20')
  }
];

const getSampleProducts = (supplierIds) => [
  // Jute Products
  {
    name: 'Organic Jute Shopping Bags',
    slug: 'organic-jute-shopping-bags',
    category: 1,
    categoryName: 'Jute & Jute Products',
    description: 'Eco-friendly jute shopping bags with sturdy handles. Perfect for retail and promotional use. Customizable with your brand logo.',
    price: 250,
    unit: 'piece',
    minOrder: 100,
    maxOrder: 10000,
    inStock: true,
    stockQuantity: 5000,
    supplier: supplierIds[0],
    images: [
      { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', public_id: 'jute1' },
      { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500', public_id: 'jute2' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
    tags: ['jute', 'eco-friendly', 'bags', 'reusable'],
    rating: 4.8,
    reviewCount: 85,
    viewCount: 1250,
    orderCount: 320,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    name: 'Natural Jute Rope (50m Roll)',
    slug: 'natural-jute-rope-50m',
    category: 1,
    categoryName: 'Jute & Jute Products',
    description: 'High-quality natural jute rope. Ideal for crafts, gardening, and industrial use. Available in various thicknesses.',
    price: 450,
    unit: 'roll',
    minOrder: 50,
    maxOrder: 5000,
    inStock: true,
    stockQuantity: 2000,
    supplier: supplierIds[0],
    images: [
      { url: 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=500', public_id: 'rope1' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=500',
    tags: ['jute', 'rope', 'natural', 'craft'],
    rating: 4.6,
    reviewCount: 62,
    viewCount: 890,
    orderCount: 185,
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  // Garment Products
  {
    name: 'Premium Cotton T-Shirts (Bulk)',
    slug: 'premium-cotton-tshirts-bulk',
    category: 1,
    categoryName: 'Jute & Jute Products',
    description: '100% premium cotton t-shirts. Available in multiple colors and sizes. Perfect for retail and promotional use.',
    price: 350,
    unit: 'piece',
    minOrder: 500,
    maxOrder: 50000,
    inStock: true,
    stockQuantity: 25000,
    supplier: supplierIds[1],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', public_id: 'tshirt1' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', public_id: 'tshirt2' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    tags: ['garments', 'cotton', 't-shirt', 'clothing'],
    rating: 4.9,
    reviewCount: 234,
    viewCount: 3200,
    orderCount: 580,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-05')
  },
  {
    name: 'Formal Shirts - Export Quality',
    slug: 'formal-shirts-export-quality',
    category: 1,
    categoryName: 'Jute & Jute Products',
    description: 'Export quality formal shirts with excellent stitching. Available in various colors and patterns.',
    price: 650,
    unit: 'piece',
    minOrder: 200,
    maxOrder: 20000,
    inStock: true,
    stockQuantity: 15000,
    supplier: supplierIds[1],
    images: [
      { url: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=500', public_id: 'shirt1' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=500',
    tags: ['garments', 'formal', 'shirt', 'export'],
    rating: 4.7,
    reviewCount: 156,
    viewCount: 2100,
    orderCount: 340,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-12')
  },
  // Leather Products
  {
    name: 'Genuine Leather Wallets',
    slug: 'genuine-leather-wallets',
    category: 2,
    categoryName: 'Leather & Leather Goods',
    description: 'Handcrafted genuine leather wallets with multiple card slots. Available in black, brown, and tan.',
    price: 850,
    unit: 'piece',
    minOrder: 50,
    maxOrder: 5000,
    inStock: true,
    stockQuantity: 3000,
    supplier: supplierIds[2],
    images: [
      { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', public_id: 'wallet1' },
      { url: 'https://images.unsplash.com/photo-1613428792678-087d5d14238b?w=500', public_id: 'wallet2' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
    tags: ['leather', 'wallet', 'handcrafted', 'genuine'],
    rating: 4.8,
    reviewCount: 98,
    viewCount: 1560,
    orderCount: 245,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-18')
  },
  {
    name: 'Leather Office Bags',
    slug: 'leather-office-bags',
    category: 2,
    categoryName: 'Leather & Leather Goods',
    description: 'Professional leather office bags with laptop compartment. Durable and stylish design.',
    price: 3500,
    unit: 'piece',
    minOrder: 20,
    maxOrder: 1000,
    inStock: true,
    stockQuantity: 800,
    supplier: supplierIds[2],
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', public_id: 'bag1' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    tags: ['leather', 'bag', 'office', 'laptop'],
    rating: 4.9,
    reviewCount: 112,
    viewCount: 1890,
    orderCount: 178,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  // Ceramic Products
  {
    name: 'Ceramic Dinner Set (24 pieces)',
    slug: 'ceramic-dinner-set-24-pieces',
    category: 6,
    categoryName: 'Handicrafts',
    description: 'Elegant ceramic dinner set with beautiful patterns. Includes plates, bowls, and cups for 6 people.',
    price: 4500,
const getSampleTransactions = (buyerIds, supplierIds, productIds) => {
  const transactions = [];
  const statuses = ['completed', 'pending', 'processing'];
  const paymentMethods = ['bank_transfer', 'mobile_banking', 'cash_on_delivery', 'letter_of_credit'];
  
  let txnCounter = 1;

  // Create transactions for each buyer-seller-product combination
  // Buyer 1 transactions
  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[0],
    seller: supplierIds[0],
    product: productIds[0],
    type: 'payment',
    amount: 25000,
    platformCommission: 500,
    netAmount: 24500,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: 'Payment for 100 pieces of Organic Jute Shopping Bags',
    metadata: {
      productName: 'Organic Jute Shopping Bags',
      quantity: 100
    },
    createdAt: new Date('2024-01-20')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[0],
    seller: supplierIds[1],
    product: productIds[2],
    type: 'payment',
    amount: 175000,
    platformCommission: 3500,
    netAmount: 171500,
    status: 'completed',
    paymentMethod: 'letter_of_credit',
    description: 'Payment for 500 pieces of Premium Cotton T-Shirts',
    metadata: {
      productName: 'Premium Cotton T-Shirts',
      quantity: 500
    },
    createdAt: new Date('2024-01-22')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[0],
    seller: supplierIds[0],
    product: productIds[1],
    type: 'payment',
    amount: 22500,
    platformCommission: 450,
    netAmount: 22050,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    await Buyer.deleteMany({});
    await Transaction.deleteMany({});
    description: 'Payment for 50 rolls of Natural Jute Rope',
    metadata: {
      productName: 'Natural Jute Rope (50m Roll)',
      quantity: 50
    },
    createdAt: new Date('2024-01-28')
  });

  // Buyer 2 transactions
  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[1],
    seller: supplierIds[1],
    product: productIds[3],
    type: 'payment',
    amount: 13buyers with hashed passwords
    console.log('Inserting buyers...');
    const buyersWithHashedPasswords = sampleBuyers.map(buyer => ({
      ...buyer,
      password: hashedPassword
    }));
    const insertedBuyers = await Buyer.insertMany(buyersWithHashedPasswords);
    console.log(`Inserted ${insertedBuyers.length} buyers!`);

    // Get buyer IDs
    const buyerIds = insertedBuyers.map(b => b._id);

    // Insert products
    console.log('Inserting products...');
    const products = getSampleProducts(supplierIds);
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products!`);

    // Get product IDs
    const productIds = insertedProducts.map(p => p._id);

    // Insert transactions
    console.log('Inserting transactions...');
    const transactions = getSampleTransactions(buyerIds, supplierIds, productIds);
    const insertedTransactions = await Transaction.insertMany(transactions);
    console.log(`Inserted ${insertedTransactions.length} transaction
    description: 'Payment for 200 pieces of Formal Shirts',
    metadata: {
      productName: 'Formal Shirts - Export Quality',
      quantity: 200
    },
    createdAt: new Date('2024-01-18')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[1],
    seller: supplierIds[2],
    product: productIds[4],
    type: 'payment',
    amount: 42500,
    platformCommission: 850,
    netAmount: 41650,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: 'Payment for 50 pieces of Genuine Leather Wallets',
    metadata: {
      productName: 'Genuine Leather Wallets',
      quantity: 50
    },
    createdAt: new Date('2024-01-25')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[1],
    seller: supplierIds[1],
    product: productIds[2],
    type: 'payment',
    amount: 87500,
    platformCommission: 1750,
    netAmount: 85750,
    status: 'processing',
    paymentMethod: 'letter_of_credit',
    description: 'Payment for 250 pieces of Premium Cotton T-Shirts',
    metadata: {
      productName: 'Premium Cotton T-Shirts',
      quantity: 250
    },
    createdAt: new Date('2024-01-27')
  });

  // Buyer 3 transactions
  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[2],
    seller: supplierIds[3],
    product: productIds[6],
    type: 'payment',
    amount: 45000,
    platformCommission: 900,
    netAmount: 44100,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: 'Payment for 10 sets of Ceramic Dinner Set',
    metadata: {
      productName: 'Ceramic Dinner Set (24 pieces)',
      quantity: 10
    },
    createdAt: new Date('2024-01-15')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[2],
    seller: supplierIds[3],
    product: productIds[7],
    type: 'payment',
    amount: 24000,
    platformCommission: 480,
    netAmount: 23520,
    status: 'completed',
    paymentMethod: 'mobile_banking',
    description: 'Payment for 20 pieces of Decorative Ceramic Vases',
    metadata: {
      productName: 'Decorative Ceramic Vases',
      quantity: 20
    },
    createdAt: new Date('2024-01-23')
  });

  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[2],
    seller: supplierIds[2],
    product: productIds[5],
    type: 'payment',
    amount: 70000,
    platformCommission: 1400,
    netAmount: 68600,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    description: 'Payment for 20 pieces of Leather Office Bags',
    metadata: {
      productName: 'Leather Office Bags',
      quantity: 20
    },
    createdAt: new Date('2024-01-29')
  });

  // Add commission transactions for platform
  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[0],
    seller: supplierIds[0],
    product: productIds[0],
    type: 'commission',
    amount: 500,
    platformCommission: 500,
    netAmount: 0,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: 'Platform commission for transaction TXN000001',
    metadata: {
      productName: 'Organic Jute Shopping Bags',
      quantity: 100
    },
    createdAt: new Date('2024-01-20')
  });

  // Add a refund transaction
  transactions.push({
    transactionId: `TXN${String(txnCounter++).padStart(6, '0')}`,
    buyer: buyerIds[1],
    seller: supplierIds[2],
    product: productIds[4],
    type: 'refund',
    amount: 8500,
    platformCommission: 0,
    netAmount: 8500,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: 'Refund for 10 defective Genuine Leather Wallets',
    metadata: {
      productName: 'Genuine Leather Wallets',
      quantity: 10
    },
    createdAt: new Date('2024-01-26')
  });

  return transactions;
};

    unit: 'set',
    minOrder: 10,
    maxOrder: 500,
    inStock: true,
    stockQuantity: 300,
    supplier: supplierIds[3],
    images: [
      { url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500', public_id: 'ceramic1' },
      { url: 'https://images.unsplash.com/photo-1584990347449-65d9ea6a34dc?w=500', public_id: 'ceramic2' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500',
    tags: ['ceramic', 'dinner set', 'tableware', 'dishes'],
    rating: 4.7,
    reviewCount: 76,
    viewCount: 1120,
    orderCount: 145,
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-25')
  },
  {
    name: 'Decorative Ceramic Vases',
    slug: 'decorative-ceramic-vases',
    category: 6,
    categoryName: 'Handicrafts',
    description: 'Handmade decorative ceramic vases in various sizes. Perfect for home and office decoration.',
    price: 1200,
    unit: 'piece',
    minOrder: 20,
    maxOrder: 1000,
    inStock: true,
    stockQuantity: 600,
    supplier: supplierIds[3],
    images: [
      { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', public_id: 'vase1' }
    ],
    primaryImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500',
    tags: ['ceramic', 'vase', 'decorative', 'handmade'],
    rating: 4.6,
    reviewCount: 54,
    viewCount: 780,
    orderCount: 98,
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2024-01-28')
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared!');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert suppliers wiBuyers:');
    insertedBuyers.forEach(b => {
      console.log(`- ${b.companyName} (${b.email}) - ID: ${b._id}`);
    });
    console.log('\nSample Products:');
    insertedProducts.forEach(p => {
      console.log(`- ${p.name} - ID: ${p._id}`);
    });
    console.log('\nSample Transactions:');
    insertedTransactions.forEach(t => {
      console.log(`- ${t.transactionId}: ${t.description} - ৳${t.amount}`);
    });

    console.log('\nYou can now test:');
    console.log('- Products page: http://localhost:3000/products');
    console.log('- Product details: http://localhost:3000/products/' + insertedProducts[0]._id);
    console.log('- Sellers page: http://localhost:3000/sellers');
    console.log('- Seller details: http://localhost:3000/sellers/' + insertedSuppliers[0]._id);
    console.log('- Buyer transactions: Use buyer ID: ' + buyerIds[0]);
    console.log('- Seller transactions: Use seller ID: ' + supplierIds[0]
    const supplierIds = insertedSuppliers.map(s => s._id);

    // Insert products
    console.log('Inserting products...');
    const products = getSampleProducts(supplierIds);
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products!`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Suppliers:');
    insertedSuppliers.forEach(s => {
      console.log(`- ${s.companyName} (${s.email}) - ID: ${s._id}`);
    });
    console.log('\nSample Products:');
    insertedProducts.forEach(p => {
      console.log(`- ${p.name} - ID: ${p._id}`);
    });

    console.log('\nYou can now test:');
    console.log('- Products page: http://localhost:3000/products');
    console.log('- Product details: http://localhost:3000/products/' + insertedProducts[0]._id);
    console.log('- Sellers page: http://localhost:3000/sellers');
    console.log('- Seller details: http://localhost:3000/sellers/' + insertedSuppliers[0]._id);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

seedDatabase();
