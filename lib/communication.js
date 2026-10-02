/**
 * ShilpoMarket Communication Utility
 * Facilitates 1-tap Direct Calling and Instant WhatsApp Messaging
 * Tailored for low-tech and elderly traders in Bangladesh & South Asia.
 */

export const MARKETPLACE_HOTLINE = "+8801401658685";
export const MARKETPLACE_HOTLINE_DISPLAY = "01401-658685";
export const MARKETPLACE_WHATSAPP = "8801401658685";

/**
 * Clean phone number for tel: or wa.me/ format
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return MARKETPLACE_WHATSAPP;
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  // If local BD format 01XXXXXXXXX, prepend 88
  if (cleaned.startsWith("01")) {
    cleaned = "88" + cleaned;
  }
  return cleaned;
}

/**
 * Generate a pre-filled WhatsApp message for a product or general inquiry
 */
export function generateWhatsAppMessage({
  productName,
  price,
  unit = "ইউনিট",
  supplierName,
  customMessage,
}) {
  if (customMessage) {
    return customMessage;
  }

  if (productName) {
    let msg = `আসসালামু আলাইকুম। আমি ShilpoMarket এ আপনার পণ্যটি দেখেছি:\n`;
    msg += `📦 পণ্য: *${productName}*\n`;
    if (price) {
      msg += `💰 মূল্য: *৳${price}${unit ? ` / ${unit}` : ""}*\n`;
    }
    if (supplierName) {
      msg += `🏭 বিক্রেতা: ${supplierName}\n`;
    }
    msg += `\nআমি এই কাঁচামালের বিস্তারিত ও অর্ডার সম্পর্কে জানতে চাই। ধন্যবাদ।`;
    return msg;
  }

  return `আসসালামু আলাইকুম। আমি ShilpoMarket থেকে কাঁচামাল কেনা/বেচা সম্পর্কে সরাসরি কথা বলতে চাই।`;
}

/**
 * Get WhatsApp URL
 */
export function getWhatsAppUrl({ phone, productName, price, unit, supplierName, customMessage }) {
  const targetPhone = cleanPhoneNumber(phone || MARKETPLACE_HOTLINE);
  const text = generateWhatsAppMessage({ productName, price, unit, supplierName, customMessage });
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Get Direct Call URL
 */
export function getDirectCallUrl(phone) {
  const cleaned = phone ? phone.replace(/[^0-9+]/g, "") : MARKETPLACE_HOTLINE;
  return `tel:${cleaned}`;
}
