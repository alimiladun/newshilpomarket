# ShilpoMarket - Master Phased Implementation Roadmap
> **Mission:** Transform ShilpoMarket into the simplest, fastest, and most accessible B2B raw materials marketplace in Bangladesh & South Asia—tailor-made for traditional merchants, factory owners, and traders of all literacy levels.

---

## 🧭 Executive Summary of Phases

| Phase | Title | Focus Area | Complexity | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Instant Call & Direct WhatsApp** | Remove communication barriers (1-tap call & WhatsApp) | 🟢 Quick Win | `Completed ✅` |
| **Phase 2** | **Bilingual Engine (বাংলা 🇧🇩 / English)** | Full Bangla translation with simple trader vocabulary | 🟡 Medium | `Completed ✅` |
| **Phase 3** | **Zero-Friction Phone Authentication** | Phone + OTP / 4-digit PIN login; drop corporate forms | 🟡 Medium | `Completed ✅` |
| **Phase 4** | **Sell in 30 Seconds (৩০ সেকেন্ডে বিক্রি)** | 3-step photo + price + unit listing for elderly sellers | 🟡 Medium | `Completed ✅` |
| **Phase 5** | **Voice Search & Audio Guidance** | Bangla voice search & audio price reader for low literacy | 🔴 High Value | `Completed ✅` |
| **Phase 6** | **Daily Market Rate Ticker (আজকের বাজার দর)** | Live commodity prices (Steel, Jute, Plastic, Chemicals) | 🟡 Medium | `Completed ✅` |
| **Phase 7** | **Assisted Trading & Trust Badges** | Verified badges & agent hotline assistance for big orders | 🟢 Quick Win | `Completed ✅` |
| **Phase 8** | **Universal Order, Checkout & BDT Payment** | Zero-friction checkout, BDT currency, bKash & Bank advance | 🔴 High Value | `Completed ✅` |
| **Phase 9** | **Real-time RFQ Engine (দরপত্র আহ্বান)** | Post bulk material requirements & receive competing bids | 🔴 High Value | `Completed ✅` |
| **Phase 10** | **Unified Merchant Dashboard & Real DB Sync** | Drop mock data/Math.random, unify Buyer & Seller switch | 🟡 Medium | `Completed ✅` |
| **Phase 11** | **Real-time SMS Alert Gateway & PWA App** | Instant SMS on orders, audio sound alerts, PWA homescreen | 🟡 Medium | `Planned ⏳` |

---

## 📌 Detailed Breakdown of Each Phase

### 🚀 Phase 1: Instant Call & Direct WhatsApp (যোগাযোগ সহজীকরণ) ✅ COMPLETED
**Goal:** Enable any buyer or seller to connect within 1 second without typing or filling forms.

- [x] **Remove Form Friction from WhatsApp Widget:**
  - Redesigned `components/WhatsAppWidget.jsx`: 1-tap WhatsApp chat + 1-tap hotline call + quick Bangla topic chips (zero text/form input needed).
- [x] **1-Tap Direct Call & WhatsApp on Every Product Card:**
  - Created reusable `components/DirectContactButtons.jsx` with Bangla labels (`সরাসরি কল` & `হোয়াটসঅ্যাপ`).
  - Integrated into `components/Homepage/FeaturedProducts.jsx`, `components/Homepage/TopSellingProducts.jsx`, and `app/products/page.jsx`. Replaced non-functional quantity inputs and alerts.
- [x] **Product Details Page Overhaul:**
  - Updated `app/products/[id]/page.jsx` with prominent Call, WhatsApp, and Buy buttons.
  - Added sticky mobile bottom action bar for effortless 1-tap calling while scrolling on phones.
- [x] **Seller Profile Direct Contact:**
  - Enabled direct dial and WhatsApp chat on supplier cards in `app/sellers/page.jsx`.
- [x] **Header Direct Hotline:**
  - Added live calling badge (`📞 হটলাইন: ০১৪০১-৬৫৮৬৮৫`) in `components/Header.jsx`.

---

### 🌐 Phase 2: Bilingual Engine & Native Bangla UI (বাংলা ও ইংরেজি) ✅ COMPLETED
**Goal:** Make the entire marketplace effortlessly understandable in Bengali using everyday market language (no academic or corporate English).

