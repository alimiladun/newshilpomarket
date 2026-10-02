import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  supplierCompany: {
    type: String,
    default: ''
  },
  supplierPhone: {
    type: String,
    required: true
  },
  offeredPrice: {
    type: Number,
    required: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  deliveryDays: {
    type: Number,
    default: 2
  },
  transportIncluded: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'RFQ title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    default: 'টন'
  },
  targetPrice: {
    type: Number,
    default: 0
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
  buyerName: {
    type: String,
    required: true
  },
  buyerCompany: {
    type: String,
    default: ''
  },
  buyerPhone: {
    type: String,
    required: true
  },
  deliveryDistrict: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  deadlineDays: {
    type: Number,
    default: 7
  },
  expiresAt: {
    type: Date
  },
  urgency: {
    type: String,
    enum: ['standard', 'urgent', 'flexible'],
    default: 'standard'
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'awarded', 'closed', 'expired'],
    default: 'open'
  },
  quotes: [quoteSchema],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

rfqSchema.index({ status: 1, createdAt: -1 });
rfqSchema.index({ category: 1, status: 1 });
rfqSchema.index({ deliveryDistrict: 1 });
rfqSchema.index({ buyer: 1 });

const RFQ = mongoose.models.RFQ || mongoose.model('RFQ', rfqSchema);

export default RFQ;
