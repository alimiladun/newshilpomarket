const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Try to load dotenv if available, otherwise use hardcoded URI or env variable
try {
  require('dotenv').config();
} catch (e) {
  console.log('Note: dotenv not found, using environment variables directly');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abstalha192:abstalha192@cluster0.cjfdfme.mongodb.net/shilpomarket';

// Schemas
const supplierSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  companyName: String,
  isApproved: Boolean,
  isActive: Boolean,
  createdAt: Date
});

const buyerSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  companyName: String,
  createdAt: Date
});

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  unit: String,
  minOrder: Number,
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  isActive: Boolean,
  createdAt: Date
});

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productSnapshot: {
    name: String,
    price: Number,
    unit: String
  },
  quantity: Number,
  unitPrice: Number,
  subtotal: Number,
  shippingCost: Number,
  insuranceCost: Number,
  tax: Number,
  totalAmount: Number,
  deliveryAddress: String,
  billingAddress: String,
  paymentMethod: String,
  orderStatus: String,
  paymentStatus: String,
  createdAt: Date
});

const transactionSchema = new mongoose.Schema({
  transactionId: String,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
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
    orderNumber: String,
    productName: String,
    quantity: Number,
    unitPrice: Number,
    subtotal: Number,
    shippingCost: Number,
    insuranceCost: Number,
    tax: Number
  },
  createdAt: Date
});

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Sample data
const sampleSuppliers = [
  {
    email: 'supplier1@example.com',
    password: 'password123',
    firstName: 'Kamal',
    lastName: 'Rahman',
    phone: '+880 1700-123456',
    companyName: 'Bengal Jute Industries',
    isApproved: true,
    isActive: true,
    createdAt: new Date('2023-01-15')
  },
  {
    email: 'supplier2@example.com',
    password: 'password123',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    phone: '+880 1800-234567',
    companyName: 'Star Garments Ltd',
    isApproved: true,
    isActive: true,
    createdAt: new Date('2022-06-20')
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
    createdAt: new Date('2023-05-10')
  },
  {
    email: 'buyer2@example.com',
    password: 'password123',
    firstName: 'Rashida',
    lastName: 'Khatun',
    phone: '+880 1600-333444',
    companyName: 'Fashion Retail Group',
    createdAt: new Date('2023-07-15')
  }
];

