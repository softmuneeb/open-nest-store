/**
 * Checkout confirmation page
 * Shown after order is successfully placed
 */
import { Link } from 'react-router';

export default function CheckoutConfirmationPage() {
  const orderNumber = 'ORD-2024-' + Math.random().toString(36).substring(7).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
              <p className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Estimated Delivery</p>
              <p className="text-2xl font-bold text-gray-900">3-5 Business Days</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">AED 1,215.00</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Check your email for order confirmation</li>
              <li>✓ Your order is being prepared for shipment</li>
              <li>✓ You'll receive a tracking number via email</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            <p className="text-gray-700">
              John Doe<br />
              123 Main Street<br />
              Dubai, UAE 12345
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            to="/account/orders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
          >
            View Order Details
          </Link>
          <Link to="/" className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 text-center">
            Continue Shopping
          </Link>
        </div>

        {/* Guest to Account Signup Prompt */}
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Create an Account</h3>
          <p className="text-gray-600 mb-4">Save your addresses, track orders, and get personalized recommendations</p>
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign Up Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
