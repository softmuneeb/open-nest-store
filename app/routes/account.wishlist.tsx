/**
 * User wishlist page
 */
import { Link } from 'react-router';

export default function AccountWishlistPage() {
  const wishlistItems = [
    {
      id: 'p1',
      name: 'Nvidia RTX 4090',
      price: 'AED 3,500.00',
      stock: 'In Stock',
      image: '/default-product.jpg',
      slug: 'nvidia-rtx-4090',
    },
    {
      id: 'p2',
      name: 'Corsair Vengeance RAM',
      price: 'AED 350.00',
      stock: 'In Stock',
      image: '/default-product.jpg',
      slug: 'corsair-vengeance-ram',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          <Link to="/account/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div data-testid="wishlist-container" className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div data-testid="wishlist-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div data-testid="wishlist-item" key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="w-full h-48 bg-gray-200">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-blue-600">{item.price}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {item.stock}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to={`/product/${item.slug}`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
                    >
                      View Product
                    </Link>
                    <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
