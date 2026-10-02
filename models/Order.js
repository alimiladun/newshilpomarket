import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'buyerModel',
    required: true
  },
  buyerModel: {
    type: String,
    enum: ['Buyer', 'Supplier'],
    default: 'Buyer'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Product details snapshot (in case product changes later)
  productSnapshot: {
    name: String,
    price: Number,
    unit: String,
    images: [String],
    category: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['truck_delivery', 'buyer_pickup'],
    default: 'truck_delivery'
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  insuranceCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Contact & Shipping Information
  contactPhone: {
    type: String,
    default: ''
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  billingAddress: {
    type: String,
    required: true
  },
  urgentDelivery: {
    type: Boolean,
    default: false
  },
  insurance: {
    type: Boolean,
    default: false
  },
  // Payment Information
  paymentMethod: {
    type: String,
    enum: [
      'bank_transfer',
      'bkash',
      'nagad',
      'cash_on_delivery',
      'challan',
      'letter_of_credit',
      'trade_finance',
      'escrow'
    ],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    trxId: { type: String, default: '' },
    senderNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    depositSlipUrl: { type: String, default: '' },
    advanceAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 }
  },
  // Order Status
  orderStatus: {
    type: String,
    enum: ['pending', 'quote_sent', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'rejected'],
    default: 'pending'
  },
  // Special Requirements
  specialRequirements: {
    type: String,
    default: ''
  },
  // Quote Information
  quoteDetails: {
    quoteSent: {
      type: Boolean,
      default: false
    },
    quoteSentAt: Date,
    quoteAmount: Number,
    quoteValidUntil: Date,
    quoteNotes: String
  },
  // Tracking
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  // Notes and Communication
  buyerNotes: String,
  supplierNotes: String,
  adminNotes: String,
  // Timestamps
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  // Ratings and Reviews
  buyerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  buyerReview: String,
  supplierRating: {
    type: Number,
    min: 1,
    max: 5
  },
  supplierReview: String
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ supplier: 1, createdAt: -1 });
orderSchema.index({ product: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
