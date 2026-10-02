/**
 * API configuration utility.
 *
 * All client-side fetches to Next.js API routes use RELATIVE paths so they
 * always hit the same origin — no port/host mismatch is possible.
 *
 * The full absolute URL is only kept for server-to-server calls (e.g. in
 * Next.js Server Components / Route Handlers that call their own API).
 */

// Relative base — works on any port for browser fetches
const REL = "";

// Absolute base — for server-side fetches only
export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  // ── Supplier ──────────────────────────────────────────────────────────────
  SUPPLIER_SIGNUP:          () => `${REL}/api/suppliers/signup`,
  SUPPLIER_LOGIN:           () => `${REL}/api/suppliers/login`,
  SUPPLIER_ME:              () => `${REL}/api/suppliers/me`,
  SUPPLIER_UPLOAD_IMAGE:    () => `${REL}/api/suppliers/upload-profile-image`,
  SUPPLIER_GET_IMAGE:       () => `${REL}/api/suppliers/profile-image`,
  SUPPLIER_CHANGE_PASSWORD: () => `${REL}/api/suppliers/change-password`,
  SUPPLIER_FORGOT_PASSWORD: () => `${REL}/api/suppliers/forgot-password`,
  SUPPLIER_RESET_PASSWORD:  () => `${REL}/api/suppliers/reset-password`,
  SUPPLIER_EDIT:       (id) => `${REL}/api/suppliers/${id}`,
  SUPPLIER_DELETE:     (id) => `${REL}/api/suppliers/${id}`,
  SUPPLIERS:                () => `${REL}/api/suppliers`,

  // ── Buyer ─────────────────────────────────────────────────────────────────
  BUYER_SIGNUP:          () => `${REL}/api/buyers/signup`,
  BUYER_LOGIN:           () => `${REL}/api/buyers/login`,
  BUYER_ME:              () => `${REL}/api/buyers/me`,
  BUYER_UPLOAD_IMAGE:    () => `${REL}/api/buyers/upload-profile-image`,
  BUYER_GET_IMAGE:       () => `${REL}/api/buyers/profile-image`,
  BUYER_CHANGE_PASSWORD: () => `${REL}/api/buyers/change-password`,
  BUYER_FORGOT_PASSWORD: () => `${REL}/api/buyers/forgot-password`,
  BUYER_RESET_PASSWORD:  () => `${REL}/api/buyers/reset-password`,
  BUYER_EDIT:       (id) => `${REL}/api/buyers/${id}`,
  BUYER_DELETE:     (id) => `${REL}/api/buyers/${id}`,
  BUYERS:                () => `${REL}/api/buyers`,

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS:           () => `${REL}/api/products`,
  PRODUCTS_CREATE:    () => `${REL}/api/products`,
  PRODUCTS_GET:  (id) => `${REL}/api/products/${id}`,
  PRODUCTS_UPDATE:(id) => `${REL}/api/products/${id}`,
  PRODUCTS_DELETE:(id) => `${REL}/api/products/${id}`,
  PRODUCTS_MY: (supplierId) => `${REL}/api/products?supplierId=${supplierId}`,
  PRODUCTS_FEATURED:  () => `${REL}/api/products?featured=true&limit=8`,
  PRODUCTS_TRENDING:  () => `${REL}/api/products?sort=-rating&limit=8`,
  PRODUCTS_SEARCH:    () => `${REL}/api/products`,

  // ── Upload ────────────────────────────────────────────────────────────────
  UPLOAD_FILE:  () => `${REL}/api/upload`,
  DELETE_FILE:  () => `${REL}/api/upload`,

  // ── Auth ──────────────────────────────────────────────────────────────────
  REFRESH_TOKEN: () => `${REL}/api/auth/refresh`,
  USER_PROFILE:  () => `${REL}/api/auth/profile`,

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES:            () => `${REL}/api/categories`,
  CATEGORIES_BY_ID: (id) => `${REL}/api/categories/${id}`,
  CATEGORIES_SEARCH:     () => `${REL}/api/categories/search`,
  CATEGORIES_CHILDREN:(id)=> `${REL}/api/categories/${id}/children`,
  CATEGORIES_TREE:       () => `${REL}/api/categories/tree`,
  CATEGORIES_ROOTS:      () => `${REL}/api/categories/roots`,
  CATEGORIES_CREATE:     () => `${REL}/api/categories`,
  CATEGORIES_EDIT:  (id) => `${REL}/api/categories/${id}`,
  CATEGORIES_DELETE:(id) => `${REL}/api/categories/${id}`,

  // ── Transactions ──────────────────────────────────────────────────────────
  TRANSACTIONS:           () => `${REL}/api/transactions`,
  TRANSACTIONS_GET:  (id) => `${REL}/api/transactions/${id}`,
};
