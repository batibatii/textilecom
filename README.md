# TextileCom - Modern E-Commerce Platform

> A full-stack e-commerce application built with Next.js 15, React 19, TypeScript, Firebase, and Stripe, following production best practices.

![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-FFCA28?logo=firebase&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-19.3.0-008CDD?logo=stripe&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.1.12-3E67B1?logo=zod&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.65-EC5990?logo=reacthookform&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-Components-161618?logo=radix-ui&logoColor=white)
[![CI Pipeline](https://github.com/batibatii/textilecom/actions/workflows/ci.yml/badge.svg)](https://github.com/batibatii/textilecom/actions/workflows/ci.yml)
[![Security & Code Quality](https://github.com/batibatii/textilecom/actions/workflows/security.yml/badge.svg)](https://github.com/batibatii/textilecom/actions/workflows/security.yml)
![Deployed on](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

**[Live Demo](https://textilecom.vercel.app/) | [Video Walkthrough (Desktop)](https://www.youtube.com/watch?v=MZkeSVyoWs8) | [Architecture Docs](./ARCHITECTURE.md) | [Backend Microservice](https://github.com/batibatii/textilecom-webhook-receiver)**

### Desktop View

![TextileCom Homepage - Desktop](document-media/hero.png)

### Mobile View

<img src="document-media/hero-mobile.jpg" alt="TextileCom Homepage - Mobile" height="400">

---

## 🎯 Overview

**TextileCom** is a feature-complete e-commerce platform for clothing and apparel that demonstrates modern full-stack development with type-safe architecture, seamless payment processing, and production-grade performance.

This project showcases proficiency in:

- 🏗️ **Scalable Architecture** - Next.js 15 App Router with Server Components and Server Actions
- 💳 **Payment Integration** - Stripe Checkout with webhook handling
- 🔐 **Authentication & Authorization** - Firebase Auth with role-based access control
- ♿ **Accessibility-First Development** - WCAG 2.1 AA compliant with Radix UI primitives
- ⚡ **Performance Optimization** - Infinite scroll, image optimization, caching strategies
- 🧪 **Production-Ready Code** - TypeScript, Zod validation, Jest + Playwright testing

---

## ✨ Features

### 🛍️ Customer Experience

![Product Browsing Interface](document-media/product-browsing.gif)

#### **Product Discovery**

- **Infinite Scroll** with lazy loading and deduplication logic
- **Advanced Filtering** - Filter by brand, category, and gender with live updates
- **Real-time Search** - Debounced search across product title, brand, and category
- **Multiple Sort Options** - Sort by newest, price (ascending/descending), and popularity
- **Image Carousels** - Browse multiple product images with Embla Carousel

#### **Shopping Cart**

![Shopping Cart Flow](document-media/shopping-cart.gif)

- **Persistent Cart** - Syncs to Firestore when logged in, retries with intelligent timing
- **Size Variants** - Support for S, M, L, XXL sizing with category-based logic
- **Quantity Management** - Increase/decrease quantities with stock validation
- **Real-time Calculations** - Automatic subtotal, tax, and total calculations
- **Discount Support** - Per-product discount rates with visual indicators

#### **Checkout & Payment**

![Checkout and Payment Flow](document-media/checkout-and-payment.gif)

- **Stripe Checkout Integration** - Secure, hosted payment flow
- **Address Validation** - Required shipping address before checkout
- **Multi-Currency Support** - USD, EUR, TRY pricing
- **Tax Calculation** - Per-product tax rates with accurate totals
- **Order Confirmation** - Email notifications and order status tracking

#### **User Profile**

![User Profile Features](document-media/user-profile.gif)

- **Authentication** - Email/password and Google OAuth sign-in
- **Address Management** - Save shipping and billing addresses
- **Order History** - View all past orders with detailed breakdowns
- **Favorites/Wishlist** - Save products for later with persistent storage
- **Account Management** - Update profile, change password, delete account

---

### 🎛️ Admin Dashboard

#### **Product Management**

![Product Management](document-media/product-management.gif)

- **Full CRUD Operations** - Create, read, update, delete products
- **Image Upload** - Bulk upload to Vercel Blob storage with CDN integration
- **Approval Workflow** - Draft products require admin approval before going live
- **Stock Management** - Track inventory levels with low-stock indicators
- **Rich Product Data** - Title, description, brand, serial number, pricing, tax rate, category, gender

#### **Order Management**

![Order Management](document-media/order-management.gif)

- **Orders Dashboard** - Table view with search, filter, and pagination
- **Order Details** - Full customer info, line items, totals, tax breakdowns
- **CSV Export** - Export order data for accounting and analytics
- **Status Tracking** - Monitor order fulfillment progress

#### **User Management**

![User Management](document-media/user-management.gif)

- **User Directory** - View all registered users with creation dates
- **Role Assignment** - Grant customer, admin, or superAdmin privileges
- **Activity Tracking** - Monitor last login timestamps
- **Access Control** - Role-based permissions throughout the application

---

## 🛠️ Tech Stack

### **Frontend**

- **[Next.js 15.5.7](https://nextjs.org)** - React framework with App Router
- **[React 19.1.0](https://react.dev)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** + **[Radix UI](https://www.radix-ui.com)** - Accessible component library
- **[React Hook Form 7.65](https://react-hook-form.com)** - Performant form management
- **[Zod 4.1.12](https://zod.dev)** - TypeScript-first schema validation
- **[Lucide React](https://lucide.dev)** - Modern icon library
- **[Embla Carousel 8.6](https://www.embla-carousel.com)** - Touch-enabled carousels

### **Backend & Database**

- **Next.js Server Actions** - Type-safe server mutations (27+ actions)
- **[Firebase 12.4.0](https://firebase.google.com)** - Authentication and Firestore database
- **[Firebase Admin SDK 13.6](https://firebase.google.com/docs/admin/setup)** - Server-side operations
- **[Stripe 19.3.0](https://stripe.com)** - Payment processing
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - Image storage and CDN

### **Development & Testing**

- **[ESLint 9](https://eslint.org)** - Code linting
- **[Jest 30](https://jestjs.io)** - Unit testing framework
- **[Playwright 1.57](https://playwright.dev)** - End-to-end testing
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline automation
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for Next.js

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Firebase project ([Create one](https://console.firebase.google.com))
- Stripe account ([Sign up](https://dashboard.stripe.com/register))
- Vercel account for Blob storage ([Sign up](https://vercel.com/signup))

### **Installation**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd textilecom
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK (for server-side operations)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=vercel_blob_...

   # Application URL (for redirects)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Firebase**

   - Create a Firestore database
   - Enable Authentication (Email/Password and Google providers)
   - Create the following Firestore collections:
     - `users` - User profiles and preferences
     - `products` - Product catalog
     - `orders` - Order history
     - `cart` - Shopping cart data

5. **Set up Stripe**

   - Create products and prices in Stripe Dashboard
   - Set up a webhook endpoint pointing to your deployed app's `/api/webhooks/stripe` endpoint
   - Add webhook events: `checkout.session.completed`

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

### **Unit Tests**

Run Jest unit tests:

```bash
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### **End-to-End Tests**

Run Playwright E2E tests:

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode for debugging
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e-tests/product-to-cart.spec.ts
```

**Browser Coverage:**

- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ⚠️ WebKit (Safari) disabled in CI due to test environment limitations

**Test Coverage:**

- Authentication flows (signup, login, logout)
- Product browsing and filtering
- Shopping cart operations
- Checkout process

---

## 🏆 Technical Highlights

### **1. Type-Safe Architecture**

- **100% TypeScript** coverage across the entire codebase
- **Zod validation schemas** for all data inputs (forms, API responses, database writes)
- **Type-safe Server Actions** with automatic inference

### **2. Performance Optimizations**

- **Infinite Scroll** - Intersection Observer API with deduplication logic
- **Product Caching** - `unstable_cache` with 60-second TTL and tag-based revalidation
- **Image Optimization** - Next.js Image component with Vercel Blob CDN
- **Debounced Search** - 300ms debounce on filter inputs to reduce re-renders
- **Lazy Loading** - Components and images load on demand

### **3. Accessibility (WCAG 2.1 AA)**

- **Radix UI primitives** - Built-in keyboard navigation and screen reader support
- **ARIA attributes** - Proper labels, roles, and states on interactive elements
- **Semantic HTML** - Correct heading hierarchy and landmark regions
- **Focus management** - Visible focus indicators and logical tab order
- **Responsive design** - Mobile-first approach with touch-friendly targets

**Lighthouse Scores:**

![Lighthouse Performance Scores](document-media/lighthouse.png)

### **4. Security Best Practices**

- **Content Security Policy (CSP)** - Prevents XSS attacks by restricting resource loading
- **Defense-in-Depth Headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Server-side validation** - All mutations validated on the server with Zod schemas
- **Role-based access control** - Admin routes protected with middleware role checks
- **HTTP-only cookies** - Session tokens not accessible via JavaScript (prevents cookie theft)
- **SameSite cookies** - CSRF protection on session cookies
- **Environment variable isolation** - Sensitive keys never exposed to client
- **Stripe webhook verification** - Signature validation on webhook events

> **Security Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md#security-considerations) for comprehensive documentation on my defense-in-depth security strategy, including detailed CSP configuration and XSS attack prevention.

### **5. Code Quality & Testing**

- **Custom hooks** - Reusable logic abstraction (`useAsyncData`, `useDialogState`, `useTableState`)
- **Separation of concerns** - Data Access Layer (DAL) separates business logic from UI
- **Error boundaries** - Graceful error handling throughout the app
- **Test coverage** - Unit tests for utilities and components, E2E tests for critical flows

### **6. CI/CD & DevOps**

**Automated Workflows:**

- **Continuous Integration** - Runs on every push and PR

  - ESLint code quality checks
  - TypeScript type checking
  - Jest unit tests (with coverage)
  - Next.js production build validation
  - Playwright E2E tests (Chromium + Firefox)

- **Security Scanning** - Automated security checks
  - **CodeQL Analysis** - Detects security vulnerabilities in code
  - **Dependency Review** - Blocks PRs with vulnerable dependencies
  - **Secret Scanning** - TruffleHog prevents credential leaks
  - **NPM Audit** - Weekly dependency vulnerability checks
  - **Outdated Packages** - Automated tracking of package updates

**Branch Protection:**

- All checks must pass before merging to main
- Status checks prevent regressions
- Automated test reports on every PR

---

### **Infrastructure**

- **Frontend Hosting**: Vercel Edge Network
- **Database**: Firebase Firestore (serverless NoSQL)
- **Authentication**: Firebase Authentication
- **Image CDN**: Vercel Blob Storage
- **Payment Processing**: Stripe Checkout
- **Email Notifications**: Handled by [TextileCom-Express](../textilecom-express) backend

### **Related Microservices**

This Next.js application is part of a larger e-commerce ecosystem:

- **[TextileCom-Express](../textilecom-express)** - Express.js backend for:
  - Stripe webhook event handling
  - Order confirmation emails (Resend integration)
  - Background job processing

---

## 🎓 Key Learnings

Building TextileCom taught me:

1. **Next.js 15 App Router Patterns**

   - When to use Server Components vs Client Components
   - Server Actions for type-safe mutations without API routes
   - Effective caching strategies with `unstable_cache`

2. **Complex State Management**

   - Syncing cart state between local storage and Firestore
   - Handling authentication state across server and client
   - Managing optimistic updates with error rollback

3. **Payment Integration**

   - Stripe Checkout session flow
   - Webhook signature verification
   - Handling race conditions between payment confirmation and order creation

4. **Accessibility at Scale**

   - Building custom components with Radix UI primitives
   - ARIA patterns for complex interactions (infinite scroll, modals, carousels)

5. **Production-Grade Error Handling**

   - Retry logic with exponential backoff
   - User-friendly error messages
   - Logging and monitoring strategies
