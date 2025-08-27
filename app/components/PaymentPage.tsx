// Complete PaymentPage.tsx - For per-topic payment system

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  amount: number;
  currency: string;
  duration_days: number;
  is_trial: boolean;
  features: {
    features: string[];
  };
  sort_order: number;
}

interface UserTopic {
  topic_id: number;
  topic_name: string;
  payment_status: string;
  purchased_date: string;
  amount_paid?: number;
  plan_name?: string;
}

const PaymentPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<{[key: number]: boolean}>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{id: number, name: string} | null>(null);
  const [userTopics, setUserTopics] = useState<UserTopic[]>([]);
  const [loadingUserTopics, setLoadingUserTopics] = useState(true);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setIsRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const existingScript = document.querySelector('script[src*="razorpay"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => {
            setIsRazorpayLoaded(true);
            resolve(true);
          });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          setIsRazorpayLoaded(true);
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Razorpay script:', error);
          alert('Failed to load payment gateway. Please refresh the page and try again.');
          resolve(false);
        };

        document.head.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    loadUserData();
    loadSelectedTopic();
  }, [isAuthenticated, router, user]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      const [plansRes, userTopicsRes] = await Promise.all([
        fetch("/api/getplans"),
        fetch(`/api/get-user-topics?user_id=${user.id}`)
      ]);

      // Handle plans
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success && plansData.plans) {
          setPlans(plansData.plans);
        } else {
          console.error("Failed to load plans:", plansData.error);
          alert("Failed to load payment plans. Please refresh the page.");
        }
      } else {
        console.error("Failed to load plans");
        alert("Failed to load payment plans. Please refresh the page.");
      }

      // Handle user topics
      if (userTopicsRes.ok) {
        const topicsData = await userTopicsRes.json();
        if (topicsData.success) {
          setUserTopics(topicsData.topics || []);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Error loading data. Please refresh the page.");
    } finally {
      setIsLoadingPlans(false);
      setLoadingUserTopics(false);
    }
  };

  const loadSelectedTopic = () => {
    const topicId = sessionStorage.getItem("selectedTopicForPayment");
    const topicName = sessionStorage.getItem("selectedTopicName");
    
    if (topicId && topicName) {
      setSelectedTopic({
        id: parseInt(topicId, 10),
        name: topicName
      });
    }
  };

  // Check if user already purchased this specific topic
  const isTopicAlreadyPurchased = () => {
    if (!selectedTopic) return false;
    return userTopics.some(topic => 
      topic.topic_id === selectedTopic.id && 
      topic.payment_status === 'completed'
    );
  };

  // Convert database plan to display format
  const convertPlanToDisplayFormat = (plan: Plan) => {
    const planIcons = {
      "Free Trial": "🚀",
      Students: "🎓",
      "Professionals & Executives": "💼",
    };

    const planColors = {
      "Free Trial": "from-green-500 to-emerald-500",
      Students: "from-blue-500 to-cyan-500",
      "Professionals & Executives": "from-yellow-400 to-yellow-500",
    };

    return {
      id: plan.id,
      name: plan.name,
      price: plan.is_trial ? `${plan.duration_days} Days` : `₹${plan.amount}`,
      amount: plan.amount,
      period: plan.is_trial ? " Free" : "/topic",
      description: plan.description + " - Valid for this topic only",
      icon: planIcons[plan.name as keyof typeof planIcons] || "📦",
      features: plan.features?.features || [],
      buttonColor:
        planColors[plan.name as keyof typeof planColors] ||
        "from-gray-500 to-gray-600",
      popular: plan.name === "Professionals & Executives",
      disabled: false,
      is_trial: plan.is_trial,
      duration_days: plan.duration_days,
    };
  };

  const handlePlanSelection = async (plan: any) => {
    if (isProcessing[plan.id] || !selectedTopic) return;

    // Check if topic is already purchased
    if (isTopicAlreadyPurchased()) {
      alert("You have already purchased this topic! Redirecting to your dashboard.");
      router.push("/dashboard");
      return;
    }

    setIsProcessing(prev => ({ ...prev, [plan.id]: true }));

    try {
      if (plan.amount === 0 || plan.is_trial) {
        // Handle free trial for specific topic
        const response = await fetch("/api/purchase-topic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            topic_id: selectedTopic.id,
            plan_name: plan.name,
            amount: 0,
            payment_status: "completed",
            duration_days: plan.duration_days,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert(`Free trial activated for "${selectedTopic.name}" successfully!`);
          sessionStorage.removeItem("selectedTopicForPayment");
          sessionStorage.removeItem("selectedTopicName");
          router.push("/dashboard");
        } else {
          console.error("Failed to activate free trial:", data);
          alert(data.error || "Failed to activate free trial");
        }
        return;
      }

      // Check if Razorpay is loaded before proceeding with paid plans
      if (!isRazorpayLoaded || !window.Razorpay) {
        alert("Payment gateway is still loading. Please wait a moment and try again.");
        setIsProcessing(prev => ({ ...prev, [plan.id]: false }));
        return;
      }

      // Handle paid plans with Razorpay
      console.log("Creating order for plan:", plan.name, "Amount:", plan.amount, "Topic:", selectedTopic.name);

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.amount,
          currency: "INR",
          notes: {
            plan_name: plan.name,
            user_id: user?.id,
            topic_id: selectedTopic.id,
            topic_name: selectedTopic.name,
            payment_type: "topic_purchase",
            duration_days: plan.duration_days,
          },
        }),
      });

      const data = await res.json();
      console.log("Order creation response:", data);

      if (!data.order) {
        console.error("Order creation failed:", data);
        alert(data.error || "Failed to create payment order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "ByteDrop",
        description: `${plan.name} - ${selectedTopic.name}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          console.log("Razorpay payment response:", response);

          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user?.id,
                topic_id: selectedTopic.id,
                plan_name: plan.name,
                amount: plan.amount,
                payment_type: "topic_purchase",
                duration_days: plan.duration_days,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log("Payment verification response:", verifyData);

            if (verifyRes.ok && verifyData.success) {
              alert(`Payment successful! You now have access to "${selectedTopic.name}"`);
              sessionStorage.removeItem("selectedTopicForPayment");
              sessionStorage.removeItem("selectedTopicName");
              router.push("/dashboard");
            } else {
              console.error("Payment verification failed:", verifyData);
              alert(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(prev => ({ ...prev, [plan.id]: false }));
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setIsProcessing(prev => ({ ...prev, [plan.id]: false }));
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#F59E0B" },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(prev => ({ ...prev, [plan.id]: false }));
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment process error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      if (plan.amount === 0 || plan.is_trial) {
        setIsProcessing(prev => ({ ...prev, [plan.id]: false }));
      }
    }
  };

  const goBack = () => {
    router.push("/topic-selection");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // Show loading while checking plans or user topics
  if (isLoadingPlans || loadingUserTopics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">
            {isLoadingPlans ? "Loading payment plans..." : "Loading your topics..."}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Topic Selected</h2>
            <p className="text-gray-600 mb-6">Please select a topic first before proceeding to payment.</p>
            <button
              onClick={() => router.push("/topic-selection")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Select Topic
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Check if topic is already purchased
  if (isTopicAlreadyPurchased()) {
    const purchasedTopic = userTopics.find(topic => topic.topic_id === selectedTopic.id);
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Topic Already Purchased</h2>
            <p className="text-gray-600 mb-4">
              You have already purchased "{selectedTopic.name}".
            </p>
            {purchasedTopic && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-green-700">
                  <strong>Plan:</strong> {purchasedTopic.plan_name}<br />
                  <strong>Purchased:</strong> {new Date(purchasedTopic.purchased_date).toLocaleDateString()}<br />
                  {purchasedTopic.amount_paid && (
                    <>
                      <strong>Amount:</strong> ₹{purchasedTopic.amount_paid}
                    </>
                  )}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={goToDashboard}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem("selectedTopicForPayment");
                  sessionStorage.removeItem("selectedTopicName");
                  router.push("/topic-selection");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Select Another Topic
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const modifiedPlans = plans.map(convertPlanToDisplayFormat);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
              Purchase <span className="text-yellow-500">Topic</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Choose your plan to access "{selectedTopic?.name}"
            </p>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>

            {/* Show Razorpay loading status */}
            {!isRazorpayLoaded && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-yellow-800 text-sm">Loading payment gateway...</span>
                </div>
              </div>
            )}

            {/* Selected Topic Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-300 max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Selected Topic
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-xl font-bold text-yellow-800 mb-2">
                  {selectedTopic?.name}
                </h4>
                <p className="text-yellow-700 text-sm">
                  Choose a plan below to get access to this topic's content, exercises, and materials.
                </p>
              </div>
            </div>

            {/* Show user's current topics */}
            {userTopics.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200 max-w-3xl mx-auto mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Your Learning Library ({userTopics.length} topic{userTopics.length !== 1 ? 's' : ''})
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {userTopics.slice(0, 5).map((topic) => (
                    <span
                      key={topic.topic_id}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      ✅ {topic.topic_name}
                    </span>
                  ))}
                  {userTopics.length > 5 && (
                    <span className="text-green-700 text-sm">
                      +{userTopics.length - 5} more
                    </span>
                  )}
                </div>
                <p className="text-green-600 text-sm mt-2">
                  Each topic you purchase is added to your personal learning library!
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {modifiedPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 border transition-all duration-500 ${
                  plan.popular
                    ? "border-yellow-400 shadow-xl shadow-yellow-200 scale-105 hover:scale-110"
                    : "border-yellow-200 shadow-lg hover:scale-105"
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
                    <h4 className="font-semibold text-gray-800 mb-3 text-center">
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <svg
                            className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Access to "{selectedTopic?.name}"
                      </li>
                      {plan.duration_days && (
                        <li className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {plan.duration_days === 9999 ? "Lifetime access" : `${plan.duration_days} days access`}
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePlanSelection(plan)}
                    disabled={isProcessing[plan.id] || (!isRazorpayLoaded && !plan.is_trial && plan.amount > 0)}
                    className={`w-full bg-gradient-to-r ${
                      plan.buttonColor
                    } text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isProcessing[plan.id] ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : !isRazorpayLoaded && !plan.is_trial && plan.amount > 0 ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading Payment...
                      </div>
                    ) : plan.is_trial || plan.amount === 0 ? (
                      "Start Free Trial"
                    ) : (
                      "Purchase Topic"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              💡 How Topic Purchasing Works
            </h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Each topic is purchased individually with your chosen plan</li>
              <li>• Your payment gives you access to that specific topic for the plan duration</li>
              <li>• You can purchase additional topics anytime with any plan</li>
              <li>• All purchased topics appear in your personal dashboard</li>
              <li>• Mix and match different plan types for different topics</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goBack}
              disabled={Object.values(isProcessing).some(Boolean)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back to Topics
            </button>

            {userTopics.length > 0 && (
              <button
                onClick={goToDashboard}
                disabled={Object.values(isProcessing).some(Boolean)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View My Topics →
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;