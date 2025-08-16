'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Settings, CreditCard, LogOut, BookOpen, Edit2, Save, X } from 'lucide-react';

// Define types
interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  start_date: string;
  next_renewal_date: string | null;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  topics?: string[];
}

interface Preferences {
  role: string;
  industry: string;
  language: string;
  preferred_mode: string;
  frequency: string;
  topic_ids: string[] | string;
}

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState(false);

  // Options for preferences
  const roleOptions = ["Student", "Professional", "Entrepreneur", "CXO", "Faculty"];
  const industryOptions = [
    "Healthcare", "Finance / Banking", "Education", "Manufacturing", 
    "Retail / eCommerce", "Logistics", "Legal / Compliance", 
    "Marketing & Advertising", "Government / Public Sector", 
    "Media / Entertainment", "Agritech", "Others"
  ];
  const languageOptions = ["Hindi", "English"];
  const modeOptions = ["Whatsapp", "Email"];
  const frequencyOptions = ["Weekly", "Bi-Weekly"];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const [subRes, prefRes] = await Promise.all([
          fetch(`/api/check-subscription?user_id=${user?.id}`),
          fetch(`/api/get-user-preferences?user_id=${user?.id}`)
        ]);

        const subData = await subRes.json();
        const prefData = await prefRes.json();

        if (subData.success && subData.hasSubscription) {
          setSubscription(subData.subscription);
        }
        if (prefData.success) {
          setPreferences(prefData.preferences);
          setEditedPreferences(prefData.preferences);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchData();
    }
  }, [isAuthenticated, user?.id, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSavePreferences = async () => {
    if (!editedPreferences || !user?.id) return;

    setSaving(true);
    try {
      const response = await fetch('/api/update-user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          role: editedPreferences.role,
          industry: editedPreferences.industry,
          language: editedPreferences.language,
          preferred_mode: editedPreferences.preferred_mode,
          frequency: editedPreferences.frequency
        })
      });

      const data = await response.json();
      if (data.success) {
        setPreferences(editedPreferences);
        setEditingPreferences(false);
        // Show success message
        alert('Preferences updated successfully!');
      } else {
        alert('Failed to update preferences: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Error updating preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPreferences(preferences);
    setEditingPreferences(false);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[currency?.toUpperCase()] || currency;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="animate-pulse text-lg font-medium text-gray-700">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <BookOpen className="mr-3 text-blue-600" />
        My Subscriptions
      </h2>
      
      <div className="bg-white rounded-xl p-6 shadow-lg">
        {subscription ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{subscription.plan_name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : subscription.status === 'expired'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {subscription.status}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-gray-700">Plan Amount</h4>
                <p className="text-gray-800">{getCurrencySymbol(subscription.currency)}{subscription.amount}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Start Date</h4>
                <p className="text-gray-800">{formatDate(subscription.start_date)}</p>
              </div>
              {subscription.next_renewal_date && (
                <div>
                  <h4 className="font-medium text-gray-700">Next Renewal</h4>
                  <p className="text-gray-800">{formatDate(subscription.next_renewal_date)}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-700">Status</h4>
                <p className="text-gray-800">{subscription.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            
            {subscription.topics && subscription.topics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Subscribed Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.topics.map((topic, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No active subscription</p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-3 text-blue-600" />
          Settings
        </h2>
        {!editingPreferences ? (
          <button
            onClick={() => setEditingPreferences(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Preferences
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        {preferences ? (
          <div className="space-y-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              {editingPreferences ? (
                <select
                  value={editedPreferences?.role || ''}
                  onChange={(e) => setEditedPreferences(prev => prev ? {...prev, role: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{preferences.role}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              {editingPreferences ? (
                <select
                  value={editedPreferences?.industry || ''}
                  onChange={(e) => setEditedPreferences(prev => prev ? {...prev, industry: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{preferences.industry}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              {editingPreferences ? (
                <select
                  value={editedPreferences?.language || ''}
                  onChange={(e) => setEditedPreferences(prev => prev ? {...prev, language: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languageOptions.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{preferences.language}</p>
              )}
            </div>

            {/* Preferred Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Mode</label>
              {editingPreferences ? (
                <select
                  value={editedPreferences?.preferred_mode || ''}
                  onChange={(e) => setEditedPreferences(prev => prev ? {...prev, preferred_mode: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {modeOptions.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{preferences.preferred_mode}</p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              {editingPreferences ? (
                <select
                  value={editedPreferences?.frequency || ''}
                  onChange={(e) => setEditedPreferences(prev => prev ? {...prev, frequency: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{preferences.frequency}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No preferences found</p>
        )}
      </div>
    </div>
  );

  const renderPaymentInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <CreditCard className="mr-3 text-blue-600" />
        Payment Information
      </h2>
      
      <div className="bg-white rounded-xl p-6 shadow-lg">
        {subscription ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Plan Name</h3>
                <p className="text-gray-800">{subscription.plan_name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Amount</h3>
                <p className="text-gray-800">{getCurrencySymbol(subscription.currency)}{subscription.amount}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Currency</h3>
                <p className="text-gray-800">{subscription.currency}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Subscription Start Date</h3>
                <p className="text-gray-800">{formatDate(subscription.start_date)}</p>
              </div>
              {subscription.next_renewal_date && (
                <div>
                  <h3 className="font-medium text-gray-700">Next Billing Date</h3>
                  <p className="text-gray-800">{formatDate(subscription.next_renewal_date)}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-700">Payment Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : subscription.status === 'expired'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {subscription.status}
                </span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Subscription Details</h4>
              <div className="text-sm text-blue-700">
                <p>Created: {formatDate(subscription.created_at)}</p>
                <p>Last Updated: {formatDate(subscription.updated_at)}</p>
                {/* <p>Subscription ID: #{subscription.id}</p> */}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No payment information available</p>
            <p className="text-gray-400 text-sm mt-2">Subscribe to a plan to see payment details</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-800">
              Welcome back, <span className="text-yellow-600">{user?.name}</span>!
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'subscriptions', label: 'My Subscriptions', icon: BookOpen },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'payment', label: 'Payment Information', icon: CreditCard }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'payment' && renderPaymentInfo()}
        </div>
      </div>
    </div>
  );
}