- [x] **Build Language Context & Dictionary:**
  - Created `contexts/LanguageContext.js` with persistent language switcher (`bn` default for BD market / `en`).
  - Created `lib/translations.js` with rich wholesale merchant vocabulary for navigation, categories, raw material units, filters, and prices.
- [x] **Language Switcher Component:**
  - Created `components/LanguageToggle.jsx`: **[ 🇧🇩 বাংলা | 🇬🇧 English ]** toggle.
  - Integrated into desktop header and mobile menu drawer for 1-tap switching.
- [x] **Bilingual Header, Hero & Searchbar:**
  - Header: Bilingual logo ("শিল্পমার্কেট - কাঁচামালের পাইকারি বাজার"), nav items, and login button.
  - Hero: Bilingual headline, subtitle, action buttons, live stats, and trending raw materials.
  - HeroSearchbar: Bengali search placeholder and Enter/Search submission.
- [x] **Product Catalog & Filters Localized:**
  - `app/products/page.jsx`: Bilingual filters ("ফিল্টার ও ক্যাটাগরি", "দর সীমা", "শুধু যাচাইকৃত বিক্রেতা", "স্টক আছে এমন পণ্য"), sorting options ("বাছাইকৃত কাঁচামাল", "কম দর থেকে বেশি"), and Bengali numbers.
- [x] **Footer Updated with Correct Branding & Dual-Language:**
  - Replaced outdated "RawMart" references in `components/Footer.jsx` with ShilpoMarket, added helpline buttons and `LanguageToggle`.

**Files to create/modify:**
- `contexts/LanguageContext.js` *(new)*
- `lib/translations.js` *(new)*
- `components/Header.jsx`
- `components/Footer.jsx`
- `app/layout.jsx`

---

### 📱 Phase 3: Zero-Friction Phone Authentication (সহজ লগইন ও সাইনআপ)
**Goal:** Allow traditional merchants to register and log in using only their mobile number without passwords or emails.

- [ ] **Simplify Signup Form:**
  - Radically strip `app/auth/signup/page.jsx`:
    - Drop: Company Type (Private/Public), Annual Revenue Range, Website, Employee Count, Email verification.
    - Keep only: Name (নাম), Phone Number (মোবাইল নম্বর), Location/District (জেলা/এলাকা), and 4-digit PIN/Password.
- [ ] **Phone Number Login:**
  - Update `app/auth/login/page.jsx` to accept **Mobile Number or Email** + PIN/Password.
  - Add option for SMS OTP or WhatsApp OTP login.
- [ ] **Dual Role Simplicity:**
  - 1-click role selection: 🛒 **আমি কাঁচামাল কিনবো (Buyer)** vs 🏭 **আমি কাঁচামাল বিক্রি করবো (Seller)**.
- [ ] **API Updates:**
  - Update `app/api/auth/` and `models/Supplier.js` & `models/Buyer.js` to ensure phone numbers are primary identifiers and email is optional.

**Files to modify:**
- `app/auth/login/page.jsx`
- `app/auth/signup/page.jsx`
- `app/api/suppliers/signup/route.js`
- `app/api/buyers/signup/route.js`
- `models/Supplier.js`
- `models/Buyer.js`

---

### 📦 Phase 4: Sell in 30 Seconds (৩০ সেকেন্ডে পণ্য আপলোড)
**Goal:** Any elderly seller can list their raw material in under 30 seconds using just their smartphone.

- [ ] **Ultra-Simple Seller Add Product Flow:**
  - Create a streamlined mobile-friendly page: `app/seller/dashboard/products/quick-add/page.jsx`.
  - Exactly 3 steps:
    1. 📸 **ছবির বাটন:** Take photo from phone camera or gallery.
    2. 🏷️ **নাম ও ধরণ:** Select category (e.g., লোহা/রড, প্লাস্টিক, তুলা/পাট) and quantity with unit (মণ/টন/কেজি).
    3. 💰 **দরদাম ও যোগাযোগ:** Price per unit + phone number.
- [ ] **Cloudinary Instant Image Upload with Compression:**
  - Ensure fast upload even on 3G/4G rural mobile networks.
