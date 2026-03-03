/**
 * User addresses management page
 */
import { Link } from 'react-router';
import { useState } from 'react';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  city: string;
  emirate: string;
  postal: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1', firstName: 'Alice', lastName: 'Example', phone: '+971501234567',
    line1: '123 Main Street', city: 'Dubai', emirate: 'Dubai', postal: '12345', isDefault: true,
  },
  {
    id: 'addr-2', firstName: 'Alice', lastName: 'Example', phone: '+971509876543',
    line1: '456 Business Ave', city: 'Abu Dhabi', emirate: 'Abu Dhabi', postal: '54321', isDefault: false,
  },
];

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', line1: '', city: '', emirate: '', postal: '' });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = { id: `addr-${Date.now()}`, ...formData, isDefault: addresses.length === 0 };
    setAddresses((prev) => [...prev, newAddr]);
    setShowAddForm(false);
    setFormData({ firstName: '', lastName: '', phone: '', line1: '', city: '', emirate: '', postal: '' });
  };

  const setDefault = (id: string) => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  const deleteAddress = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">My Addresses</h1>
          <Link to="/account/dashboard" className="text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
        </div>

        <div className="mb-8">
          <button data-testid="add-address-btn" onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            + Add New Address
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddAddress} className="mb-8 bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                <input type="text" data-testid="address-first-name" value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                <input type="text" data-testid="address-last-name" value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
              <input type="tel" data-testid="address-phone" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971501234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Street Address</label>
              <input type="text" data-testid="address-line1" value={formData.line1}
                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                placeholder="123 Main Street"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">City</label>
                <input type="text" data-testid="address-city" value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Emirate</label>
                <select data-testid="address-emirate" value={formData.emirate}
                  onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" required>
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
            <div className="flex gap-4 mt-2">
              <button type="submit" data-testid="address-save-btn"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Save Address
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {addresses.map((address) => (
            <div data-testid="address-card" key={address.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{address.firstName} {address.lastName}</h3>
                <div className="flex items-center gap-2">
                  {address.isDefault && (
                    <span data-testid="default-address-badge" className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-700 mb-4">
                <p>{address.phone}</p>
                <p>{address.line1}</p>
                <p>{address.city}, {address.emirate} {address.postal}</p>
              </div>
              <div className="flex gap-4">
                <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">Edit</button>
                {!address.isDefault && (
                  <>
                    <button data-testid="set-default-address" onClick={() => setDefault(address.id)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Set as Default
                    </button>
                    <button onClick={() => deleteAddress(address.id)}
                      className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
