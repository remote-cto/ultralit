"use client";

import { useAuth } from "../contexts/AuthContext"; 
import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingSection = () => {
  const { isAuthenticated, user } = useAuth();
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const router = useRouter();

  const plans = [
    {
      name: "Students",
      price: "₹200",
      amount: 200,
      period: "/month",
      description: "Perfect for learners and aspiring professionals",
      icon: "🎓",
      popular: false,
      buttonColor: "from-blue-500 to-cyan-500"
    },
    {
      name: "Professionals & Executives",
      price: "₹500",
      amount: 500,
      period: "/month",
      description: "For working professionals and business leaders",
      icon: "💼",
      popular: true,
      buttonColor: "from-yellow-400 to-yellow-500"
    },
    {
      name: "Free Trial",
      price: "7 Days",
      amount: 0,
      period: " Free",
      description: "Experience everything with no commitment",
      icon: "🚀",
      popular: false,
      buttonColor: "from-green-500 to-emerald-500"
    }
  ];

  const handlePlanClick = async (plan: any) => {
    if (!isAuthenticated) {
      // Show login message and redirect to auth
      setShowLoginMessage(true);
      setTimeout(() => {
        setShowLoginMessage(false);
        router.push('/auth');
      }, 2000);
      return;
    }

    // If user is authenticated, check if they have completed preferences
    const hasPreferences = localStorage.getItem('userPreferences');
    
    if (!hasPreferences) {
      // Redirect to preferences first
      router.push('/preferences');
      return;
    }

    // If they have preferences, proceed with payment
    if (plan.amount === 0) {
      // Handle free trial
      try {
        const response = await fetch('/api/activate-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
            preferences: JSON.parse(hasPreferences)
          }),
        });

        if (response.ok) {
          alert('Free trial activated successfully!');
          router.push('/dashboard');
        } else {
          alert('Failed to activate free trial');
        }
      } catch (error) {
        console.error('Error activating trial:', error);
        alert('Something went wrong');
      }
      return;
    }

    // Handle paid plans
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.amount, currency: "INR" }),
      });

      const data = await res.json();
      if (!data.order) {
        alert("Failed to create payment order");
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
              preferences: JSON.parse(hasPreferences),
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Welcome to Ultralit!");
            router.push('/dashboard');
          } else {
            alert("Payment verification failed");
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
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <section id="pricing" className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
            Investment in{" "}
            <span className="text-yellow-500">Your Future</span>
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that accelerates your professional growth
          </p>
        </div>

        {showLoginMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-xl border border-blue-600 max-w-md mx-auto animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Redirecting to login...</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-yellow-50 rounded-3xl p-8 border ${
                plan.popular
                  ? "border-yellow-400 shadow-xl shadow-yellow-200 scale-105"
                  : "border-yellow-200 shadow-lg"
              } hover:scale-110 transition-all duration-500 group`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-100 rounded-2xl text-4xl group-hover:scale-110 transition-transform duration-300">
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
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {plan.description}
                </p>
                <button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg`}
                >
                  {plan.name === "Free Trial"
                    ? "Start Free Trial"
                    : "Choose Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action for Authentication */}
        {!isAuthenticated && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ready to start your AI learning journey?</p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
            >
              Get Started →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;