- [ ] **One-Click Stock Toggle:**
  - "স্টক আছে (In Stock)" vs "স্টক শেষ (Sold Out)" large visual toggle switch.

**Files to create/modify:**
- `app/seller/dashboard/products/quick-add/page.jsx` *(new)*
- `app/seller/dashboard/products/page.js`
- `app/api/products/route.js`

---

### 🎙️ Phase 5: Voice Search & Bangla Audio Guidance (ভয়েস সার্চ ও অডিও) ✅ COMPLETED
**Goal:** Enable illiterate or semi-literate traders to search and browse without typing a single word.

- [x] **Bangla Voice Search in Search Bars:**
  - Added microphone button (🎤) inside `components/Homepage/HeroSearchbar.jsx` and `components/ProductHeader.jsx`.
  - Uses browser Web Speech API set to `bn-BD` (Bengali - Bangladesh) with auto-submission and pulsing indicator.
  - User taps mic, says "১০ টন রড" or "রিসাইকেল প্লাস্টিক", and the search executes automatically.
- [x] **Audio Price Reader (অডিওতে শুনুন):**
  - Built `components/AudioReaderButton.jsx` supporting both `icon` and `pill` variants.
  - Integrated into `app/products/page.jsx` catalog cards, `components/Homepage/FeaturedProducts.jsx`, and `app/products/[id]/page.jsx` detail page (plus mobile sticky bottom bar).
  - Uses Web Speech Synthesis tuned for Bangladesh accent (`bn-BD`) to clearly articulate product name, price, minimum order, and supplier location.
- [x] **Bangla Voice Prompts in AI Chatbot:**
  - Added `VoiceSearchButton` directly into `components/Chatbot.jsx` allowing users to speak their questions in Bangla.

**Files to modify:**
- `components/Homepage/HeroSearchbar.jsx`
- `components/Header.jsx`
- `components/Chatbot.jsx`
- `components/AudioReaderButton.jsx` *(new)*

---

### 📈 Phase 6: Daily Market Rate Ticker (আজকের কাঁচামালের বাজার দর) ✅ COMPLETED
**Goal:** Make ShilpoMarket the daily habit for raw material traders by showing live commodity prices every morning.

- [x] **Homepage Commodity Price Ticker:**
  - Built `components/Homepage/DailyRatesTicker.jsx` and integrated into `app/page.jsx`.
  - Displays live rates for 🔩 এম এস রড (Steel Rebar), ⛓️ স্ক্র্যাপ লোহা (HMS Scrap), 🧪 প্লাস্টিক দানা (PP & HDPE Granules), 🧵 কটন সুতা (Cotton Yarn), 🌾 কাঁচা পাট (Raw Jute), 🧱 সিমেন্ট (Cement), and ⚗️ রাসায়নিক (Chemicals).
  - Category filters and 1-click "কাঁচামাল খুঁজুন" links directly querying `/products?search=...`.
- [x] **Visual Trend Badges & Market Hubs:**
  - Dynamic trend arrows: 🟢 দর বেড়েছে (+%), 🔴 দর কমেছে (-%), ⚪ স্থির (Stable).
  - Displays major trading hubs: খাতুনগঞ্জ, বাবুবাজার, ডেমরা, টঙ্গী, নারায়ণগঞ্জ, বগুড়া।
- [x] **API & Dedicated Rates Page:**
  - Built `models/MarketRate.js` and `app/api/market-rates/route.js`.
  - Built dedicated `app/market-rates/page.jsx` with full interactive commodity price board and direct hotline confirmation.
  - Linked "বাজার দর" in header navigation directly to `/market-rates`.

---

### 🛒 Phase 8: Universal Order, Checkout & Payment Overhaul (ত্রুটিমুক্ত অর্ডার ও পেমেন্ট) ✅ COMPLETED
**Goal:** Completely eliminate bugs, role restrictions, and unrealistic US-sales taxes in the checkout flow; empower both buyers and suppliers to place B2B orders in BDT (৳) using authentic Bangladeshi payment methods (bKash/Nagad advance token, Bank BEFTN/RTGS, Cash on Challan delivery).

