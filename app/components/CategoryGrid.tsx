import { Link } from "react-router";
import { BRAND } from "../lib/brand";

const ICONS: Record<string, JSX.Element> = {
  cpu: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="7" y="7" width="10" height="10" rx="1" /><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" strokeLinecap="round"/>
    </svg>
  ),
  gpu: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2" strokeLinecap="round"/>
      <rect x="5" y="10" width="4" height="4" rx="0.5"/>
    </svg>
  ),
  hdd: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="17" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M6 12h6" strokeLinecap="round"/>
    </svg>
  ),
  network: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
      <path d="M12 7v4M12 11l-5 6M12 11l5 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  board: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="5" height="5" rx="0.5"/>
      <path d="M14 6h4M14 9h4M14 12h4M6 14h12M6 17h12" strokeLinecap="round"/>
    </svg>
  ),
  ram: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="3" y="8" width="18" height="8" rx="1"/>
      <path d="M7 8V6M10 8V6M13 8V6M16 8V6M7 16v2M10 16v2M13 16v2M16 16v2" strokeLinecap="round"/>
    </svg>
  ),
  software: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  server: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/>
      <rect x="3" y="16" width="18" height="5" rx="1"/>
      <circle cx="18" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="12.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

export const CategoryGrid = () => {
  return (
    <section className="py-20 bg-[#F4F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
            Browse by Category
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
            Explore our full range of genuine IT hardware and software — sourced directly from top manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {BRAND.categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-sm border-2 border-transparent hover:border-[#FF6B2B] hover:shadow-md transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-xl bg-[#F4F7FA] group-hover:bg-[#FF6B2B]/10 flex items-center justify-center text-[#0A2540] group-hover:text-[#FF6B2B] transition-colors">
                {ICONS[cat.icon]}
              </div>
              <div>
                <h3 className="font-bold text-[#0A2540] text-base">{cat.label}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{cat.count} products</p>
              </div>
              <span className="text-xs font-semibold text-[#FF6B2B] opacity-0 group-hover:opacity-100 transition-opacity">
                Shop now →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
