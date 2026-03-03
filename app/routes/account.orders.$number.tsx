/**
 * Individual order detail page
 */
import { useParams, Link } from 'react-router';

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderNumber = params.number || 'ORD-2024-ABC123';

  const order = {
    number: orderNumber,
    date: '2024-03-02',
    status: 'Delivered',
    deliveredDate: '2024-03-05',
    total: 'AED 1,200.00',
    items: [
      {
        id: 'item-1',
        name: 'Intel Core i9-14900K',
        sku: 'INT-I9-14900K-001',
        quantity: 1,
        price: 'AED 1,200.00',
        image: '/default-product.jpg',
      },
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Dubai',
      emirate: 'Dubai',
      postal: '12345',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/account/orders" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order {orderNumber}</h1>
          <p className="text-gray-600">Placed on {order.date}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.status}</p>
                  <p className="text-sm text-gray-600">on {order.deliveredDate}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
              <p className="text-gray-900 mb-1">{order.shipping.name}</p>
              <p className="text-gray-700 mb-1">{order.shipping.address}</p>
              <p className="text-gray-700">
                {order.shipping.city}, {order.shipping.emirate} {order.shipping.postal}
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">AED 1,200.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">AED 0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">AED 0.00</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{order.total}</span>
              </div>

              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Download Invoice
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50">
                  Track Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