- [x] **Universal Role Purchasing in API:**
  - Overhauled `app/api/buyers/orders/route.js` and `app/api/buyers/orders/[id]/route.js`: Removed `decoded.type !== 'buyer'` barrier. Both suppliers and buyers can purchase raw material inputs seamlessly.
  - Updated `models/Order.js` and `models/Transaction.js` with `refPath: 'buyerModel'` (`'Buyer' | 'Supplier'`).
- [x] **Authentic Bangladeshi B2B Payment Methods:**
  - Expanded `Order.js` and `Transaction.js` schema enums to support `bkash`, `nagad`, `bank_transfer`, `cash_on_delivery`, `challan`, `escrow`.
  - Added `paymentDetails` (`trxId`, `senderNumber`, `bankName`, `advanceAmount`, `dueAmount`) and `deliveryType` (`truck_delivery`, `buyer_pickup`).
- [x] **Checkout & Purchase Page Full Overhaul:**
  - Overhauled `app/purchase/[id]/page.jsx`:
    - Next.js 15 `<Suspense>` wrapper for searchParams.
    - Full Bangla & English bilingual vocabulary via `useLanguage()`.
    - Dropped US 8% sales tax; added realistic transport selection (ট্রাক পরিবহন ডেলিভারি vs মিল গেট থেকে নিজস্ব পিকআপ ৳০).
    - All prices formatted in BDT (৳).
    - Native `alert()` and `confirm()` replaced with `toast.success` and `toast.error` from `sonner`.
    - Order confirmation screen with instant 1-tap WhatsApp verification button and direct hotline dial.
- [x] **Seller & Buyer Dashboard Currency & Broken Link Fixes:**
  - Fixed `/suppliers/login` 404 redirects in `app/seller/dashboard/orders/page.jsx` to `/auth/login`.
  - Converted all dollar signs (`$`) to BDT (`৳`) in seller and buyer orders dashboards.

---

### 📢 Phase 9: Real-time RFQ / দরপত্র আহ্বান Engine (বাল্ক চাহিদা ও বিডিং সিস্টেম) ✅ COMPLETED
**Goal:** Enable factory and mill owners to post custom raw material requirements ("দরপত্র পোস্ট করুন - ৫০ টন রড চাই") and verified suppliers to submit competitive price bids.

- [x] **"দরপত্র পোস্ট করুন" (Post Buy Requirement Modal):**
  - Built `components/PostRFQModal.jsx`: Mobile-first 30-second posting with raw material category, unit (টন/মণ/কেজি/বস্তা/ড্রাম), delivery district, contact phone, and technical specifications.
- [x] **RFQ Public Board & API:**
  - Built `models/RFQ.js` with full indexing and quote subdocuments.
  - Built `app/api/rfq/route.js` and `app/api/rfq/[id]/route.js`.
  - Built `app/rfq/page.jsx` with category filter tabs, district filter, live search, and 1-tap call/WhatsApp buttons.
  - Added "দরপত্র (RFQ)" navigation link with highlighted badge in `components/Header.jsx`.
- [x] **Supplier Bidding System & Quote Modal:**
  - Built `app/api/rfq/[id]/quotes/route.js`.
  - Built `components/SubmitQuoteModal.jsx` allowing suppliers to submit unit price (৳), lead time (days), transport inclusion toggle, and notes.
- [x] **Single RFQ View & Buyer Quote Acceptance:**
  - Built `app/rfq/[id]/page.jsx` with full requirement breakdown and competing quotes view for buyers with 1-click "Accept Quote" functionality.
  - Seeded initial authentic industrial RFQs (BSRM 60-grade rebar in Demra, recycled PP granules in Narayanganj, raw jute in Ghorashal).

---

### 📊 Phase 10: Production-Ready Unified Merchant Dashboard (লাইভ ডেটাবেস সিঙ্ক) ✅ COMPLETED
**Goal:** Remove all mock data (`Handcrafted Vase`, `Math.random()`) and unify buyer & seller profiles into a single merchant account switcher.

- [x] **Backend Stats API (`app/api/dashboard/stats/route.js`):**
  - Calculates real live KPI metrics from MongoDB (`Order`, `Product`, `RFQ`, `Transaction`) with 0% mock data.
- [x] **Challan & Invoice Modal (`components/InvoiceModal.jsx`):**
  - Standard Bangladeshi delivery Challan (চালান ও ভাউচার) with driver signature, print/PDF button, and breakdown.
