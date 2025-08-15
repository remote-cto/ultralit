'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define types for subscription and preferences
interface Subscription {
  plan_name: string;
  status: string;
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

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

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

        if (subData.success) {
          setSubscription(subData.subscription);
        }
        if (prefData.success) {
          setPreferences(prefData.preferences);
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

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="animate-pulse text-lg font-medium text-gray-700">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-100 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800">
            Welcome to Ultralit, <span className="text-yellow-600">{user?.name}</span>!
          </h1>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your Subscription
            </h2>
            {subscription ? (
              <p className="text-gray-700">
                <span className="font-medium">{subscription.plan_name}</span> —{" "}
                <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                  {subscription.status}
                </span>
              </p>
            ) : (
              <p className="text-gray-500 italic">No active subscription</p>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your Preferences
            </h2>
            {preferences ? (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Role: <span className="font-medium">{preferences.role}</span></li>
                <li>Industry: <span className="font-medium">{preferences.industry}</span></li>
                <li>Language: <span className="font-medium">{preferences.language}</span></li>
                <li>Preferred Mode: <span className="font-medium">{preferences.preferred_mode}</span></li>
                <li>Frequency: <span className="font-medium">{preferences.frequency}</span></li>
                <li>Topics: <span className="font-medium">
                  {Array.isArray(preferences.topic_ids)
                    ? preferences.topic_ids.join(", ")
                    : preferences.topic_ids}
                </span></li>
              </ul>
            ) : (
              <p className="text-gray-500 italic">No preferences set</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
