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

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<header className="bg-white shadow sticky top-0 z-50">
			<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
				<a href="/" data-testid="site-logo" className="font-bold text-2xl text-blue-900">
					[[ Open Nest ]]
				</a>
				<form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
					<input
						data-testid="search-input"
						type="text"
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</form>
				<nav className="flex items-center gap-6 text-sm">
					<a href="/login" data-testid="header-login-link" className="hover:text-blue-600">Account</a>
					<a href="/cart" className="hover:text-blue-600 relative">
						Cart
						<span data-testid="cart-badge" className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 bg-blue-600 text-white text-xs rounded-full px-1">
							{cartCount}
						</span>
					</a>
				</nav>
			</div>
		</header>
	);
}

export default function App() {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}

function Footer() {
	return (
		<footer className="bg-gray-900 text-gray-200 py-12 mt-16">
			<div className="max-w-6xl mx-auto px-4 grid grid-cols-4 gap-8 mb-8">
				<div>
					<h3 className="font-bold mb-4">Categories</h3>
					<ul className="space-y-2 text-sm">
						<li><a href="/shop" className="hover:text-white">All Products</a></li>
						<li><a href="/" className="hover:text-white">Computer Components</a></li>
					</ul>
				</div>
				<div>
					<h3 className="font-bold mb-4">Support</h3>
					<ul className="space-y-2 text-sm">
						<li><a href="#" className="hover:text-white">Help Center</a></li>
						<li><a href="#" className="hover:text-white">Track Order</a></li>
					</ul>
				</div>
				<div>
					<h3 className="font-bold mb-4">Company</h3>
					<ul className="space-y-2 text-sm">
						<li><a href="#" className="hover:text-white">About Us</a></li>
						<li><a href="#" className="hover:text-white">Contact</a></li>
					</ul>
				</div>
				<div>
					<h3 className="font-bold mb-4">Legal</h3>
					<ul className="space-y-2 text-sm">
						<li><a href="#" className="hover:text-white">Privacy</a></li>
						<li><a href="#" className="hover:text-white">Terms</a></li>
					</ul>
				</div>
			</div>
			<div className="border-t border-gray-800 pt-8 text-center text-sm">
				<p>&copy; 2026 Open Nest. All rights reserved.</p>
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
