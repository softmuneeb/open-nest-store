import { useState } from "react";
import { Link, useLocation } from "react-router";
import { BRAND } from "../lib/brand";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">
      {/* Top info bar */}
      <div className="bg-[#0A2540] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#FF6B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {BRAND.phone}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#FF6B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {BRAND.email}
            </span>
          </div>
          <span className="text-[#FF6B2B] font-semibold hidden sm:block">
            🚚 Free delivery on orders above AED 500
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        aria-label="Main navigation"
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">...
          </Link>
          {/* ... remaining component omitted for brevity ... */}
        </div>
      </nav>
    </header>
  );
};
