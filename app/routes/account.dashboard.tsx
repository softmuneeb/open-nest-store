/**
 * User account dashboard
 * Shows overview of account, recent orders, and wishlist
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AccountDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
          } else {
            setError('Failed to load account');
          }
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error || 'Not logged in'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, <span data-testid="account-greeting">{user.first_name}</span>!
          </h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/account/orders"
            data-testid="nav-orders"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
          >
            <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
            <div className="text-gray-700 font-medium">Recent Orders</div>
          </Link>
          <Link
            to="/account/wishlist"
            data-testid="nav-wishlist"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-600"
          >
            <div className="text-3xl font-bold text-red-600 mb-1">5</div>
            <div className="text-gray-700 font-medium">Wishlist Items</div>
          </Link>
          <Link
            to="/account/addresses"
            data-testid="nav-addresses"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-green-600"
          >
            <div className="text-3xl font-bold text-green-600 mb-1">2</div>
            <div className="text-gray-700 font-medium">Saved Addresses</div>
          </Link>
          <div
            className="p-6 bg-white rounded-lg shadow border-l-4 border-gray-300"
            data-testid="account-points"
          >
            <div className="text-3xl font-bold text-gray-600 mb-1">240</div>
            <div className="text-gray-700 font-medium">Reward Points</div>
          </div>
          <Link
            to="/account/settings"
            data-testid="nav-account-settings"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-purple-600"
          >
            <div className="text-3xl font-bold text-purple-600 mb-1">⚙</div>
            <div className="text-gray-700 font-medium">Settings</div>
          </Link>
        </div>

        {/* Account Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded border-l-4 border-blue-600">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-gray-900">ORD-2024-ABC123</span>
                  <span className="text-green-600 font-medium">Delivered</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Intel Core i9 × 1</p>
                <p className="text-sm text-gray-700">AED 1,200.00 • Delivered on Mar 2</p>
              </div>
              <div className="p-4 bg-gray-50 rounded border-l-4 border-amber-600">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-gray-900">ORD-2024-XYZ789</span>
                  <span className="text-amber-600 font-medium">In Transit</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Nvidia RTX 4090 × 1</p>
                <p className="text-sm text-gray-700">AED 3,500.00 • Estimated Mar 5</p>
              </div>
            </div>
            <Link to="/account/orders" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 inline-block">
              View All Orders →
            </Link>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-medium text-gray-900">March 1, 2024</p>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium text-sm">
                Edit Profile
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium text-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
          >
            Continue Shopping
          </Link>
          <button
            data-testid="logout-btn"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              navigate('/');
            }}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
