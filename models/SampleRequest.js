import mongoose from 'mongoose';

const sampleRequestSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    supplierName: {
      type: String,
      default: 'প্রস্তুতকারক',
    },
    supplierPhone: {
      type: String,
      default: '',
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: [true, 'Buyer phone number is required'],
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },
    sampleQuantity: {
      type: String,
      default: '১-২ কেজি টেস্ট নমুনা',
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'dispatched', 'delivered', 'rejected'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SampleRequest || mongoose.model('SampleRequest', sampleRequestSchema);
