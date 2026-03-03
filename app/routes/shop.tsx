import type { Route } from './+types/shop';
import { getDb } from '~/lib/db/mongodb';
import type { CategoryDocument } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Shop All Products — Open Nest' },
    { name: 'description', content: 'Browse all computer components and IT equipment.' },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);

  // Load all top-level categories
  const categories = await db
    .collection<CategoryDocument>('categories')
    .find({ parent_id: null, active: true })
    .toArray();

  return {
    categories: categories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      url: `/${c.slug}`,
    })),
  };
}

export default function Shop({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <a href="/" className="hover:text-gray-900">Home</a>
          <span>/</span>
          <span className="text-gray-900">Shop</span>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Shop All Categories</h1>
        <p className="text-gray-600">Browse computer components and IT equipment by category.</p>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loaderData.categories.map((category) => (
            <a
              key={category.id}
              href={category.url}
              data-testid="category-card"
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 data-testid="category-name" className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-red-600 font-semibold text-sm mt-2 group-hover:underline">Browse →</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
