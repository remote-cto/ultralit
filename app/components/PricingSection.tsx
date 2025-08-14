"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingSection = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Load preferences
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    // Check subscription status
    checkSubscriptionStatus();
  }, [isAuthenticated, router, user]);

  const checkSubscriptionStatus = async () => {
    if (!user?.id) return;

    try {
      setIsCheckingSubscription(true);
      const response = await fetch(`/api/check-subscription?user_id=${user.id}`);
      const data = await response.json();
      
      console.log('Subscription check response:', data);
      
      if (response.ok && data.subscription) {
        // User has an active subscription
        if (data.subscription.status === 'active') {
          console.log('User has active subscription, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        setSubscriptionStatus(data.subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const plans = [
    {
      name: "Free Trial",
      price: "7 Days",
      amount: 0,
      period: " Free",
      description: "Experience everything with no commitment",
      icon: "🚀",
      features: [
        "All AI content access",
        "Daily updates",
        "Basic support",
        "No commitment"
      ],
      buttonColor: "from-green-500 to-emerald-500",
      popular: false
    },
    {
      name: "Students",
      price: "₹10",
      amount: 10,
      period: "/month",
      description: "Perfect for learners and aspiring professionals",
      icon: "🎓",
      features: [
        "All learning content",
        "Student community access",
        "Practice exercises",
        "Email support"
      ],
      buttonColor: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Professionals & Executives",
      price: "₹10",
      amount: 10,
      period: "/month",
      description: "For working professionals and business leaders",
      icon: "💼",
      features: [
        "Premium content access",
        "Executive insights",
        "Priority support",
        "Advanced resources"
      ],
      buttonColor: "from-yellow-400 to-yellow-500",
      popular: true
    }
  ];

  const handlePlanSelection = async (plan: any) => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      if (plan.amount === 0) {
        // Handle free trial
        const response = await fetch('/api/activate-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
            plan_name: plan.name,
            preferences: userPreferences
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          alert('Free trial activated successfully!');
          router.push('/dashboard');
        } else {
          console.error('Failed to activate free trial:', data);
          alert(data.error || 'Failed to activate free trial');
        }
        return;
      }

      // Handle paid plans with Razorpay
      console.log('Creating order for plan:', plan.name, 'Amount:', plan.amount);
      
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: plan.amount, 
          currency: "INR",
          notes: {
            plan_name: plan.name,
            user_id: user?.id
          }
        }),
      });

      const data = await res.json();
      console.log('Order creation response:', data);
      
      if (!data.order) {
        console.error('Order creation failed:', data);
        alert(data.error || "Failed to create payment order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Ultralit",
        description: `${plan.name} Subscription`,
        order_id: data.order.id,
        handler: async function (response: any) {
          console.log('Razorpay payment response:', response);
          
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user?.id,
                plan_name: plan.name,
                amount: plan.amount,
                preferences: userPreferences,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log('Payment verification response:', verifyData);
            
            if (verifyRes.ok && verifyData.success) {
              alert("Payment successful! Welcome to Ultralit!");
              router.push('/dashboard');
            } else {
              console.error('Payment verification failed:', verifyData);
              alert(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#F59E0B" },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment process error:', error);
      alert("Something went wrong. Please try again.");
    } finally {
      if (plan.amount === 0) {
        setIsProcessing(false);
      }
    }
  };

  const goBack = () => {
    router.push('/preferences');
  };

  // Show loading while checking subscription
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Checking your subscription status...</p>
        </div>
      </div>
    );
  }

  // Show loading while preferences are loading
  if (!userPreferences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Choose Your <span className="text-yellow-500">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">Select the perfect plan for your learning journey</p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
          
          {/* Show current subscription status if exists */}
          {subscriptionStatus && (
            <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-orange-800">
                You have a <strong>{subscriptionStatus.status}</strong> subscription for <strong>{subscriptionStatus.plan_name}</strong>.
                {subscriptionStatus.status === 'expired' && ' Please choose a new plan to continue.'}
              </p>
            </div>
          )}
          
          {/* Selected Preferences Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-300 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Selected Preferences</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                📚 {userPreferences.contentType?.replace('-', ' ').toUpperCase()}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                🌐 {userPreferences.language}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                ⏰ {userPreferences.frequency}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 border transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "border-yellow-400 shadow-xl shadow-yellow-200 scale-105"
                  : "border-yellow-200 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-100 rounded-2xl text-4xl">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-yellow-500">
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {plan.description}
                </p>
                
                {/* Features */}
                <div className="mb-8 text-left">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelection(plan)}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.name === "Free Trial" ? "Start Free Trial" : "Choose Plan"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={goBack}
            disabled={isProcessing}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600">Step 3 of 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;