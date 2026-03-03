import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/shop", "routes/shop.tsx"),
  route("/search", "routes/search.tsx"),
  route("/category/:slug", "routes/category.$slug.tsx"),
  route("/product/:slug", "routes/product.$slug.tsx"),
  route("/cart", "routes/cart.tsx"),

  // ── Checkout ──────────────────────────────────────────────────────────────
  route("/checkout", "routes/checkout.tsx"),
  route("/checkout/confirmation", "routes/checkout.confirmation.tsx"),

  // ── Auth ──────────────────────────────────────────────────────────────────
  route("/register", "routes/register.tsx"),
  route("/login", "routes/login.tsx"),

  // ── Account ───────────────────────────────────────────────────────────────
  route("/account/dashboard", "routes/account.dashboard.tsx"),
  route("/account/orders", "routes/account.orders.tsx"),
  route("/account/orders/:number", "routes/account.orders.$number.tsx"),
  route("/account/wishlist", "routes/account.wishlist.tsx"),
  route("/account/addresses", "routes/account.addresses.tsx"),

  // ── Catalog (API) ─────────────────────────────────────────────────────────
  route("/api/categories", "routes/api/categories.ts"),
  route("/api/categories/:slug", "routes/api/categories.$slug.ts"),
  route("/api/products", "routes/api/products.ts"),
  route("/api/products/:slug", "routes/api/products.$slug.ts"),
  route("/api/search", "routes/api/search.ts"),

  // ── Auth (API) ────────────────────────────────────────────────────────────
  route("/api/auth/register", "routes/api/auth.register.ts"),
  route("/api/auth/login", "routes/api/auth.login.ts"),
  route("/api/auth/me", "routes/api/auth.me.ts"),
  route("/api/auth/logout", "routes/api/auth.logout.ts"),

  // ── Cart (API) ────────────────────────────────────────────────────────────
  route("/api/cart", "routes/api/cart.ts"),
  route("/api/cart/items/:id", "routes/api/cart.items.$id.ts"),
  route("/api/cart/coupon", "routes/api/cart.coupon.ts"),
] satisfies RouteConfig;