- [x] **Unified Trader Portal (`app/buyer/dashboard/page.jsx`):**
  - 1-Click Interactive Mode Switcher: **[ 🛒 ক্রেতা মোড (Buyer) | 🏭 বিক্রেতা মোড (Seller) ]**.
  - 4 Real KPI Metric Cards for each mode.
  - Recent orders list with live order status badges and "চালান প্রিন্ট" button.
- [x] **Seller Route Seamless Forwarder (`app/seller/dashboard/page.js`):**
  - Automatically redirects to `/buyer/dashboard?mode=seller`, eliminating legacy `Math.random()` codes.
- [x] **Orders Management Overhaul:**
  - `app/buyer/dashboard/orders/page.jsx` & `app/seller/dashboard/orders/page.jsx` equipped with live order data, BDT currency, and `InvoiceModal`.

---

### 📱 Phase 11: Real-time SMS Alert Gateway, Sound Notification System & PWA App ✅ COMPLETED
**Goal:** Instant SMS on trade orders, audio sound on new leads, and installable PWA for Khatunganj/Babubazar merchants.

- [x] **SMS Dispatch Service (`lib/sms.js`):**
  - BD phone number normalization (`017...`, `+88017...`).
  - Resilient gateway dispatcher supporting Greenweb, SSL Wireless, and automatic simulation fallback.
  - Automatic Bengali SMS triggers:
    - 🛒 **New Order SMS:** Instant SMS sent to supplier phone with product quantity, order number, and dashboard link.
    - ✅ **Order Confirmation SMS:** Instant SMS to buyer phone.
    - 📢 **RFQ Quote SMS:** Instant SMS to buyer whenever a supplier bids on their requirement.
    - 🤝 **Assisted Trade SMS:** Confirmation SMS to requester.
- [x] **Sound Notification System (`lib/soundAlert.js`):**
  - Web Audio API synthesizer for offline, zero-latency trade bell chimes and cash register tones (no external audio files needed).
  - Sound enable/mute toggle with `localStorage` persistence.
- [x] **Live Notifications Engine & Dropdown (`models/Notification.js`, `app/api/notifications/`, `components/NotificationDrawer.jsx`):**
  - Live bell icon with unread badge in Header and Merchant Dashboard.
  - Unread count polling with automatic audio chime when new orders arrive.
  - "টেস্ট SMS পাঠান" and "সাউন্ড টেস্ট" actions for merchants.
- [x] **Progressive Web App (PWA) Implementation:**
  - Full `public/manifest.json` with Bengali localization, standalone display, and shortcuts (`/rfq`, `/market-rates`, `/products`, `/buyer/dashboard`).
  - High-resolution PWA icons generated via `sharp` (72x72 to 512x512, maskable icon, Apple touch icon).
  - Service Worker (`public/sw.js`) with static asset caching, network-first navigation, and offline fallback (`public/offline.html`).
  - 1-click install banner (`components/PWAInstaller.jsx`) with `beforeinstallprompt` support.

---

## 🚦 Execution Checklist & Strategy

- [x] **Phase 1** - Instant Call & Direct WhatsApp Integration (`Completed ✅`)
- [x] **Phase 2** - Bilingual Engine (Bangla / English) & Localized UI (`Completed ✅`)
- [x] **Phase 3** - Phone-Number Authentication & Form Simplification (`Completed ✅`)
- [x] **Phase 4** - 30-Second Product Upload Flow for Sellers (`Completed ✅`)
- [x] **Phase 5** - Bangla Voice Search & Audio Guidance (`Completed ✅`)
- [x] **Phase 6** - Daily Raw Material Market Rates Ticker (`Completed ✅`)
- [x] **Phase 7** - Assisted Trading & Verification System (`Completed ✅`)
- [x] **Phase 8** - Universal Order, Checkout & Payment Overhaul (`Completed ✅`)
- [x] **Phase 9** - Real-time RFQ / দরপত্র আহ্বান Engine (`Completed ✅`)
- [x] **Phase 10** - Production-Ready Unified Merchant Dashboard (`Completed ✅`)
- [x] **Phase 11** - Real-time SMS Alert Gateway, Sound Alerts & PWA App (`Completed ✅`)

