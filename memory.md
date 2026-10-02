# ShilpoMarket - Master Project Memory & Architecture Guide

> **CRITICAL INSTRUCTION FOR ALL AGENTS & DEVELOPERS:**
> Before proposing, designing, or coding any new feature, page, API, or component in this repository, **you MUST review this file.**
> Every decision must align with the target user persona, architectural principles, and simplicity rules outlined below.

---

## 1. Project Overview & Mission

- **Project Name:** ShilpoMarket (শিল্পমার্কেট)
- **Domain:** B2B Raw Materials Marketplace (Metals, Textiles/Jute, Chemicals, Plastics, Construction, Agriculture, Leather, Packaging).
- **Primary Market:** Bangladesh (Dhaka, Narayanganj, Chittagong/Khatunganj, Tongi, Bogura) & South Asia.
- **Currency:** Bangladeshi Taka (৳ / BDT).

---

## 2. The Core User Persona (NON-NEGOTIABLE DESIGN PILLAR)

> **Who is our real user?**
> The typical user is a 45–65+ year old traditional raw materials merchant, factory owner, or wholesale trader.
> - **Tech Literacy:** Low to zero. Rarely uses email or desktop computers.
> - **Language:** Speaks and reads Bengali (Bangla). Many struggle with English corporate jargon; some are semi-literate or illiterate.
> - **Daily Habits:** Heavy smartphone users of WhatsApp, imo, YouTube, and direct voice calls.
> - **How They Trade Currently:** Over phone calls, visiting physical wholesale markets (Khatunganj, Chawkbazar, Mitford, Babubazar), handwritten slips, and mutual trust.

### ⛔ Design Anti-Patterns (NEVER DO THESE):
1. **Never build multi-step, corporate English forms** (e.g., asking for "Annual Revenue Range", "Employee Count", "Company Website", "Corporate Email").
2. **Never hide primary actions behind nested submenus or small icons.**
3. **Never rely solely on English text** without Bengali labels, clear icons, or audio/visual assistance.
4. **Never require complex passwords or email verification links**—prefer mobile number OTP or direct 1-tap call/WhatsApp connections.
5. **Never make product pricing obscure or difficult to calculate**—always support familiar local units (Mon / মন, Ton / টন, Kg / কেজি, Bag / বস্তা, Foot / ফুট).

---

## 3. Technology Stack & Key Libraries

- **Framework:** Next.js (App Router, React 19)
- **Styling:** Tailwind CSS, Lucide React icons, Radix UI components
- **Database & ODM:** MongoDB Atlas with Mongoose (`mongoose`)
- **Authentication:** JWT tokens (`jsonwebtoken`), password hashing (`bcryptjs`), localStorage token management (`contexts/AuthContext.js`)
- **Media Storage:** Cloudinary (`cloudinary`)
- **AI Integration:** Google Gemini SDK (`@google/generative-ai`)
- **Notifications:** Sonner toasts (`sonner`)

---

## 4. Repository Structure & Key File Map

```
shilpomarket frontend/
├── app/
│   ├── api/                     # Next.js Serverless API endpoints
│   │   ├── auth/                # Auth verification
│   │   ├── suppliers/           # Supplier signup/login/profile
│   │   ├── buyers/              # Buyer signup/login/orders
│   │   ├── products/            # Product CRUD and listings
│   │   ├── transactions/        # Transaction & ledger endpoints
│   │   └── upload/              # Cloudinary media uploads
│   ├── auth/
│   │   ├── login/               # Sign in
│   │   └── signup/              # Registration
│   ├── buyer/dashboard/         # Buyer orders, transactions, wishlist
│   ├── seller/dashboard/        # Seller products, sales orders, transactions
│   ├── admin/                   # Admin management & platform commissions
│   ├── products/                # Product catalog & single product details
│   ├── purchase/                # Checkout and purchase order flow
│   ├── categories/              # Raw material category browse pages
│   └── page.jsx                 # Main homepage
├── components/
│   ├── Header.jsx               # Global navbar (responsive search, categories, profile)
│   ├── Footer.jsx               # Global footer
│   ├── WhatsAppWidget.jsx       # Direct WhatsApp quick contact
│   ├── Chatbot.jsx              # AI assistant (ShilpoBot via Gemini)
│   └── Homepage/                # Modular homepage blocks (Hero, Category, Products, etc.)
├── models/
│   ├── Supplier.js              # Supplier profile & credentials
│   ├── Buyer.js                 # Buyer profile & credentials
│   ├── Product.js               # Raw material listings (specifications, price, min order, unit)
│   ├── Order.js                 # Purchase orders
│   ├── Transaction.js           # Escrow / commissions (2%) / payments
│   └── Insight.js               # Market prices & trends
├── contexts/
│   └── AuthContext.js           # Global auth state & user session
├── lib/
│   ├── database.js              # Cached MongoDB connection
│   ├── cloudinary.js            # Image upload config
│   └── api.js                   # Client-side API route constants
└── memory.md                    # THIS FILE: Continuous memory & design rules
```

---

## 5. Standard Rules Before Adding Any New Feature

Whenever creating or modifying code:
1. **Bengali-First & Bilingual:** Ensure every label, button, and notice is easily understandable in Bengali alongside English.
2. **Visual Clues Over Long Text:** Use high-contrast colors (e.g. Green for Buy/Sell, WhatsApp green, clean badges) and obvious pictograms.
3. **One-Tap Contact:** Every product page must have a prominent **"সরাসরি কল করুন" (Call Now)** and **"হোয়াটসঅ্যাপে অর্ডার করুন" (Order via WhatsApp)** button.
4. **Simplified Forms:** Only ask for what is strictly needed (Product Name, Photo, Price per Unit, Minimum Quantity, Phone Number).
5. **Mobile Responsiveness:** 90%+ of merchants use mobile phones. All flows must be flawless on 360px–420px mobile screens.
6. **Data Integrity:** Keep MongoDB schemas lean, validate required fields, and prevent broken image links.

---

## 6. Project Roadmap & Implementation Status
All primary core phases are implemented and operational:
- [x] **Dual-Language Switcher (Bangla 🇧🇩 / English 🇬🇧)** throughout the entire marketplace (`contexts/LanguageContext.js`, `components/LanguageToggle.jsx`).
- [x] **Zero-Friction Authentication & Simplified Forms** (`app/auth/login`, `app/auth/signup`).
- [x] **Voice Search & Bangla Audio Guidance** (`components/Homepage/HeroSearchbar.jsx`, `components/AudioReaderButton.jsx`).
- [x] **Direct "Call Seller" & "WhatsApp Order"** prefilled buttons on every product card and detail page (`components/DirectContactButtons.jsx`).
- [x] **Daily Commodity Price Ticker** for steel, plastic, yarn, jute, chemicals (`components/Homepage/DailyRatesTicker.jsx`, `app/market-rates`).
- [x] **Universal B2B Checkout & Payment Overhaul** in BDT currency with bKash/Nagad/Bank/Challan (`app/purchase/[id]`).
- [x] **Real-time RFQ / দরপত্র আহ্বান Engine** with 30-second posting modal and competing bids (`models/RFQ.js`, `app/rfq`).
- [x] **Production-Ready Unified Merchant Dashboard** with 1-click mode switcher (Buyer ⇄ Seller) & 1-click printable Challan (`app/buyer/dashboard`).
- [x] **Real-Time SMS Alert Gateway, Sound Chimes & PWA App** (`lib/sms.js`, `lib/soundAlert.js`, `models/Notification.js`, `components/NotificationDrawer.jsx`, `public/manifest.json`, `public/sw.js`).