const createOrdersAndTransactions = (buyers, suppliers, products) => {
  const orders = [];
  const transactions = [];

  // Order 1: Buyer 1 -> Supplier 1
  const order1 = {
    orderNumber: `ORD-${Date.now()}-000001`,
    buyer: buyers[0]._id,
    supplier: suppliers[0]._id,
    product: products[0]._id,
    productSnapshot: {
      name: products[0].name,
      price: products[0].price,
      unit: products[0].unit
    },
    quantity: 100,
    unitPrice: products[0].price,
    subtotal: 100 * products[0].price,
    shippingCost: 500,
    insuranceCost: 0,
    tax: (100 * products[0].price) * 0.08,
    totalAmount: 100 * products[0].price + 500 + (100 * products[0].price) * 0.08,
    deliveryAddress: '12 Tejgaon Industrial Area, Dhaka',
    billingAddress: '12 Tejgaon Industrial Area, Dhaka',
    paymentMethod: 'bank_transfer',
    orderStatus: 'confirmed',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-20')
  };
  orders.push(order1);

  // Transaction for Order 1
  const commission1 = order1.totalAmount * 0.02;
  transactions.push({
    transactionId: 'TXN000001',
    buyer: buyers[0]._id,
    seller: suppliers[0]._id,
    product: products[0]._id,
    type: 'payment',
    amount: order1.totalAmount,
    platformCommission: commission1,
    netAmount: order1.totalAmount - commission1,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: `Payment for Order ${order1.orderNumber} - ${products[0].name}`,
    metadata: {
      orderNumber: order1.orderNumber,
      productName: products[0].name,
      quantity: order1.quantity,
      unitPrice: order1.unitPrice,
      subtotal: order1.subtotal,
      shippingCost: order1.shippingCost,
      insuranceCost: order1.insuranceCost,
      tax: order1.tax
    },
    createdAt: new Date('2024-01-20')
  });

  // Order 2: Buyer 1 -> Supplier 2
  const order2 = {
    orderNumber: `ORD-${Date.now()}-000002`,
    buyer: buyers[0]._id,
    supplier: suppliers[1]._id,
    product: products[1]._id,
    productSnapshot: {
      name: products[1].name,
      price: products[1].price,
      unit: products[1].unit
    },
    quantity: 500,
    unitPrice: products[1].price,
    subtotal: 500 * products[1].price,
    shippingCost: 200,
    insuranceCost: (500 * products[1].price) * 0.02,
    tax: (500 * products[1].price) * 0.08,
    totalAmount: 500 * products[1].price + 200 + (500 * products[1].price) * 0.02 + (500 * products[1].price) * 0.08,
    deliveryAddress: '12 Tejgaon Industrial Area, Dhaka',
    billingAddress: '12 Tejgaon Industrial Area, Dhaka',
    paymentMethod: 'letter_of_credit',
    orderStatus: 'processing',
    paymentStatus: 'pending',
    createdAt: new Date('2024-01-25')
  };
  orders.push(order2);

  // Transaction for Order 2
  const commission2 = order2.totalAmount * 0.02;
  transactions.push({
    transactionId: 'TXN000002',
    buyer: buyers[0]._id,
    seller: suppliers[1]._id,
    product: products[1]._id,
    type: 'payment',
    amount: order2.totalAmount,
    platformCommission: commission2,
    netAmount: order2.totalAmount - commission2,
    status: 'pending',
    paymentMethod: 'letter_of_credit',
    description: `Payment for Order ${order2.orderNumber} - ${products[1].name}`,
    metadata: {
      orderNumber: order2.orderNumber,
      productName: products[1].name,
      quantity: order2.quantity,
      unitPrice: order2.unitPrice,
      subtotal: order2.subtotal,
      shippingCost: order2.shippingCost,
      insuranceCost: order2.insuranceCost,
      tax: order2.tax
    },
    createdAt: new Date('2024-01-25')
  });

  // Order 3: Buyer 2 -> Supplier 1
  const order3 = {
    orderNumber: `ORD-${Date.now()}-000003`,
    buyer: buyers[1]._id,
    supplier: suppliers[0]._id,
    product: products[0]._id,
    productSnapshot: {
      name: products[0].name,
      price: products[0].price,
      unit: products[0].unit
    },
    quantity: 200,
    unitPrice: products[0].price,
    subtotal: 200 * products[0].price,
    shippingCost: 500,
    insuranceCost: 0,
    tax: (200 * products[0].price) * 0.08,
    totalAmount: 200 * products[0].price + 500 + (200 * products[0].price) * 0.08,
    deliveryAddress: '45 Banani Commercial Area, Dhaka',
    billingAddress: '45 Banani Commercial Area, Dhaka',
    paymentMethod: 'bank_transfer',
    orderStatus: 'delivered',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-18')
  };
  orders.push(order3);

  // Transaction for Order 3
  const commission3 = order3.totalAmount * 0.02;
  transactions.push({
    transactionId: 'TXN000003',
    buyer: buyers[1]._id,
    seller: suppliers[0]._id,
    product: products[0]._id,
    type: 'payment',
    amount: order3.totalAmount,
    platformCommission: commission3,
    netAmount: order3.totalAmount - commission3,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    description: `Payment for Order ${order3.orderNumber} - ${products[0].name}`,
    metadata: {
      orderNumber: order3.orderNumber,
      productName: products[0].name,
      quantity: order3.quantity,
      unitPrice: order3.unitPrice,
      subtotal: order3.subtotal,
      shippingCost: order3.shippingCost,
      insuranceCost: order3.insuranceCost,
      tax: order3.tax
    },
    createdAt: new Date('2024-01-18')
  });

  return { orders, transactions };
};

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Supplier.deleteMany({});
    await Buyer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Existing data cleared!');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert suppliers
    console.log('Inserting suppliers...');
    const suppliersWithHashedPasswords = sampleSuppliers.map(s => ({
      ...s,
      password: hashedPassword
    }));
    const insertedSuppliers = await Supplier.insertMany(suppliersWithHashedPasswords);
    console.log(`Inserted ${insertedSuppliers.length} suppliers!`);

    // Insert buyers
    console.log('Inserting buyers...');
    const buyersWithHashedPasswords = sampleBuyers.map(b => ({
      ...b,
      password: hashedPassword
    }));
    const insertedBuyers = await Buyer.insertMany(buyersWithHashedPasswords);
    console.log(`Inserted ${insertedBuyers.length} buyers!`);

    // Insert products
    console.log('Inserting products...');
    const sampleProducts = [
      {
        name: 'Organic Jute Shopping Bags',
        slug: 'organic-jute-shopping-bags',
        price: 250,
        unit: 'piece',
        minOrder: 100,
        supplier: insertedSuppliers[0]._id,
        isActive: true,
        createdAt: new Date('2024-01-10')
      },
      {
        name: 'Premium Cotton T-Shirts',
        slug: 'premium-cotton-tshirts',
        price: 350,
        unit: 'piece',
        minOrder: 500,
        supplier: insertedSuppliers[1]._id,
        isActive: true,
        createdAt: new Date('2024-01-05')
      }
    ];
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products!`);

    // Create orders and transactions
    console.log('Creating orders and transactions...');
    const { orders, transactions } = createOrdersAndTransactions(
      insertedBuyers,
      insertedSuppliers,
      insertedProducts
    );

    const insertedOrders = await Order.insertMany(orders);
    console.log(`Inserted ${insertedOrders.length} orders!`);

    // Link transactions to orders
    for (let i = 0; i < transactions.length; i++) {
      transactions[i].order = insertedOrders[i]._id;
    }

    const insertedTransactions = await Transaction.insertMany(transactions);
    console.log(`Inserted ${insertedTransactions.length} transactions!`);

    console.log('\n✅ Database seeded successfully with Orders and Transactions!');
    console.log('\n📊 Summary:');
    console.log(`- ${insertedSuppliers.length} Suppliers`);
    console.log(`- ${insertedBuyers.length} Buyers`);
    console.log(`- ${insertedProducts.length} Products`);
    console.log(`- ${insertedOrders.length} Orders`);
    console.log(`- ${insertedTransactions.length} Transactions`);

    console.log('\n🔐 Login Credentials:');
    console.log('Buyer 1: buyer1@example.com / password123');
    console.log('Buyer 2: buyer2@example.com / password123');
    console.log('Seller 1: supplier1@example.com / password123');
    console.log('Seller 2: supplier2@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

seedDatabase();
