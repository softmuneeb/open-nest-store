/**
 * Multi-step checkout flow (guest or logged-in user)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'contact' | 'shipping' | 'method' | 'payment'>('contact');
  const [isGuest, setIsGuest] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    city: '',
    emirate: '',
    postal: '',
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [showAddressErrors, setShowAddressErrors] = useState(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!shippingData.firstName.trim()) errors.firstName = 'First name required';
    if (!shippingData.lastName.trim()) errors.lastName = 'Last name required';
    if (!shippingData.phone.trim()) errors.phone = 'Phone required';
    if (!shippingData.addressLine1.trim()) errors.addressLine1 = 'Address required';
    if (!shippingData.emirate) errors.emirate = 'Emirate required';
    return errors;
  };

  const handleGuestOption = () => {
    setIsGuest(true);
  };

  const handleLoginOption = () => {
    navigate('/login');
  };

  const handleNextStep = () => {
    if (currentStep === 'contact') {
      if (!email) {
        setEmailError('Email is required');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      const errors = validateAddress();
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        setShowAddressErrors(true);
        return;
      }
      setAddressErrors({});
      setShowAddressErrors(false);
      setCurrentStep('method');
    } else if (currentStep === 'method') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      navigate('/checkout/confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase in 3 simple steps</p>
        </div>

        {/* Step Tabs */}
        {(() => {
          const steps = ['Contact', 'Shipping', 'Method', 'Payment'];
          const stepKeys = ['contact', 'shipping', 'method', 'payment'] as const;
          const activeIdx = stepKeys.indexOf(currentStep);
          return (
            <div className="flex items-center justify-between mb-12">
              {steps.map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      idx <= activeIdx ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`ml-3 font-medium ${idx <= activeIdx ? 'text-gray-900' : 'text-gray-600'}`}>
                    {step}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${idx < activeIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        <div className="grid grid-cols-3 gap-8">
          {/* Left: Form Section */}
          <div className="col-span-2">
            {currentStep === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                {/* Auth Choice */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={handleGuestOption}
                    data-testid="checkout-as-guest"
                    className={`p-4 border-2 rounded-lg transition ${
                      isGuest ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Guest Checkout</div>
                    <div className="text-sm text-gray-600">Continue without account</div>
                  </button>
                  <button
                    onClick={handleLoginOption}
                    className={`p-4 border-2 rounded-lg transition ${
                      !isGuest ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Sign In</div>
                    <div className="text-sm text-gray-600">Use existing account</div>
                  </button>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    data-testid="checkout-email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  {emailError && (
                    <p data-testid="email-error" className="text-red-600 text-sm mt-2">
                      {emailError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

                {showAddressErrors && Object.keys(addressErrors).length > 0 && (
                  <div data-testid="address-errors" className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                    <p className="font-semibold mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(addressErrors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                    <input
                      type="text"
                      data-testid="checkout-first-name"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                    <input
                      type="text"
                      data-testid="checkout-last-name"
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    data-testid="checkout-phone"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    placeholder="+971501234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Street Address</label>
                  <input
                    type="text"
                    data-testid="checkout-address-line1"
                    value={shippingData.addressLine1}
                    onChange={(e) => setShippingData({ ...shippingData, addressLine1: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                    <input
                      type="text"
                      data-testid="checkout-city"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      placeholder="Dubai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Emirate</label>
                    <select
                      data-testid="checkout-emirate"
                      value={shippingData.emirate}
                      onChange={(e) => setShippingData({ ...shippingData, emirate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="">Select emirate</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Fujairah">Fujairah</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Postal Code (Optional)</label>
                  <input
                    type="text"
                    data-testid="checkout-postal"
                    value={shippingData.postal}
                    onChange={(e) => setShippingData({ ...shippingData, postal: e.target.value })}
                    placeholder="12345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {currentStep === 'method' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Method</h2>
                <div className="space-y-4">
                  {[
                    { id: 'standard', label: 'Standard Delivery', price: 'AED 15.00', estimate: '3-5 business days' },
                    { id: 'express', label: 'Express Delivery', price: 'AED 35.00', estimate: '1-2 business days' },
                    { id: 'sameday', label: 'Same Day Delivery', price: 'AED 75.00', estimate: 'Today by 10pm' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      data-testid="shipping-method"
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedShippingMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping-method"
                          data-testid={`shipping-method-${method.id}`}
                          value={method.id}
                          checked={selectedShippingMethod === method.id}
                          onChange={() => setSelectedShippingMethod(method.id)}
                          className="text-blue-600"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{method.label}</div>
                          {selectedShippingMethod === method.id && (
                            <div data-testid="shipping-estimate" className="text-sm text-blue-600 mt-1">
                              Estimated: {method.estimate}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">{method.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <p className="text-gray-600 mb-6">Secure payment via Stripe</p>
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-600">Stripe Card Element integration coming soon</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  if (currentStep === 'shipping') setCurrentStep('contact');
                  else if (currentStep === 'method') setCurrentStep('shipping');
                  else if (currentStep === 'payment') setCurrentStep('method');
                }}
                disabled={currentStep === 'contact'}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                data-testid="checkout-next-btn"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {currentStep === 'payment' ? 'Place Order' : 'Continue'}
              </button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-span-1">
            <div data-testid="checkout-summary" className="sticky top-8 p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">1x Product</span>
                  <span className="font-medium">AED 1,200.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">AED 15.00</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">AED 1,215.00</span>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✓ 100% Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

