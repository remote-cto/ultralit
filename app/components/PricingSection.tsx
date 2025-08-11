"use client";

import FadeInUp from "./FadeInUp";
import { useAuth } from "../contexts/AuthContext"; 
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingSection = () => {
  const { isAuthenticated, user } = useAuth();
  const [showLoginMessage, setShowLoginMessage] = useState(false);

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
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 4000);
      return;
    }

    if (plan.amount === 0) {
      alert("Free trial activated!");
      return;
    }

    try {
      // Create Razorpay order
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

      // Razorpay Checkout Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Your App Name",
        description: `${plan.name} Subscription`,
        order_id: data.order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user?.id,
              topic_id: null,
              subscription_id: null,
              amount: plan.amount,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Subscription activated.");
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#F37254" },
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
        <FadeInUp>
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
        </FadeInUp>

        {showLoginMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl border border-red-600 max-w-md mx-auto animate-bounce">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 
                    1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 
                    0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-semibold">Please login first to access the plans!</span>
              </div>
              <button 
                onClick={() => setShowLoginMessage(false)}
                className="ml-2 text-white hover:text-gray-200 font-bold text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <FadeInUp key={index} delay={200 + index * 200}>
              <div
                className={`relative bg-yellow-50 rounded-3xl p-8 border ${
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
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
