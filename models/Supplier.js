import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const supplierSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,   // allows multiple null values
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Company Information
  companyName: {
    type: String,
    trim: true
  },
  tradeLicense: {
    type: String,
    trim: true
  },
  companyType: {
    type: String,
    enum: ['pvt_ltd', 'pub_ltd', 'partner', 'sole_prop', 'coop', 'other', 'private_limited', 'public_limited', 'partnership', 'sole_proprietorship', 'cooperative', ''],
    default: ''
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  employeeCount: {
    type: String,
    trim: true
  },
  
  // Address
  address: {
    type: String,
    trim: true
  },
  
  // Categories (stored as numeric IDs from hardcoded data)
  interestedCategories: [{
    type: String
  }],
  
  // Profile Image
  profileImage: {
    url: String,
    publicId: String
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true   // auto-approved; admin can revoke if needed
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Tokens
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Metadata
  lastLogin: Date
}, {
  timestamps: true
});

// Encrypt password before saving
supplierSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
supplierSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Comprehensive indexes for super-fast query performance
supplierSchema.index({ isApproved: 1, isActive: 1, createdAt: -1 }); // Active approved suppliers
supplierSchema.index({ isApproved: 1, isVerified: 1, isActive: 1 }); // Verified suppliers
supplierSchema.index({ interestedCategories: 1, isApproved: 1 }); // Category filter
supplierSchema.index({ companyName: 1 });
supplierSchema.index({ tradeLicense: 1 });

// Text search index for searchable fields
supplierSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  companyName: 'text',
  industry: 'text'
}, {
  weights: {
    companyName: 10,
    firstName: 5,
    lastName: 5,
    industry: 2
  }
});

// Get public profile
supplierSchema.methods.getPublicProfile = function() {
  const supplier = this.toObject();
  delete supplier.password;
  delete supplier.refreshToken;
  delete supplier.resetPasswordToken;
  delete supplier.resetPasswordExpire;
  return supplier;
};

if (process.env.NODE_ENV === 'development' && mongoose.models.Supplier) {
  delete mongoose.models.Supplier;
}

export default mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
