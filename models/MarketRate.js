import mongoose from 'mongoose';

const marketRateSchema = new mongoose.Schema(
  {
    materialName: {
      type: String,
      required: [true, 'Material name in Bengali is required'],
      trim: true,
    },
    materialNameEn: {
      type: String,
      required: [true, 'Material name in English is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['steel', 'scrap', 'plastic', 'textile', 'jute', 'cement', 'chemical'],
      default: 'steel',
    },
    price: {
      type: Number,
      required: [true, 'Current price is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'কেজি',
    },
    unitEn: {
      type: String,
      default: 'KG',
    },
    prevPrice: {
      type: Number,
      required: [true, 'Previous price is required'],
    },
    change: {
      type: Number,
      default: 0,
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    marketHub: {
      type: String,
      required: [true, 'Market hub name is required'],
      default: 'ঢাকা (ডেমরা ও বাবুবাজার)',
    },
    marketHubEn: {
      type: String,
      default: 'Dhaka',
    },
    qualityGrade: {
      type: String,
      default: 'গ্রেড ৬০ / প্রিমিয়াম',
    },
    dateStr: {
      type: String,
      default: 'আজকের দর',
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MarketRate || mongoose.model('MarketRate', marketRateSchema);
