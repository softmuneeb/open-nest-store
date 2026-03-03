# Open Nest Store — Full Implementation Plan

> **Version:** 1.1.0 | **Date:** March 3, 2026  
> **Source Reference:** itechdevices.ae category structure (scraped March 3, 2026)  
> **Brand:** Open Nest | **Stack:** React Router 7 · Cloudflare Workers · MongoDB Atlas · TailwindCSS 4 · TypeScript  
> **Methodology:** Test-Driven Development (TDD) — E2E + unit tests written FIRST; cycle: write tests → run (all red) → develop → run (green) → repeat

---

do not use stubs, if stuck ask me i will provide api keys , conn strings etc, any thing,

MONGO_URL="mongodb+srv://muneeb:35a2W0U5duoyivx5@clustersofty.7iwjvfy.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSofty"


## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Brand Identity — Open Nest](#2-brand-identity--open-nest)
3. [Business Requirements Document (BRD)](#3-business-requirements-document-brd)
4. [Information Architecture & Category Tree](#4-information-architecture--category-tree)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Models & Schemas](#6-data-models--schemas)
7. [API Contract Specification](#7-api-contract-specification)
8. [Page & Route Specifications](#8-page--route-specifications)
9. [UI Component Library Specification](#9-ui-component-library-specification)
10. [TDD Blueprint — Test Suite Structure](#10-tdd-blueprint--test-suite-structure)
11. [Automated Test Execution — CI/CD & Watch Mode](#11-automated-test-execution--cicd--watch-mode)
12. [Development Phases & Roadmap](#12-development-phases--roadmap)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Acceptance Criteria Master List](#14-acceptance-criteria-master-list)

---

## 1. Executive Summary

**Open Nest** is a full-stack B2C/B2B e-commerce platform specialising in computer hardware, networking equipment, server components, and IT peripherals, modelled after itechdevices.ae. It is deployed on **Cloudflare Workers + Pages** using **React Router 7** (framework mode) with server-side rendering, edge caching, and full-stack TypeScript.

The platform will be built using **strict Test-Driven Development**: every feature begins with a failing test (Red), a minimal implementation (Green) and a refactored clean version (Refactor). A file-watcher CI loop will re-run the full relevant test suite within seconds of any file save.

**Key Differentiators over the reference site:**
- Open source, fully customisable white-label storefront
- Edge-first architecture: all pages rendered at Cloudflare edge, ≤ 50 ms TTFB globally
- Multi-currency (AED, SAR, USD) from day one
- Headless-ready API layer — the same backend powers web, mobile and third-party integrations
- Comprehensive, auto-running test coverage at unit, integration and E2E levels

---

## 2. Brand Identity — Open Nest

| Attribute | Value |
|---|---|
| **Brand Name** | Open Nest |
| **Tagline** | "Technology. Delivered." |
| **Primary Color** | `#0F3460` (Deep Navy) |
| **Accent Color** | `#E94560` (Vivid Red) |
| **Surface Color** | `#1A1A2E` (Dark Midnight) |
| **Background** | `#F5F5F5` (Light Gray) |
| **Typography – Heading** | Inter 700 |
| **Typography – Body** | Inter 400 |
| **Logo Mark** | Stylised nested brackets `[[ ]]` in nav bar |
| **Favicon** | Bracket mark on navy background |
| **Domain (placeholder)** | opennest.store |
| **Support Email** | support@opennest.store |
| **Currency Display** | AED (default), SAR, USD switchable |

### Brand Voice
- Professional but approachable
- Technical accuracy required for all product copy
- UAE-market aware (Arabic support scaffold included)
- "Trust through transparency" — always show stock status, warranty info, pricing

---

## 3. Business Requirements Document (BRD)

### 3.1 Stakeholders

| Role | Responsibility |
|---|---|
| Shopper (Guest) | Browse, search, add to cart, checkout as guest |
| Shopper (Registered) | All guest actions + order history, wishlist, saved addresses |
| Business Customer (B2B) | Bulk pricing, quote requests, NET-30 accounts |
| Content Manager | Manage categories, products, banners |
| Admin | Full back-office access |

### 3.2 Core Business Requirements

#### BR-001 — Product Catalogue
- The platform MUST display products organised by the category hierarchy defined in §4
- Each product MUST have: Name, SKU, Images, Description, Price (AED), Stock Status, Brand, Google Product Category
- Product pages MUST include SEO meta title, meta description, and meta keywords
- Products MUST support multiple images with WebP format
- Products MUST have weight and dimension attributes for shipping calculation

#### BR-002 — Search & Discovery
- Full-text search across product names, descriptions, SKUs, and brand names
- Category-filtered search results
- Brand-filtered search results
- Price range filter
- In-stock filter
- Sort by: price asc/desc, newest, relevance
- Search results MUST return within 300 ms (p95)

#### BR-003 — Cart & Checkout
- Guest checkout (no account required)
- Registered user checkout (pre-filled saved address)
- Multi-currency display (AED default, SAR ×1.02, USD ×0.272)
- Cart persists across sessions (localStorage + server-side for logged-in users)
- Coupon / promo code application
- Shipping cost calculation based on product weight and destination emirate
- Order summary with itemised breakdown before final confirmation

#### BR-004 — User Accounts
- Registration with email verification
- Login / logout / password reset
- Order history with line-item detail and tracking status
- Wishlist (save products for later)
- Address book (multiple saved addresses)
- B2B flag: company name, trade licence number, credit terms

#### BR-005 — Content & SEO
- Static category landing pages with rich editorial descriptions (as seen on itechdevices.ae)
- Footer SEO description blocks per category
- Breadcrumb navigation on all category and product pages
- Sitemap XML auto-generated from category and product tree
- Canonical URLs to prevent duplicate content
- Structured data (Product, BreadcrumbList, Organization) via JSON-LD

#### BR-006 — Multi-Currency
- Three currencies: AED (base), SAR, USD
- Exchange rates updateable via admin
- All prices stored in AED; displayed currency calculated at render time
- Currency switcher in site header, persisted in cookie

#### BR-007 — B2B Features
- Request for Quote (RFQ) flow for bulk orders
- Trade account application form
- Bulk pricing tiers (1–9, 10–49, 50–99, 100+)
- Invoice download (PDF) per order
- Net-30 payment option for approved accounts

#### BR-008 — Performance
- Lighthouse score ≥ 90 on all core pages (mobile + desktop)
- Time to First Byte ≤ 100 ms (edge-cached pages) / ≤ 500 ms (uncached SSR)
- Largest Contentful Paint ≤ 2.5 s
- Cumulative Layout Shift ≤ 0.1

#### BR-009 — Accessibility
- WCAG 2.1 Level AA compliance
- All interactive elements keyboard navigable
- Meaningful alt text on all product images
- Colour contrast ratio ≥ 4.5:1 for body text

#### BR-010 — Analytics & Tracking
- Google Analytics 4 integration (page views, product views, add-to-cart, purchase events)
- Google Tag Manager container for third-party pixels
- Heatmap / session recording scaffold (PostHog or equivalent)

---

## 4. Information Architecture & Category Tree

> Sourced from itechdevices.ae API (`/9/category/tree`) on March 3, 2026.  
> Open Nest will mirror this structure with branded URLs.

```
Root
└── Computer Components                           /computer-components
    ├── CPUs / Processors                         /computer-components/processors
    │   ├── Desktop Processors                    /computer-components/processors/desktop
    │   ├── Server Processors                     /computer-components/processors/server
    │   └── Laptop Processors                     /computer-components/processors/laptop
    ├── Motherboards                              /computer-components/motherboards
    │   ├── Desktop Motherboards                  /computer-components/motherboards/desktop
    │   └── Server Motherboards                   /computer-components/motherboards/server
    ├── RAM / Memory                              /computer-components/memory
    │   ├── Desktop RAM                           /computer-components/memory/desktop-ram
    │   ├── Server RAM / ECC Memory               /computer-components/memory/server-ram
    │   └── Laptop RAM                            /computer-components/memory/laptop-ram
    ├── Storage                                   /computer-components/storage
    │   ├── Hard Disk Drives (HDD)                /computer-components/storage/hdd
    │   ├── Solid State Drives (SSD)              /computer-components/storage/ssd
    │   ├── NVMe Drives                           /computer-components/storage/nvme
    │   └── Optical Drives                        /computer-components/storage/optical
    ├── Graphics Cards (GPU)                      /computer-components/graphics-cards
    │   ├── Desktop GPUs                          /computer-components/graphics-cards/desktop
    │   └── Workstation GPUs                      /computer-components/graphics-cards/workstation
    ├── Power Supplies                            /computer-components/power-supplies
    ├── PC Cases & Enclosures                     /computer-components/cases
    ├── Cables                                    /computer-components/cables
    │   ├── Storage & Data Transfer Cables        /computer-components/cables/storage-data-transfer
    │   └── System & Power Cables                 /computer-components/cables/system-power
    ├── System Cooling Parts                      /computer-components/system-cooling
    │   ├── Heatsinks                             /computer-components/system-cooling/heatsinks
    │   ├── CPU Fans                              /computer-components/system-cooling/cpu-fans
    │   ├── CPU Fans / Heatsink Combos            /computer-components/system-cooling/cpu-fan-heatsink
    │   ├── Thermal Compound / Grease             /computer-components/system-cooling/thermal-compound
    │   └── Fan Trays                             /computer-components/system-cooling/fan-trays
    ├── Monitors                                  /computer-components/monitors
    │   ├── LCD / LED Monitors                    /computer-components/monitors/lcd-led
    │   ├── CRT Monitors                          /computer-components/monitors/crt
    │   ├── Laptop Replacement Screens            /computer-components/monitors/laptop-screens
    │   └── Monitor Accessories                   /computer-components/monitors/accessories
    ├── Computer Accessories                      /computer-components/accessories
    │   └── Mounting Kits                         /computer-components/accessories/mounting-kits
    ├── ICs & Microchips                          /computer-components/ics-microchips
    └── Industrial Equipment                      /computer-components/industrial-equipment

└── Networking                                    /networking
    ├── Switches                                  /networking/switches
    │   ├── Managed Switches                      /networking/switches/managed
    │   └── Unmanaged Switches                    /networking/switches/unmanaged
    ├── Routers                                   /networking/routers
    ├── Firewalls                                 /networking/firewalls
    ├── Network Adapters / NICs                   /networking/network-adapters
    ├── Wireless / Wi-Fi                          /networking/wireless
    │   ├── Access Points                         /networking/wireless/access-points
    │   └── Wi-Fi Adapters                        /networking/wireless/adapters
    ├── Modems                                    /networking/modems
    ├── Cables & Transceivers                     /networking/cables-transceivers
    │   ├── SFP / SFP+ Modules                    /networking/cables-transceivers/sfp
    │   ├── Ethernet Cables (Cat5e/Cat6/Cat6A)    /networking/cables-transceivers/ethernet
    │   └── Fiber Optic Cables                    /networking/cables-transceivers/fiber
    └── Network Accessories                       /networking/accessories

└── Servers & Server Components                   /servers
    ├── Rack Servers                              /servers/rack-servers
    ├── Tower Servers                             /servers/tower-servers
    ├── Blade Servers                             /servers/blade-servers
    ├── Server Motherboards                       /servers/motherboards
    ├── Server CPUs                               /servers/processors
    ├── Server Memory (ECC RAM)                   /servers/memory
    ├── Server Storage                            /servers/storage
    │   ├── Server HDDs (SAS/SATA)                /servers/storage/hdd
    │   └── Server SSDs                           /servers/storage/ssd
    ├── RAID Controllers                          /servers/raid-controllers
    ├── Server Power Supplies                     /servers/power-supplies
    ├── Server Cooling                            /servers/cooling
    └── KVM Switches & Accessories                /servers/kvm

└── Laptops & Notebooks                           /laptops
    ├── Business Laptops                          /laptops/business
    ├── Gaming Laptops                            /laptops/gaming
    ├── Workstation Laptops                       /laptops/workstation
    └── Laptop Accessories                        /laptops/accessories
        ├── Laptop Batteries                      /laptops/accessories/batteries
        ├── Laptop Chargers / Adapters            /laptops/accessories/chargers
        ├── Laptop Bags & Cases                   /laptops/accessories/bags
        └── Docking Stations                      /laptops/accessories/docking-stations

└── Printers & Imaging                            /printers
    ├── Laser Printers                            /printers/laser
    ├── Inkjet Printers                           /printers/inkjet
    ├── Label Printers                            /printers/label
    ├── Printer Cartridges                        /printers/cartridges
    └── Printer Accessories                       /printers/accessories

└── Peripherals & Input Devices                   /peripherals
    ├── Keyboards                                 /peripherals/keyboards
    ├── Mice                                      /peripherals/mice
    ├── Webcams                                   /peripherals/webcams
    ├── Headsets & Audio                          /peripherals/headsets
    ├── USB Hubs & Docking                        /peripherals/usb-hubs
    └── Barcode Scanners                          /peripherals/barcode-scanners

└── Power & UPS                                   /power-ups
    ├── UPS Systems                               /power-ups/ups
    ├── PDUs (Power Distribution Units)           /power-ups/pdus
    └── Surge Protectors                          /power-ups/surge-protectors
```

### 4.1 Category Data Model (per category node)
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Unique |
| `name` | `string` | Display name |
| `slug` | `string` | URL segment |
| `parent_id` | `number \| null` | `null` = root |
| `category_path` | `string` | Breadcrumb string |
| `url` | `string` | Full relative URL |
| `image` | `string` | WebP image path |
| `meta_title` | `string` | SEO title |
| `meta_description` | `string` | SEO description |
| `meta_keywords` | `string` | SEO keywords |
| `description` | `string \| null` | Top editorial HTML |
| `footer_description` | `string \| null` | Bottom editorial HTML |
| `google_product_category` | `string` | Google Shopping taxonomy |
| `active` | `boolean` | Visibility flag |
| `weight` | `number` | Default shipping weight (lb) |
| `dimensions` | `{ l, w, h, unit }` | Default shipping dimensions |

---

## 5. Technical Architecture

### 5.1 System Diagram

```
Browser (React + Hydration)
          │
          ▼
Cloudflare Edge Network (anycast)
          │
    ┌─────┴──────────────────────┐
    │   Cloudflare Worker         │  ← React Router 7 SSR entry
    │   (app server + API router) │
    └─────┬──────────────────────┘
          │
    ┌─────┼──────────────────────┐
    │     │                      │
    ▼     ▼                      ▼
  KV    D1 (SQLite)         R2 Bucket
(cache) (product/order DB)  (product images)
```

### 5.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Cloudflare Workers | latest |
| Framework | React Router 7 (Framework Mode) | 7.9.6 |
| UI Library | React 19 | ^19.0.0 |
| Styling | TailwindCSS | 4.x |
| Language | TypeScript | 5.9.x |
| Build Tool | Vite 6 | ^6.0.0 |
| Database | MongoDB Atlas (via HTTP Data API) | 7.x |
| ODM | Mongoose (edge-compatible subset) | ^8.x |
| Cache | Cloudflare KV | latest |
| File Storage | Cloudflare R2 | latest |
| Search | MongoDB Atlas Search (Lucene) | - |
| Auth | Custom JWT + `jose` (edge-compatible) | - |
| Email | Cloudflare Email Workers + Resend | - |
| Payments | Stripe (gateway) | latest |
| Testing (Unit/Int) | Vitest | ^2.x |
| Testing (Components) | @testing-library/react + jsdom | ^16.x |
| Testing (E2E) | Playwright | ^1.45 |
| Testing (DB) | mongodb-memory-server | ^10.x |
| Testing (a11y) | @axe-core/playwright | ^4.x |
| Linting | ESLint + TypeScript | - |
| Formatting | Prettier | - |
| CI/CD | GitHub Actions | - |
| Package Manager | npm | - |

### 5.3 Project Directory Structure

```
open-nest-store/
├── app/
│   ├── root.tsx                        # HTML shell, global providers
│   ├── routes.ts                       # React Router 7 routing config
│   ├── entry.server.tsx                # Cloudflare Workers SSR entry
│   ├── app.css                         # Global styles / Tailwind imports
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── ui/                         # Primitive design-system components
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top nav, search bar, cart icon
│   │   │   ├── Footer.tsx
│   │   │   ├── MegaMenu.tsx            # Category dropdown navigation
│   │   │   └── Sidebar.tsx            # Category/filter sidebar
│   │   ├── product/
│   │   │   ├── ProductCard.tsx         # Grid card
│   │   │   ├── ProductGallery.tsx      # Image lightbox
│   │   │   ├── ProductDetails.tsx      # Detail tab area
│   │   │   ├── ProductBreadcrumb.tsx
│   │   │   ├── AddToCartButton.tsx
│   │   │   └── WishlistButton.tsx
│   │   ├── category/
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── CategoryFilters.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── SortSelect.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutSteps.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── ShippingMethodSelect.tsx
│   │   │   └── OrderReview.tsx
│   │   └── search/
│   │       ├── SearchBar.tsx
│   │       ├── SearchResults.tsx
│   │       └── SearchFilters.tsx
│   │
│   ├── routes/
│   │   ├── home.tsx                            # /
│   │   ├── search.tsx                          # /search
│   │   ├── categories/
│   │   │   ├── $slug.tsx                       # /[category-slug]
│   │   │   └── $parent.$slug.tsx               # /[parent]/[sub-category]
│   │   ├── products/
│   │   │   └── $slug.tsx                       # /products/[product-slug]
│   │   ├── cart.tsx                            # /cart
│   │   ├── checkout/
│   │   │   ├── index.tsx                       # /checkout
│   │   │   ├── shipping.tsx                    # /checkout/shipping
│   │   │   ├── payment.tsx                     # /checkout/payment
│   │   │   └── confirmation.tsx                # /checkout/confirmation
│   │   ├── account/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── orders.$id.tsx
│   │   │   ├── wishlist.tsx
│   │   │   └── addresses.tsx
│   │   ├── api/
│   │   │   ├── products.ts              # GET /api/products
│   │   │   ├── categories.ts            # GET /api/categories
│   │   │   ├── cart.ts                  # GET/POST/PUT/DELETE /api/cart
│   │   │   ├── orders.ts                # GET/POST /api/orders
│   │   │   ├── auth.ts                  # POST /api/auth/*
│   │   │   ├── search.ts                # GET /api/search
│   │   │   └── currencies.ts            # GET /api/currencies
│   │   └── admin/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── products.tsx
│   │       ├── categories.tsx
│   │       └── orders.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.sql               # D1 schema migrations
│   │   │   ├── client.ts                # D1 client wrapper
│   │   │   ├── products.ts              # Product queries
│   │   │   ├── categories.ts            # Category queries
│   │   │   ├── orders.ts                # Order queries
│   │   │   └── users.ts                 # User queries
│   │   ├── auth/
│   │   │   ├── jwt.ts                   # JWT sign/verify (edge-safe)
│   │   │   └── session.ts               # Cookie session helpers
│   │   ├── cart/
│   │   │   └── cartStore.ts             # Cart state + persistence
│   │   ├── currency/
│   │   │   └── converter.ts             # Price conversion utilities
│   │   ├── search/
│   │   │   └── fts.ts                   # D1 FTS5 query builder
│   │   ├── seo/
│   │   │   ├── meta.ts                  # Meta tag helpers
│   │   │   └── jsonld.ts                # JSON-LD structured data builders
│   │   └── shipping/
│   │       └── calculator.ts            # Weight-based shipping cost
│   │
│   └── types/
│       ├── product.ts
│       ├── category.ts
│       ├── cart.ts
│       ├── order.ts
│       ├── user.ts
│       └── api.ts
│
├── tests/                               # All tests live here
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── currency.test.ts
│   │   │   ├── shipping.test.ts
│   │   │   ├── seo.test.ts
│   │   │   └── fts.test.ts
│   │   └── components/
│   │       ├── ProductCard.test.tsx
│   │       ├── CartItem.test.tsx
│   │       ├── AddToCartButton.test.tsx
│   │       └── Breadcrumb.test.tsx
│   ├── integration/
│   │   ├── api/
│   │   │   ├── products.test.ts
│   │   │   ├── categories.test.ts
│   │   │   ├── cart.test.ts
│   │   │   ├── search.test.ts
│   │   │   └── auth.test.ts
│   │   └── db/
│   │       ├── products-db.test.ts
│   │       └── categories-db.test.ts
│   ├── e2e/
│   │   ├── homepage.spec.ts
│   │   ├── category-browse.spec.ts
│   │   ├── product-detail.spec.ts
│   │   ├── search.spec.ts
│   │   ├── cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   └── account.spec.ts
│   └── fixtures/
│       ├── categories.json
│       ├── products.json
│       └── users.json
│
├── scripts/
│   ├── seed-categories.ts               # Seed D1 from itechdevices category JSON
│   └── seed-products.ts
│
├── workers/
│   └── app.ts                           # Cloudflare Worker entry
│
├── public/
├── IMPLEMENTATION_PLAN.md               # This document
├── vitest.config.ts
├── playwright.config.ts
├── wrangler.json
├── vite.config.ts
├── react-router.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Data Models & Schemas

### 6.1 Database: MongoDB Atlas

- **Connection:** `mongodb` v6 driver with fetch-based transport (Cloudflare Workers compatible)
- **Development testing:** `mongodb-memory-server` spins up an in-process MongoDB for integration tests — no Atlas account needed during test runs
- **Collections:** `categories`, `products`, `brands`, `users`, `orders`, `carts`, `coupons`, `exchange_rates`
- **Indexes:** Text indexes on `products` (`name`, `description`, `sku`, `meta_keywords`) for full-text search via `$text`; Atlas Search (Lucene) for production autocomplete
- **Migrations:** `scripts/migrations/` directory with numbered scripts (`001_seed_categories.ts`, etc.)

```typescript
// Sample connection helper — app/lib/db/mongodb.ts
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export function getMongoClient(env: Env): MongoClient {
  if (client) return client;
  client = new MongoClient(env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });
  return client;
}

export function getDb(env: Env, dbName = 'opennest') {
  return getMongoClient(env).db(dbName);
}
```

### 6.2 MongoDB Document Schemas (TypeScript interfaces)

#### Category Document
```typescript
interface CategoryDocument {
  _id: ObjectId;
  id: number;               // legacy numeric id (matches itechdevices source)
  name: string;
  slug: string;
  parent_id: number | null;
  category_path: string;
  url: string;
  image: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  description: string | null;
  footer_description: string | null;
  google_product_category: string;
  active: boolean;
  weight_default: number;
  dimensions_default: { l: number; w: number; h: number; unit: string };
  children?: CategoryDocument[];  // populated at query time
  created_at: Date;
  updated_at: Date;
}
```

#### Product Document
```typescript
interface ProductDocument {
  _id: ObjectId;
  sku: string;
  name: string;
  slug: string;
  brand: { id: ObjectId; name: string; slug: string } | null;
  category_id: ObjectId;
  price_aed: number;
  compare_price_aed?: number;
  stock_qty: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  description: string | null;
  short_description: string | null;
  images: { url: string; alt: string; is_primary: boolean; sort_order: number }[];
  attributes: Record<string, string>;
  price_tiers: { min_qty: number; max_qty?: number; price_aed: number }[];
  meta: { title: string; description: string; keywords: string };
  google_product_category: string;
  weight: number;
  dimensions: { l: number; w: number; h: number };
  active: boolean;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### Order Document
```typescript
interface OrderDocument {
  _id: ObjectId;
  order_number: string;           // ONS-YYYYMMDD-XXXXX
  user_id: ObjectId | null;
  guest_email: string | null;
  status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded';
  currency: 'AED' | 'SAR' | 'USD';
  subtotal_aed: number;
  shipping_cost_aed: number;
  discount_aed: number;
  total_aed: number;
  coupon_code: string | null;
  payment_method: string | null;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  stripe_payment_intent: string | null;
  shipping_address: AddressSnapshot;
  items: OrderItemSnapshot[];
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemSnapshot {
  product_id: ObjectId;
  product_name: string;
  product_sku: string;
  qty: number;
  unit_price_aed: number;
  total_aed: number;
}
```

> **NOTE: Original D1/SQLite schema replaced by MongoDB.** The rest of this section remains as reference; the actual schema is now defined via TypeScript interfaces and enforced at the application layer.

### 6.3 Legacy SQL Reference (archived — was D1/SQLite, now replaced)

```sql
-- CATEGORIES (legacy reference only)
CREATE TABLE categories (
  id              INTEGER PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  parent_id       INTEGER REFERENCES categories(id),
  category_path   TEXT,
  url             TEXT,
  image           TEXT,
  meta_title      TEXT,
  meta_description TEXT,
  meta_keywords   TEXT,
  description     TEXT,
  footer_description TEXT,
  google_product_category TEXT,
  active          INTEGER NOT NULL DEFAULT 1,  -- boolean
  weight_default  REAL,
  length_default  REAL,
  width_default   REAL,
  height_default  REAL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================
-- BRANDS
-- =============================================
CREATE TABLE brands (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE,
  logo  TEXT
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id                    INTEGER PRIMARY KEY,
  sku                   TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  brand_id              INTEGER REFERENCES brands(id),
  category_id           INTEGER NOT NULL REFERENCES categories(id),
  price_aed             REAL NOT NULL,
  compare_price_aed     REAL,              -- original / strikethrough price
  stock_qty             INTEGER NOT NULL DEFAULT 0,
  stock_status          TEXT NOT NULL DEFAULT 'in_stock',  -- in_stock | out_of_stock | backorder
  description           TEXT,
  short_description     TEXT,
  meta_title            TEXT,
  meta_description      TEXT,
  meta_keywords         TEXT,
  google_product_category TEXT,
  weight                REAL,             -- kg
  length                REAL,             -- mm
  width                 REAL,             -- mm
  height                REAL,             -- mm
  active                INTEGER NOT NULL DEFAULT 1,
  featured              INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active);

-- FTS5 for full-text search
CREATE VIRTUAL TABLE products_fts USING fts5(
  name, description, sku, meta_keywords,
  content=products, content_rowid=id
);

-- =============================================
-- PRODUCT IMAGES
-- =============================================
CREATE TABLE product_images (
  id         INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,         -- R2 path or absolute URL
  alt        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- PRODUCT ATTRIBUTES
-- =============================================
CREATE TABLE attribute_groups (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE attributes (
  id               INTEGER PRIMARY KEY,
  group_id         INTEGER NOT NULL REFERENCES attribute_groups(id),
  name             TEXT NOT NULL,
  display_name     TEXT NOT NULL
);

CREATE TABLE product_attributes (
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id INTEGER NOT NULL REFERENCES attributes(id),
  value        TEXT NOT NULL,
  PRIMARY KEY (product_id, attribute_id)
);

-- =============================================
-- PRICING TIERS (B2B)
-- =============================================
CREATE TABLE price_tiers (
  id         INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty    INTEGER NOT NULL,
  max_qty    INTEGER,               -- NULL = unlimited
  price_aed  REAL NOT NULL
);

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
  id              INTEGER PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  is_b2b          INTEGER NOT NULL DEFAULT 0,
  company_name    TEXT,
  trade_licence   TEXT,
  credit_terms    TEXT,             -- null | net30 | net60
  email_verified  INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE addresses (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'Home',
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  phone       TEXT,
  line1       TEXT NOT NULL,
  line2       TEXT,
  emirate     TEXT NOT NULL,        -- Dubai | Abu Dhabi | Sharjah | ...
  country     TEXT NOT NULL DEFAULT 'AE',
  is_default  INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE orders (
  id                  INTEGER PRIMARY KEY,
  order_number        TEXT NOT NULL UNIQUE,  -- ONS-YYYYMMDD-XXXXX
  user_id             INTEGER REFERENCES users(id),
  guest_email         TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',  -- pending|confirmed|processing|shipped|delivered|cancelled|refunded
  currency            TEXT NOT NULL DEFAULT 'AED',
  subtotal_aed        REAL NOT NULL,
  shipping_cost_aed   REAL NOT NULL DEFAULT 0,
  discount_aed        REAL NOT NULL DEFAULT 0,
  total_aed           REAL NOT NULL,
  coupon_code         TEXT,
  payment_method      TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'unpaid',  -- unpaid|paid|refunded
  stripe_payment_intent TEXT,
  shipping_address_id INTEGER REFERENCES addresses(id),
  shipping_address_snapshot TEXT,   -- JSON snapshot at time of order
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE order_items (
  id             INTEGER PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER NOT NULL REFERENCES products(id),
  product_name   TEXT NOT NULL,   -- snapshot
  product_sku    TEXT NOT NULL,   -- snapshot
  qty            INTEGER NOT NULL,
  unit_price_aed REAL NOT NULL,
  total_aed      REAL NOT NULL
);

-- =============================================
-- CART (server-side for logged-in users)
-- =============================================
CREATE TABLE cart_items (
  id         INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,         -- anonymous or user_id as string
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (session_id, product_id)
);

-- =============================================
-- WISHLISTS
-- =============================================
CREATE TABLE wishlist_items (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  added_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, product_id)
);

-- =============================================
-- COUPONS
-- =============================================
CREATE TABLE coupons (
  id              INTEGER PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL,  -- percent | fixed
  value           REAL NOT NULL,
  min_order_aed   REAL,
  max_uses        INTEGER,
  uses_count      INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  expires_at      TEXT
);

-- =============================================
-- EXCHANGE RATES
-- =============================================
CREATE TABLE exchange_rates (
  currency    TEXT PRIMARY KEY,
  factor      REAL NOT NULL,
  symbol      TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default rates (from itechdevices.ae API)
INSERT INTO exchange_rates VALUES ('AED', 1.0,    'AED', datetime('now'));
INSERT INTO exchange_rates VALUES ('SAR', 1.02,   'SAR', datetime('now'));
INSERT INTO exchange_rates VALUES ('USD', 0.2717, '$',   datetime('now'));
```

> End of legacy SQL reference.

---

## 7. API Contract Specification

All API routes are co-located React Router resource routes at `/api/*`.  
All responses: `Content-Type: application/json`, HTTP status follows REST conventions.  
Auth: Bearer JWT in `Authorization` header or `session` cookie.

### 7.1 Categories API

```
GET  /api/categories              → CategoryTree[]     (all active categories)
GET  /api/categories/:slug        → CategoryNode       (single category + children)
GET  /api/categories/:slug/products → PaginatedProducts (products under category)
```

**Response: CategoryNode**
```typescript
interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  category_path: string;
  url: string;
  image: string | null;
  meta_title: string;
  meta_description: string;
  description: string | null;
  footer_description: string | null;
  children: CategoryNode[];
}
```

### 7.2 Products API

```
GET  /api/products                  → PaginatedProducts
  query params: category, brand, q, min_price, max_price, in_stock, sort, page, limit
GET  /api/products/:slug            → Product (full detail)
```

**Response: Product**
```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: { id: number; name: string; slug: string } | null;
  category: { id: number; name: string; slug: string; path: string };
  price: { aed: number; compare_aed?: number };
  stock: { qty: number; status: 'in_stock' | 'out_of_stock' | 'backorder' };
  images: { url: string; alt: string; is_primary: boolean }[];
  description: string | null;
  short_description: string | null;
  attributes: Record<string, string>;
  price_tiers: { min_qty: number; max_qty?: number; price_aed: number }[];
  meta: { title: string; description: string; keywords: string };
}
```

**Response: PaginatedProducts**
```typescript
interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: {
    brands: { id: number; name: string; count: number }[];
    price_range: { min: number; max: number };
  };
}
```

### 7.3 Cart API

```
GET    /api/cart                → Cart
POST   /api/cart/items          → Cart           body: { product_id, qty }
PUT    /api/cart/items/:id      → Cart           body: { qty }
DELETE /api/cart/items/:id      → Cart
DELETE /api/cart                → 204 (clear cart)
POST   /api/cart/coupon         → Cart           body: { code }
DELETE /api/cart/coupon         → Cart
```

### 7.4 Auth API

```
POST /api/auth/register         body: { email, password, first_name, last_name }
POST /api/auth/login            body: { email, password }
POST /api/auth/logout
POST /api/auth/forgot-password  body: { email }
POST /api/auth/reset-password   body: { token, password }
GET  /api/auth/me               → User (requires auth)
```

### 7.5 Orders API

```
GET  /api/orders                → Order[]       (requires auth)
GET  /api/orders/:number        → Order         (owner or admin)
POST /api/orders                → Order         body: CheckoutPayload
```

### 7.6 Search API

```
GET /api/search?q=&category=&brand=&min_price=&max_price=&in_stock=&sort=&page=&limit=
→ PaginatedProducts
```

### 7.7 Currency API

```
GET /api/currencies  →  ExchangeRate[]
```

---

## 8. Page & Route Specifications

### 8.1 Home Page (`/`)

**Sections:**
1. Hero Banner (CMS-driven, linkable to category/product)
2. Featured Categories Grid (8 top-level categories)
3. Featured Products Carousel
4. Brand Logos Scroll Strip
5. Recently Viewed Products (client-side, localStorage)
6. Promotional Banner (B2B CTA)
7. Trust Badges (Free Delivery, Warranty, Genuine Products, UAE Stock)

**Loader Data:**
- 8 hero categories
- 12 featured products
- Active hero banner config

### 8.2 Category Page (`/:category-slug`)

**Sections:**
1. Breadcrumb (`Home > [Category]`)
2. Category Editorial Header (name + top `description` HTML)
3. Sub-category Chips (if has children)
4. Product Grid (12 per page) with filters sidebar
5. Pagination
6. SEO Footer Description (`footer_description` HTML)

**URL Params:** `?page=`, `?brand=`, `?min_price=`, `?max_price=`, `?in_stock=`, `?sort=`

**Meta:** Dynamic from `meta_title`, `meta_description`

**JSON-LD:** `BreadcrumbList` + `ItemList` of products

### 8.3 Product Detail Page (`/products/:slug`)

**Sections:**
1. Breadcrumb
2. Product Gallery (primary + thumbnails, lightbox)
3. Product Info Panel:
   - Name, Brand, SKU
   - Price (with currency conversion)
   - Stock Status badge
   - Quantity selector
   - Add to Cart button
   - Add to Wishlist button
   - Quick shipping estimate
4. Product Details Tabs: Description | Specifications | Shipping & Returns | Reviews
5. B2B Pricing Tier Table (if applicable)
6. Related Products (same category, 4–6 items)
7. Recently Viewed

**Meta:** Dynamic from product `meta_title`, `meta_description`

**JSON-LD:** `Product` schema (name, sku, offers, brand, image)

### 8.4 Search Results Page (`/search`)

**Sections:**
1. Search term heading + result count
2. Filter sidebar (category, brand, price range, in-stock)
3. Results Grid with sort control
4. Pagination

### 8.5 Cart Page (`/cart`)

**Sections:**
1. Cart Items list (image, name, SKU, price, qty stepper, remove)
2. Coupon code input
3. Order Summary (subtotal, discount, shipping estimate, total)
4. Proceed to Checkout CTA
5. Continue Shopping link
6. Saved for Later / wishlist prompt for logged-in users

### 8.6 Checkout Flow

**Step 1: `/checkout` — Contact & Shipping Address**
- Email (guest) or logged-in user info
- Delivery address form
- Emirate selector (affects shipping cost)

**Step 2: `/checkout/shipping` — Shipping Method**
- Standard Delivery (weight-based AED)
- Express Delivery (+AED 25)
- Click & Collect (if applicable)

**Step 3: `/checkout/payment` — Payment**
- Stripe card form (Stripe Elements)
- Bank Transfer option (B2B)

**Step 4: `/checkout/confirmation` — Order Confirmed**
- Order number, summary, estimated delivery
- Email confirmation sent
- Account creation prompt for guests

### 8.7 Account Section (`/account/*`)

| Route | Description |
|---|---|
| `/account/login` | Login form |
| `/account/register` | Registration form |
| `/account/dashboard` | Overview: recent orders, wishlist count |
| `/account/orders` | Paginated order list |
| `/account/orders/:number` | Order detail + line items + tracking |
| `/account/wishlist` | Saved products grid |
| `/account/addresses` | Address book CRUD |

---

## 9. UI Component Library Specification

### 9.1 Design Tokens (Tailwind CSS Variables)

```css
/* app/app.css */
:root {
  --color-primary: #0F3460;
  --color-accent: #E94560;
  --color-surface: #1A1A2E;
  --color-bg: #F5F5F5;
  --color-text: #1C1C1E;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

### 9.2 Core Components

#### `<ProductCard />`
Props: `product: Product`, `currency: string`, `onAddToCart: fn`, `onWishlist: fn`

Renders:
- Product image (WebP, lazy loaded, aspect-ratio locked 1:1)
- Brand name (muted)
- Product name (truncated 2 lines)
- Price in selected currency
- Stock badge (green = in stock, red = out, yellow = backorder)
- "Add to Cart" button (disabled if out of stock)
- Wishlist heart icon

#### `<MegaMenu />`
- Triggered by hover/click on top-level category nav items
- Renders 3-column grid: sub-categories + featured products
- Closes on outside click or Escape

#### `<CartDrawer />`
- Slide-in from right
- Live item count badge on cart icon
- Renders `<CartItem />` list
- Subtotal + CTA to full cart page

#### `<SearchBar />`
- Debounced live search (300 ms)
- Shows up to 5 product suggestions + "View all results"
- Product name + thumbnail in autocomplete dropdown

#### `<CurrencySelector />`
- Dropdown: AED | SAR | USD
- Persists selection to cookie
- Updates all displayed prices via React context

### 9.3 Layout Components

#### `<Header />`
- Logo (left)
- Category nav with MegaMenu (centre/left)
- SearchBar (centre/right)
- Currency Selector + Wishlist icon + Cart icon + Account icon (right)
- Mobile: hamburger → full-screen drawer

#### `<Footer />`
- Column 1: Brand description + social links
- Column 2: Category quick links
- Column 3: Account / Support links
- Column 4: Contact info + payment icons
- Bottom bar: copyright + currency notice

---

## 10. TDD Blueprint — Test Suite Structure

> **TDD Rule:** No code without a failing test first. Tests are written as specs for every unit, route, component, and API endpoint BEFORE implementation.

### 10.1 Testing Philosophy

```
RED   → Write a test that fails (because code doesn't exist yet)
GREEN → Write the minimum code to make the test pass
REFACTOR → Clean the code without breaking tests
```

### 10.2 Unit Tests

#### `tests/unit/lib/currency.test.ts`
```typescript
describe('Currency Converter', () => {
  test('converts AED to AED with factor 1', ...)
  test('converts AED to SAR using factor 1.02', ...)
  test('converts AED to USD using factor 0.2717', ...)
  test('formats price with correct currency symbol', ...)
  test('handles zero price', ...)
  test('rounds to 2 decimal places', ...)
  test('throws on unknown currency code', ...)
})
```

#### `tests/unit/lib/shipping.test.ts`
```typescript
describe('Shipping Calculator', () => {
  test('returns free shipping for orders over AED 500', ...)
  test('calculates shipping based on weight (0–1 kg)', ...)
  test('calculates shipping for oversize items', ...)
  test('returns extra charge for express delivery', ...)
  test('returns correct rate for each UAE emirate', ...)
  test('handles null weight (uses category default)', ...)
})
```

#### `tests/unit/lib/seo.test.ts`
```typescript
describe('SEO Meta Builder', () => {
  test('generates correct meta tags for category page', ...)
  test('generates correct meta tags for product page', ...)
  test('generates Product JSON-LD schema', ...)
  test('generates BreadcrumbList JSON-LD schema', ...)
  test('generates canonical URL', ...)
  test('truncates meta description to 160 chars', ...)
})
```

#### `tests/unit/lib/fts.test.ts`
```typescript
describe('Full-Text Search Query Builder', () => {
  test('builds FTS5 MATCH query from search term', ...)
  test('escapes special characters in search term', ...)
  test('adds category filter to query', ...)
  test('adds brand filter to query', ...)
  test('adds price range filter', ...)
  test('adds in-stock filter', ...)
  test('builds sort ORDER BY clause', ...)
  test('builds pagination LIMIT OFFSET', ...)
})
```

#### `tests/unit/components/ProductCard.test.tsx`
```typescript
describe('<ProductCard />', () => {
  test('renders product name', ...)
  test('renders price in AED by default', ...)
  test('renders price in selected currency', ...)
  test('shows "In Stock" badge when stock_status is in_stock', ...)
  test('shows "Out of Stock" badge and disables Add to Cart', ...)
  test('shows compare price with strikethrough', ...)
  test('calls onAddToCart with product_id and qty=1 on click', ...)
  test('calls onWishlist with product_id on heart click', ...)
  test('renders product image with correct alt text', ...)
  test('truncates product name at 2 lines via CSS class', ...)
})
```

#### `tests/unit/components/CartItem.test.tsx`
```typescript
describe('<CartItem />', () => {
  test('renders item name, SKU, price, qty', ...)
  test('calls onQtyChange when qty stepper incremented', ...)
  test('calls onQtyChange when qty stepper decremented', ...)
  test('prevents qty below 1', ...)
  test('calls onRemove when remove button clicked', ...)
  test('shows line total = unit price × qty', ...)
})
```

#### `tests/unit/components/Breadcrumb.test.tsx`
```typescript
describe('<Breadcrumb />', () => {
  test('renders Home as first item', ...)
  test('renders each path segment as a link except last', ...)
  test('last segment is not a link', ...)
  test('generates correct JSON-LD BreadcrumbList', ...)
})
```

### 10.3 Integration Tests

#### `tests/integration/api/categories.test.ts`
```typescript
describe('GET /api/categories', () => {
  test('returns 200 with full category tree', ...)
  test('only returns active categories', ...)
  test('includes children nested correctly', ...)
})

describe('GET /api/categories/:slug', () => {
  test('returns 200 with correct category by slug', ...)
  test('returns 404 for unknown slug', ...)
  test('includes children array', ...)
})

describe('GET /api/categories/:slug/products', () => {
  test('returns paginated products for category', ...)
  test('returns products for sub-categories (recursive)', ...)
  test('respects page and limit query params', ...)
  test('returns 404 for unknown category slug', ...)
})
```

#### `tests/integration/api/products.test.ts`
```typescript
describe('GET /api/products', () => {
  test('returns paginated products', ...)
  test('filters by category', ...)
  test('filters by brand', ...)
  test('filters by price range', ...)
  test('filters in_stock=true', ...)
  test('sorts by price_asc', ...)
  test('sorts by price_desc', ...)
  test('sorts by newest', ...)
  test('returns correct meta.total', ...)
  test('returns filters.brands aggregation', ...)
})

describe('GET /api/products/:slug', () => {
  test('returns 200 with full product detail', ...)
  test('returns 404 for unknown slug', ...)
  test('includes images array', ...)
  test('includes attributes map', ...)
  test('includes price_tiers for B2B products', ...)
})
```

#### `tests/integration/api/cart.test.ts`
```typescript
describe('Cart API', () => {
  test('GET /api/cart returns empty cart for new session', ...)
  test('POST /api/cart/items adds product to cart', ...)
  test('POST /api/cart/items increments qty for existing item', ...)
  test('POST /api/cart/items returns 404 for unknown product', ...)
  test('POST /api/cart/items returns 400 if out of stock', ...)
  test('PUT /api/cart/items/:id updates quantity', ...)
  test('DELETE /api/cart/items/:id removes item', ...)
  test('DELETE /api/cart clears all items', ...)
  test('POST /api/cart/coupon applies valid coupon', ...)
  test('POST /api/cart/coupon returns 400 for expired coupon', ...)
  test('POST /api/cart/coupon returns 400 for unknown code', ...)
})
```

#### `tests/integration/api/search.test.ts`
```typescript
describe('GET /api/search', () => {
  test('returns results matching product name', ...)
  test('returns results matching SKU', ...)
  test('returns results matching keywords', ...)
  test('returns empty results for no match', ...)
  test('respects category filter', ...)
  test('respects brand filter', ...)
  test('respects price range filter', ...)
  test('returns results within 300ms (performance)', ...)
})
```

#### `tests/integration/api/auth.test.ts`
```typescript
describe('Auth API', () => {
  test('POST /api/auth/register creates user with hashed password', ...)
  test('POST /api/auth/register returns 400 for duplicate email', ...)
  test('POST /api/auth/register returns 422 for invalid email', ...)
  test('POST /api/auth/login returns JWT for valid credentials', ...)
  test('POST /api/auth/login returns 401 for wrong password', ...)
  test('POST /api/auth/login returns 401 for unknown email', ...)
  test('GET /api/auth/me returns user profile for valid JWT', ...)
  test('GET /api/auth/me returns 401 for missing token', ...)
  test('POST /api/auth/logout clears session cookie', ...)
})
```

### 10.4 End-to-End Tests (Playwright)

#### `tests/e2e/homepage.spec.ts`
```typescript
test('homepage loads with hero banner', ...)
test('featured categories grid has 8 items', ...)
test('category links navigate to correct category page', ...)
test('currency selector switches prices', ...)
```

#### `tests/e2e/category-browse.spec.ts`
```typescript
test('category page shows products', ...)
test('breadcrumb shows correct path', ...)
test('sub-category chips filter products', ...)
test('price filter updates product list', ...)
test('brand filter narrows results', ...)
test('in-stock filter removes out-of-stock items', ...)
test('sort by price ascending reorders list', ...)
test('pagination navigates to page 2', ...)
test('SEO footer description is visible', ...)
```

#### `tests/e2e/product-detail.spec.ts`
```typescript
test('product page loads with correct title', ...)
test('product gallery thumbnail click changes main image', ...)
test('quantity stepper increments and decrements', ...)
test('add to cart updates cart icon badge', ...)
test('add to cart opens cart drawer', ...)
test('wishlist button toggles filled/unfilled state', ...)
test('Description tab shows product description', ...)
test('Specifications tab shows attribute table', ...)
test('related products section visible', ...)
```

#### `tests/e2e/search.spec.ts`
```typescript
test('typing in search bar shows autocomplete', ...)
test('pressing enter navigates to search results page', ...)
test('search results show matching products', ...)
test('no-results message shown for gibberish query', ...)
```

#### `tests/e2e/cart.spec.ts`
```typescript
test('cart page shows added items', ...)
test('cart quantity update reflects in total', ...)
test('remove item from cart', ...)
test('apply valid coupon reduces total', ...)
test('invalid coupon shows error message', ...)
test('proceed to checkout button navigates to checkout', ...)
```

#### `tests/e2e/checkout.spec.ts`
```typescript
test('guest checkout completes with valid details', ...)
test('shipping address form validation shows errors', ...)
test('shipping method selection updates order total', ...)
test('payment step shows Stripe form', ...)
test('successful payment shows confirmation page', ...)
test('confirmation page shows order number', ...)
test('confirmation email is triggered', ...)
```

#### `tests/e2e/account.spec.ts`
```typescript
test('register creates new account', ...)
test('login with correct credentials', ...)
test('login with wrong password shows error', ...)
test('dashboard shows recent orders', ...)
test('order detail page shows line items', ...)
test('wishlist page shows saved products', ...)
test('address book add/edit/delete', ...)
```

### 10.5 Accessibility Tests

Using `@axe-core/playwright` in each E2E spec:

```typescript
// Added to every e2e test file
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toHaveLength(0);
});
```

### 10.6 Performance Tests

```typescript
// tests/unit/lib/performance.test.ts
describe('Performance Benchmarks', () => {
  test('category tree query completes in < 50 ms', ...)
  test('product listing query (12 items) completes in < 30 ms', ...)
  test('FTS search query completes in < 100 ms', ...)
  test('cart total calculation completes in < 5 ms', ...)
})
```

---

## 11. Automated Test Execution — CI/CD & Watch Mode

### 11.0 TDD Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│  OPEN NEST TDD CYCLE                                     │
│                                                         │
│  1. WRITE TESTS (all fail — RED)                        │
│     npm run test          → X passing, Y failing        │
│     npm run test:e2e      → all E2E fail (no app yet)   │
│                                                         │
│  2. DEVELOP feature (minimum code to pass tests)        │
│     → implement route / component / lib function        │
│                                                         │
│  3. RUN TESTS (GREEN)                                   │
│     npm run test          → all passing                 │
│     npm run test:e2e      → E2E passing                 │
│                                                         │
│  4. REFACTOR (tests still green)                        │
│                                                         │
│  5. REPEAT from step 2 for next feature                 │
└─────────────────────────────────────────────────────────┘
```

**AI Agent Rule:** After every single file edit, the agent MUST run the mapped test(s) from the table in §11.4 and confirm green before moving to the next file.

### 11.1 Watch Mode (Local Development — AI-auto-run on every save)

```bash
# Run unit + integration tests in watch mode
npm run test:watch

# Run E2E tests in interactive mode
npm run test:e2e:ui
```

**`vitest.config.ts`** — configured to watch `app/**` and re-run related tests:
```typescript
export default defineConfig({
  test: {
    environment: 'miniflare',    // Cloudflare Workers environment
    watch: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx',
              'tests/integration/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      lines: 80,                  // minimum coverage thresholds
      functions: 80,
      branches: 75,
    },
  },
});
```

**`playwright.config.ts`** — E2E auto-run configuration:
```typescript
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 11.2 NPM Scripts

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:e2e",
    "lint": "eslint app tests --ext .ts,.tsx",
    "typecheck": "tsc -b",
    "check:full": "npm run typecheck && npm run lint && npm run test:all"
  }
}
```

### 11.3 GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit & Integration Tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: E2E Tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload E2E results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Workers
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 11.4 AI Auto-Run Contract

When an AI coding agent (GitHub Copilot, Claude, etc.) makes any file change in this project, it MUST:

1. Run `npm run typecheck` — must exit 0 before committing
2. Run `npm test` — all unit and integration tests must pass
3. For changes to `app/routes/**` or `tests/e2e/**`, run `npm run test:e2e`
4. For changes to `app/components/**`, run the specific component test: `vitest run tests/unit/components/[ComponentName].test.tsx`
5. Report test results summary before declaring a task complete
6. If any test fails: fix the implementation (not the test) unless the test itself was the intended change

**File → Test Mapping for Fast Watch:**

| Changed File Pattern | Auto-run Test |
|---|---|
| `app/lib/currency/*` | `tests/unit/lib/currency.test.ts` |
| `app/lib/shipping/*` | `tests/unit/lib/shipping.test.ts` |
| `app/lib/seo/*` | `tests/unit/lib/seo.test.ts` |
| `app/lib/search/*` | `tests/unit/lib/fts.test.ts` |
| `app/components/product/*` | `tests/unit/components/Product*.test.tsx` |
| `app/components/cart/*` | `tests/unit/components/Cart*.test.tsx` |
| `app/routes/api/categories*` | `tests/integration/api/categories.test.ts` |
| `app/routes/api/products*` | `tests/integration/api/products.test.ts` |
| `app/routes/api/cart*` | `tests/integration/api/cart.test.ts` |
| `app/routes/api/auth*` | `tests/integration/api/auth.test.ts` |
| `app/routes/api/search*` | `tests/integration/api/search.test.ts` |
| `app/routes/*.tsx` (non-API) | Corresponding `tests/e2e/*.spec.ts` |

---

## 12. Development Phases & Roadmap

### Phase 1 — Foundation (Weeks 1–2)
**Goal:** Working skeleton with categories, test infrastructure wired up.

- [ ] Configure Vitest + Playwright test runners
- [ ] Write and pass: currency converter tests
- [ ] Write and pass: shipping calculator tests
- [ ] Write and pass: SEO meta builder tests
- [ ] Set up D1 schema and run migrations
- [ ] Seed script: import all categories from itechdevices.ae API
- [ ] Implement `/api/categories` — test-first
- [ ] Implement `<Header />` with category mega-menu
- [ ] Implement basic category page layout (no products yet)
- [ ] Set up GitHub Actions CI

**Exit Criteria:** All Phase 1 tests pass. Category tree renders correctly at `/computer-components`.

### Phase 2 — Product Catalogue (Weeks 3–4)
**Goal:** Products browsable, searchable, with full SEO.

- [ ] Write product API tests → implement `/api/products`
- [ ] Write product detail tests → implement product page
- [ ] Write search tests → implement `/api/search` (FTS5)
- [ ] Implement `<ProductCard />` (test-first)
- [ ] Implement `<ProductGallery />`
- [ ] Implement `<SearchBar />` with autocomplete
- [ ] Implement search results page
- [ ] Structured data (JSON-LD Product + BreadcrumbList)
- [ ] Sitemap XML generation

**Exit Criteria:** Products list on category pages, search works, Lighthouse ≥ 85.

### Phase 3 — Cart & Checkout (Weeks 5–6)
**Goal:** Full purchase flow for guest users.

- [ ] Write cart API tests → implement full cart API
- [ ] Implement `<CartDrawer />` and `/cart` page
- [ ] Write checkout flow tests → implement steps 1–4
- [ ] Integrate Stripe Elements for payment
- [ ] Order creation and confirmation email
- [ ] Guest checkout complete flow E2E test passing

**Exit Criteria:** Guest can complete purchase end-to-end.

### Phase 4 — User Accounts & B2B (Weeks 7–8)
**Goal:** Registered accounts, order history, B2B features.

- [ ] Write auth tests → implement register/login/JWT
- [ ] Implement account dashboard, orders, wishlist, addresses
- [ ] Implement B2B pricing tiers display
- [ ] Implement RFQ flow
- [ ] Implement coupon system (test-first)

**Exit Criteria:** All account E2E tests pass. B2B tier pricing visible on product pages.

### Phase 5 — Hardening & Launch (Weeks 9–10)
**Goal:** Performance, accessibility, full E2E green, deploy.

- [ ] Accessibility audit — fix all axe-core violations
- [ ] Lighthouse optimisation (target ≥ 90)
- [ ] Full E2E test suite green
- [ ] Security audit: CSRF, rate limiting, input validation
- [ ] Admin panel basic CRUD (products, categories, orders)
- [ ] Production deploy to Cloudflare Workers
- [ ] DNS + SSL configuration
- [ ] Monitoring: Cloudflare Analytics + Sentry error tracking

---

## 13. Non-Functional Requirements

### Security
- All passwords hashed with Argon2id (via `@noble/hashes` — edge-compatible)
- JWT signed with RS256, 1-hour expiry, refresh token rotation
- CSRF token on all state-mutating forms
- Rate limiting: login (5 req/min), register (3 req/min), checkout (10 req/min) — via Cloudflare Rate Limiting
- Input sanitization on all user-supplied text
- Content-Security-Policy header on all responses
- No PII logged; PCI compliance: Stripe handles all card data (no card numbers touch our server)

### Performance
| Metric | Target | Measurement |
|---|---|---|
| TTFB (edge-cached) | ≤ 50 ms | Cloudflare Analytics |
| TTFB (uncached SSR) | ≤ 500 ms | Cloudflare Analytics |
| LCP | ≤ 2.5 s | Lighthouse |
| CLS | ≤ 0.1 | Lighthouse |
| FID / INP | ≤ 200 ms | Core Web Vitals |
| Lighthouse Performance | ≥ 90 | Lighthouse CI |
| Search latency (p95) | ≤ 300 ms | Integration test |

### Scalability
- Cloudflare Workers scale to millions of requests/day with zero config
- D1 read replicas for high-read workloads
- R2 CDN for product images — no egress cost

### Observability
- Structured JSON logs from Worker (visible in Cloudflare Logpush)
- Sentry error tracking (edge-compatible `@sentry/cloudflare`)
- Cloudflare Web Analytics for page metrics (no cookies, GDPR-compliant)

### Internationalisation (i18n) Scaffold
- All user-facing strings in `app/i18n/en.json`
- Arabic `app/i18n/ar.json` (RTL) — scaffolded in Phase 5, full translation Phase 6
- `dir` attribute toggled on `<html>` tag
- All monetary values formatted with `Intl.NumberFormat`

---

## 14. Acceptance Criteria Master List

> Each item maps to one or more tests. A feature is **done** only when its acceptance criteria tests pass.

| AC-ID | Feature | Criterion | Test |
|---|---|---|---|
| AC-001 | Categories | Category tree API returns all active categories | `categories.test.ts > returns 200 with full category tree` |
| AC-002 | Categories | Unknown category slug returns 404 | `categories.test.ts > returns 404 for unknown slug` |
| AC-003 | Products | Product listing filtered by category | `products.test.ts > filters by category` |
| AC-004 | Products | Product detail returns all fields | `products.test.ts > returns 200 with full product detail` |
| AC-005 | Products | Out-of-stock filter works | `products.test.ts > filters in_stock=true` |
| AC-006 | Search | Search returns results within 300 ms | `search.test.ts > returns results within 300ms` |
| AC-007 | Search | FTS5 escapes special characters | `fts.test.ts > escapes special characters` |
| AC-008 | Currency | AED→SAR conversion correct | `currency.test.ts > converts AED to SAR using factor 1.02` |
| AC-009 | Currency | Price rounds to 2 dp | `currency.test.ts > rounds to 2 decimal places` |
| AC-010 | Shipping | Free shipping above AED 500 | `shipping.test.ts > returns free shipping for orders over AED 500` |
| AC-011 | Cart | Add to cart persists item | `cart.test.ts > POST /api/cart/items adds product to cart` |
| AC-012 | Cart | Out-of-stock cannot be added | `cart.test.ts > returns 400 if out of stock` |
| AC-013 | Cart | Valid coupon reduces total | `cart.test.ts > POST /api/cart/coupon applies valid coupon` |
| AC-014 | Auth | Registration hashes password | `auth.test.ts > creates user with hashed password` |
| AC-015 | Auth | Login returns JWT | `auth.test.ts > returns JWT for valid credentials` |
| AC-016 | Auth | Wrong password = 401 | `auth.test.ts > returns 401 for wrong password` |
| AC-017 | SEO | Product page has JSON-LD Product schema | `seo.test.ts > generates Product JSON-LD schema` |
| AC-018 | SEO | Breadcrumb JSON-LD correct | `seo.test.ts > generates BreadcrumbList JSON-LD schema` |
| AC-019 | ProductCard | Disabled when out of stock | `ProductCard.test.tsx > shows "Out of Stock" badge and disables Add to Cart` |
| AC-020 | ProductCard | Correct currency display | `ProductCard.test.tsx > renders price in selected currency` |
| AC-021 | Breadcrumb | Last segment not a link | `Breadcrumb.test.tsx > last segment is not a link` |
| AC-022 | E2E Checkout | Guest checkout end-to-end | `checkout.spec.ts > guest checkout completes with valid details` |
| AC-023 | E2E Search | Autocomplete shows results | `search.spec.ts > typing in search bar shows autocomplete` |
| AC-024 | E2E Cart | Qty update reflects in total | `cart.spec.ts > cart quantity update reflects in total` |
| AC-025 | Accessibility | No WCAG 2.1 AA violations | `*.spec.ts > page has no accessibility violations` |
| AC-026 | Performance | Lighthouse ≥ 90 | Lighthouse CI in GH Actions |
| AC-027 | Performance | LCP ≤ 2.5 s | Core Web Vitals report |

---

*End of Open Nest Store Implementation Plan v1.0.0*  
*Document maintained at: `/workspaces/open-nest-store/IMPLEMENTATION_PLAN.md`*  
*Next review: Phase 1 complete (Week 2)*
