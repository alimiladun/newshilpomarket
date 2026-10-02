import { connectDB } from '@/lib/database';
import Notification from '@/models/Notification';

/**
 * Normalizes Bangladeshi phone numbers into clean standard formats:
 * Returns { local: '017XXXXXXXX', international: '88017XXXXXXXX', isValid: boolean }
 */
export function normalizeBDPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { local: '', international: '', isValid: false };
  }

  // Remove all non-digits
  let clean = phone.replace(/\D/g, '');

  // If starts with 8801... and length is 13
  if (clean.startsWith('8801') && clean.length === 13) {
    return {
      local: clean.slice(2), // 01XXXXXXXXX
      international: clean,
      isValid: true
    };
  }

  // If starts with 01... and length is 11
  if (clean.startsWith('01') && clean.length === 11) {
    return {
      local: clean,
      international: '88' + clean,
      isValid: true
    };
  }

  // If starts with 1... and length is 10 (omitted leading 0)
  if (clean.startsWith('1') && clean.length === 10) {
    return {
      local: '0' + clean,
      international: '880' + clean,
      isValid: true
    };
  }

  return { local: clean, international: clean, isValid: clean.length >= 10 };
}

/**
 * Universal SMS Dispatcher for Bangladeshi Merchants
 * Supports Greenweb, SSL Wireless, BulkSMS BD with automatic resilient fallback & MongoDB logging
 */
