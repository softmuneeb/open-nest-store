/**
 * User orders list page
 */
import { Link } from 'react-router';

export default function AccountOrdersPage() {
  const orders = [
    {
      number: 'ORD-2024-ABC123',
      date: '2024-03-02',
      status: 'Delivered',
      total: 'AED 1,200.00',
      items: 1,
    },
    {
      number: 'ORD-2024-XYZ789',
      date: '2024-02-28',
      status: 'In Transit',
      total: 'AED 3,500.00',
      items: 1,
    },
    {
      number: 'ORD-2024-DEF456',
      date: '2024-02-15',
      status: 'Delivered',
      total: 'AED 599.99',
      items: 3,
    },
  ];

  const statusColor: Record<string, string> = {
    Delivered: 'text-green-600 bg-green-50',
    'In Transit': 'text-amber-600 bg-amber-50',
    Pending: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          <Link to="/account/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>

        {orders.length === 0 ? (
          <div data-testid="orders-empty" className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">You have no orders yet.</p>
          </div>
        ) : (
          <div data-testid="orders-list" className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.number}
                data-testid="order-item"
                to={`/account/orders/${order.number}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{order.number}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{order.date}</p>
                </div>
                <div>
                  <p className="text-gray-600">Items</p>
                  <p className="font-medium text-gray-900">{order.items}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-medium text-gray-900">{order.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-medium">View Details →</p>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
