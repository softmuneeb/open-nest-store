import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigate,
} from "react-router";
import { useState, useEffect } from "react";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#0F3460" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

function Header() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [cartCount, setCartCount] = useState(0);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "/" && e.target === document.body) {
				e.preventDefault();
				document.querySelector('[data-testid="search-input"]')?.focus();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		const fetchCartCount = async () => {
			try {
				const res = await fetch('/api/cart');
				if (res.ok) {
					const data = await res.json();
					setCartCount(data?.totals?.item_count ?? 0);
				}
			} catch { /* ignore */ }
		};
		fetchCartCount();
		const handler = () => fetchCartCount();
		window.addEventListener('cart-updated', handler);
		return () => window.removeEventListener('cart-updated', handler);
	}, []);

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<header className="bg-white shadow sticky top-0 z-50">
			<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
				<a href="/" data-testid="site-logo" className="font-bold text-2xl text-blue-900 shrink-0">
					Open Nest
				</a>
				<form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
					<input
						data-testid="search-input"
						type="text"
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full border rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</form>
				<nav className="hidden md:flex items-center gap-6 text-sm">
					<select
						data-testid="currency-switcher"
						aria-label="Select currency"
						className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700"
					>
						<option value="AED">AED</option>
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
					</select>
					<a href="/login" data-testid="header-login-link" className="text-gray-900 hover:text-blue-600 transition-colors">Account</a>
					<a href="/cart" data-testid="cart-icon" className="text-gray-900 hover:text-blue-600 transition-colors relative flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 8h14M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
						</svg>
						Cart
						<span data-testid="cart-badge" className="inline-flex items-center justify-center min-w-[1.25rem] h-5 bg-blue-600 text-white text-xs rounded-full px-1">
							{cartCount}
						</span>
					</a>
				</nav>
				<button
					data-testid="mobile-menu-toggle"
					aria-label="Toggle mobile menu"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="md:hidden p-2 text-gray-700"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
					<form onSubmit={handleSearchSubmit} className="mt-3 mb-3">
						<input
							type="text"
							placeholder="Search products..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full border rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
						/>
					</form>
					<nav className="flex flex-col gap-3 text-sm">
						<a href="/login" className="text-gray-900 hover:text-blue-600 transition-colors">Account</a>
						<a href="/cart" className="text-gray-900 hover:text-blue-600 transition-colors">Cart ({cartCount})</a>
					</nav>
				</div>
			)}
		</header>
	);
}

export default function App() {
	return (
		<>
			{/* Announcement bar */}
			<div className="bg-blue-950 text-blue-100 text-center text-xs py-2 px-4">
				🚚 Free delivery across UAE on orders over <strong className="text-white">AED 500</strong>
				&nbsp;·&nbsp;
				📞 24/7 Technical Support: <a href="tel:+97144000000" className="text-white font-semibold hover:underline">+971 4 400 0000</a>
			</div>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}

function Footer() {
	return (
		<footer className="bg-gray-900 text-gray-200 py-12 mt-16">
			<div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
				{/* Brand column */}
				<div>
					<h3 className="font-bold text-white text-lg mb-4">[[ Open Nest ]]</h3>
					<p className="text-sm text-gray-400 mb-4">
						Your trusted source for genuine computer hardware, networking equipment and IT peripherals across the UAE.
					</p>
					<div data-testid="social-links" className="flex gap-4">
						<a href="https://twitter.com" aria-label="Twitter" className="hover:text-white transition-colors">
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
						</a>
						<a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-white transition-colors">
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
						</a>
						<a href="https://facebook.com" aria-label="Facebook" className="hover:text-white transition-colors">
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
						</a>
					</div>
				</div>

				{/* Featured Categories */}
				<div>
					<h3 className="font-bold text-white mb-4">Featured Categories</h3>
					<ul className="space-y-2 text-sm" data-testid="footer-categories">
						<li><a href="/shop" className="hover:text-white transition-colors">All Products</a></li>
						<li><a href="/category/computer-components" className="hover:text-white transition-colors">Computer Components</a></li>
						<li><a href="/category/cpus-processors" className="hover:text-white transition-colors">CPUs &amp; Processors</a></li>
						<li><a href="/category/motherboards" className="hover:text-white transition-colors">Motherboards</a></li>
						<li><a href="/category/ram-memory" className="hover:text-white transition-colors">RAM &amp; Memory</a></li>
						<li><a href="/category/networking" className="hover:text-white transition-colors">Networking Equipment</a></li>
					</ul>
				</div>

				{/* Customer Services */}
				<div>
					<h3 className="font-bold text-white mb-4">Customer Services</h3>
					<ul className="space-y-2 text-sm" data-testid="footer-customer-services">
						<li><a href="/account/orders" className="hover:text-white transition-colors">Track Your Order</a></li>
						<li><a href="/account/dashboard" className="hover:text-white transition-colors">My Account</a></li>
						<li><a href="#" className="hover:text-white transition-colors">Returns &amp; Refunds</a></li>
						<li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
						<li><a href="#" className="hover:text-white transition-colors">Delivery Information</a></li>
					</ul>
				</div>

				{/* Corporate Info + Contact */}
				<div>
					<h3 className="font-bold text-white mb-4">Corporate Information</h3>
					<ul className="space-y-2 text-sm mb-5">
						<li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
						<li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
						<li><a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
					</ul>
					<div data-testid="footer-contact" className="text-sm text-gray-400 space-y-1">
						<p>📍 Dubai, United Arab Emirates</p>
						<p>📞 <a href="tel:+97144000000" className="hover:text-white transition-colors">+971 4 400 0000</a></p>
						<p>✉️ <a href="mailto:info@opennest.ae" className="hover:text-white transition-colors">info@opennest.ae</a></p>
					</div>
				</div>
			</div>
			<div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
				<p>&copy; {new Date().getFullYear()} Open Nest. All rights reserved. Prices in AED.</p>
			</div>
		</footer>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
