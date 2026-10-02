import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: false
  },
  recipientModel: {
    type: String,
    enum: ['Buyer', 'Supplier', 'Admin', 'Guest'],
    default: 'Buyer'
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_new',        // New purchase order received
      'order_status',     // Order status updated (confirmed, shipped, delivered)
      'rfq_quote',        // New supplier quote submitted on RFQ
      'rfq_accepted',     // Buyer accepted a quote
      'assisted_trade',   // Assisted trading consultation booked
      'price_alert',      // Raw material price fluctuation alert
      'general'           // General platform message
    ],
    default: 'general'
  },
  channel: {
    type: String,
    enum: ['sms', 'in_app', 'both'],
    default: 'both'
  },
  smsStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'simulated'],
    default: 'simulated'
  },
  smsGatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ phone: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
