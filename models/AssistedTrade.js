import mongoose from 'mongoose';

const assistedTradeSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    materialNeeded: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    approxQuantity: {
      type: String,
      required: [true, 'Approximate quantity is required'],
      default: '১০+ টন',
    },
    targetLocation: {
      type: String,
      default: 'ঢাকা / চট্টগ্রাম',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'agent-assigned', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.AssistedTrade || mongoose.model('AssistedTrade', assistedTradeSchema);