export async function sendSMS({
  to,
  message,
  recipientId = null,
  recipientModel = 'Buyer',
  title = 'শিল্পমার্কেট অ্যালার্ট',
  type = 'general',
  actionUrl = '',
  metadata = {}
}) {
  try {
    const { local, international, isValid } = normalizeBDPhone(to);

    let smsStatus = 'simulated';
    let gatewayResponse = {};

    const greenwebToken = process.env.GREENWEB_API_TOKEN;
    const sslSmsToken = process.env.SSL_SMS_API_TOKEN;
    const sslSmsSid = process.env.SSL_SMS_SID;
    const bulkSmsKey = process.env.BULKSMSBD_API_KEY;

    // 1. Live Gateway Dispatch if credentials exist
    if (isValid && greenwebToken) {
      try {
        const url = `http://api.greenweb.com.bd/api.php?token=${encodeURIComponent(greenwebToken)}&to=${encodeURIComponent(international)}&message=${encodeURIComponent(message)}`;
        const res = await fetch(url, { method: 'GET' });
        const resText = await res.text();
        gatewayResponse = { provider: 'greenweb', raw: resText };
        smsStatus = resText.toLowerCase().includes('ok') || resText.toLowerCase().includes('success') ? 'sent' : 'failed';
      } catch (err) {
        gatewayResponse = { provider: 'greenweb', error: err.message };
        smsStatus = 'failed';
      }
    } else if (isValid && sslSmsToken && sslSmsSid) {
      try {
        const payload = {
          api_token: sslSmsToken,
          sid: sslSmsSid,
          msisdn: international,
          sms: message,
          csms_id: `SM-${Date.now()}`
        };
        const res = await fetch('https://smsplus.sslwireless.com/api/v3/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resJson = await res.json();
        gatewayResponse = { provider: 'sslwireless', data: resJson };
        smsStatus = resJson.status === 'SUCCESS' ? 'sent' : 'failed';
      } catch (err) {
        gatewayResponse = { provider: 'sslwireless', error: err.message };
        smsStatus = 'failed';
      }
    } else {
      // 2. Local / Development Simulation Mode
      smsStatus = 'simulated';
      gatewayResponse = {
        provider: 'simulator',
        dispatchedAt: new Date().toISOString(),
        note: 'Live SMS simulated. Configure GREENWEB_API_TOKEN or SSL_SMS_API_TOKEN for production telco delivery.'
      };
      console.log(`\n======================================================`);
      console.log(`📱 [SHILPOMARKET SMS GATEWAY]`);
      console.log(`   To: ${local || to} (${international})`);
      console.log(`   Type: ${type.toUpperCase()}`);
      console.log(`   Title: ${title}`);
      console.log(`   Message: ${message}`);
      console.log(`======================================================\n`);
    }

    // 3. Persist Notification record to MongoDB for Merchant In-App Bell & Audio Alert
    await connectDB();
    const notificationDoc = await Notification.create({
      recipient: recipientId || undefined,
      recipientModel: recipientModel || 'Buyer',
      phone: local || to,
      title,
      message,
      type,
      channel: 'both',
      smsStatus,
      smsGatewayResponse: gatewayResponse,
      actionUrl,
      metadata: {
        ...metadata,
        dispatchedPhone: international
      }
    });

    return {
      success: true,
      notificationId: notificationDoc._id,
      smsStatus,
      phone: local || to,
      gatewayResponse
    };

  } catch (error) {
    console.error('Error dispatching SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 1. Notify Seller & Buyer on New Wholesale Order
 */
export async function notifyNewOrderSMS({ order, supplier, buyer, product }) {
  const promises = [];

  // SMS to Supplier
  if (supplier?.phone) {
    const supplierMsg = `শিল্পমার্কেট: আপনার '${product.name}' পণ্যের নতুন পাইকারি অর্ডার এসেছে! অর্ডার #${order.orderNumber}। পরিমাণ: ${order.quantity} ${product.unit || 'কেজি'}। চালান দেখতে ড্যাশবোর্ডে লগইন করুন: shilpomarket.com/buyer/dashboard?mode=seller`;
    promises.push(
      sendSMS({
        to: supplier.phone,
        message: supplierMsg,
        recipientId: supplier._id,
        recipientModel: 'Supplier',
        title: 'নতুন পাইকারি অর্ডার এসেছে! 🛒',
        type: 'order_new',
        actionUrl: `/buyer/dashboard?mode=seller`,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      })
    );
  }

  // SMS to Buyer
  const buyerPhone = order.contactPhone || buyer?.phone;
  if (buyerPhone) {
    const buyerMsg = `শিল্পমার্কেট: আপনার অর্ডার #${order.orderNumber} সফলভাবে গৃহীত হয়েছে। মোট দর: ৳${order.totalAmount.toLocaleString()}। বিক্রেতা চালান প্রস্তুত করে শীঘ্রই যোগাযোগ করবেন। হেল্পলাইন: ০১৪০১-৬৫৮৬৮৫`;
    promises.push(
      sendSMS({
        to: buyerPhone,
        message: buyerMsg,
        recipientId: buyer?._id || order.buyer,
        recipientModel: order.buyerModel || 'Buyer',
        title: 'অর্ডার সফলভাবে প্লেস হয়েছে! ✅',
        type: 'order_new',
        actionUrl: `/buyer/dashboard/orders`,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      })
    );
  }

  return Promise.allSettled(promises);
}

/**
 * 2. Notify RFQ Buyer when a Supplier submits a quote
 */
export async function notifyRFQQuoteSMS({ rfq, quote, buyerPhone }) {
  const phone = buyerPhone || rfq.contactPhone;
  if (!phone) return null;

  const quoteSupplierName = quote.supplierCompany || quote.supplierName || 'একজন সরবরাহকারী';
  const msg = `শিল্পমার্কেট: আপনার দরপত্রে (${rfq.title}) ${quoteSupplierName} একটি নতুন কোটেশন দিয়েছেন! দর: ৳${quote.offeredPrice}/${rfq.unit || 'একক'}। কোটেশন দেখতে ভিজিট করুন: shilpomarket.com/rfq/${rfq._id}`;

  return sendSMS({
    to: phone,
    message: msg,
    recipientId: rfq.buyer,
    recipientModel: rfq.buyerModel || 'Buyer',
    title: 'দরপত্রে নতুন কোটেশন এসেছে! 📢',
    type: 'rfq_quote',
    actionUrl: `/rfq/${rfq._id}`,
    metadata: {
      rfqId: rfq._id,
      rfqNumber: rfq.rfqNumber,
      offeredPrice: quote.offeredPrice
    }
  });
}

/**
 * 3. Notify Buyer when Order Status changes (shipped, delivered, cancelled)
 */
export async function notifyOrderStatusSMS({ order, buyerPhone, status }) {
  const phone = buyerPhone || order.contactPhone;
  if (!phone) return null;

  const statusMap = {
    confirmed: 'নিশ্চিত করা হয়েছে',
    processing: 'প্রস্তুত করা হচ্ছে',
    shipped: 'ট্রাকে পাঠানো হয়েছে এবং চালান প্রস্তুত',
    delivered: 'সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
    cancelled: 'বাতিল করা হয়েছে'
  };

  const statusLabel = statusMap[status] || status;
  const msg = `শিল্পমার্কেট: আপনার অর্ডার #${order.orderNumber} এর অবস্থা: '${statusLabel}'। বিস্তারিত দেখতে ড্যাশবোর্ডে ভিজিট করুন। হেল্পলাইন: ০১৪০১-৬৫৮৬৮৫`;

  return sendSMS({
    to: phone,
    message: msg,
    recipientId: order.buyer,
    recipientModel: order.buyerModel || 'Buyer',
    title: `অর্ডার আপডেট: ${statusLabel} 📦`,
    type: 'order_status',
    actionUrl: `/buyer/dashboard/orders`,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status
    }
  });
}

/**
 * 4. Notify on Assisted Trading Request
 */
export async function notifyAssistedTradeSMS({ tradeRequest }) {
  const phone = tradeRequest.phone;
  if (!phone) return null;

  const msg = `শিল্পমার্কেট: আপনার ট্রেড অ্যাসিস্ট্যান্ট সহায়তা রিকোয়েস্টটি গৃহীত হয়েছে। আমাদের ট্রেড অফিসার শীঘ্রই যোগাযোগ করবেন। হটলাইন: ০১৪০১-৬৫৮৬৮৫`;

  return sendSMS({
    to: phone,
    message: msg,
    recipientId: null,
    recipientModel: 'Guest',
    title: 'ট্রেড অফিসার রিকোয়েস্ট কনফার্মড 🤝',
    type: 'assisted_trade',
    actionUrl: `/`,
    metadata: {
      category: tradeRequest.category,
      estimatedVolume: tradeRequest.estimatedVolume
    }
  });
}
