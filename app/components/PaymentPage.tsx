//app/components/PaymentPage.tsx

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

const PaymentPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<Subscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Load preferences, check subscription, and load plans
    loadUserData();
  }, [isAuthenticated, router, user]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      // Check subscription status, load preferences, and load plans simultaneously
      const [subscriptionRes, preferencesRes, plansRes] = await Promise.all([
        fetch(`/api/check-subscription?user_id=${user.id}`),
        fetch(`/api/get-user-preferences?user_id=${user.id}`),
        fetch("/api/getplans"),
      ]);

      // Handle subscription check
      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        console.log("Subscription check response:", subscriptionData);

        if (subscriptionData.subscription) {
          setSubscriptionStatus(subscriptionData.subscription);

          // Check if user has an active subscription
          if (
            subscriptionData.subscription.status === "active" &&
            subscriptionData.subscription.is_active
          ) {
            setHasActiveSubscription(true);
            // Note: We don't redirect here anymore, let user choose to upgrade or add topics
          }
        }
      }

      // Handle preferences
      if (preferencesRes.ok) {
        const preferencesData = await preferencesRes.json();
        if (preferencesData.success && preferencesData.preferences) {
          setUserPreferences(preferencesData.preferences);
        } else {
          // If no preferences found, allow them to continue with payment
          console.log("No preferences found, but allowing payment to continue");
        }
      }

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
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Error loading data. Please refresh the page.");
    } finally {
      setIsCheckingSubscription(false);
      setIsLoadingPreferences(false);
      setIsLoadingPlans(false);
    }
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
      period: plan.is_trial ? " Free" : "/month",
      description: plan.description,
      icon: planIcons[plan.name as keyof typeof planIcons] || "📦",
      features: plan.features?.features || [],
      buttonColor:
        planColors[plan.name as keyof typeof planColors] ||
        "from-gray-500 to-gray-600",
      popular: plan.name === "Professionals & Executives",
      disabled: false,
      is_trial: plan.is_trial,
    };
  };

  // Modify plans based on current subscription
  const getModifiedPlans = () => {
    if (!plans.length) return [];

    const displayPlans = plans.map(convertPlanToDisplayFormat);

    if (!hasActiveSubscription || !subscriptionStatus) return displayPlans;

    return displayPlans.map((plan) => {
      const isCurrentPlan = plan.name === subscriptionStatus?.plan_name;

      const isLowerTier =
        (subscriptionStatus?.plan_name === "Professionals & Executives" &&
          (plan.name === "Students" || plan.name === "Free Trial")) ||
        (subscriptionStatus?.plan_name === "Students" &&
          plan.name === "Free Trial");

      return {
        ...plan,
        disabled: isCurrentPlan || isLowerTier,
        description: isCurrentPlan
          ? "Your current active plan"
          : isLowerTier
          ? "Lower tier than your current plan"
          : plan.description,
      };
    });
  };

  const handlePlanSelection = async (plan: any) => {
    if (isProcessing || plan.disabled) return;

    setIsProcessing(true);

    try {
      // If user has active subscription, show confirmation for upgrade/change
      if (hasActiveSubscription && subscriptionStatus) {
        const confirmMessage =
          plan.amount > (subscriptionStatus?.amount || 0)
            ? `Upgrade from ${subscriptionStatus.plan_name} (₹${subscriptionStatus.amount}) to ${plan.name} (₹${plan.amount})?`
            : `Change from ${subscriptionStatus?.plan_name} to ${plan.name}?`;
        if (!confirm(confirmMessage)) {
          setIsProcessing(false);
          return;
        }
      }

      if (plan.amount === 0 || plan.is_trial) {
        // Handle free trial
        const response = await fetch("/api/activate-trial", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            plan_name: plan.name,
            preferences: userPreferences,
            is_upgrade: hasActiveSubscription,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert(
            hasActiveSubscription
              ? "Plan changed successfully!"
              : "Free trial activated successfully!"
          );
          router.push("/dashboard");
        } else {
          console.error("Failed to activate free trial:", data);
          alert(data.error || "Failed to activate free trial");
        }
        return;
      }

      // Handle paid plans with Razorpay
      console.log(
        "Creating order for plan:",
        plan.name,
        "Amount:",
        plan.amount
      );

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.amount,
          currency: "INR",
          notes: {
            plan_name: plan.name,
            user_id: user?.id,
            is_upgrade: hasActiveSubscription,
            previous_plan: subscriptionStatus?.plan_name,
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
        description: hasActiveSubscription
          ? `${subscriptionStatus?.plan_name} → ${plan.name}`
          : `${plan.name} Subscription`,
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
                plan_name: plan.name,
                amount: plan.amount,
                preferences: userPreferences,
                is_upgrade: hasActiveSubscription,
                previous_plan: subscriptionStatus?.plan_name,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log("Payment verification response:", verifyData);

            if (verifyRes.ok && verifyData.success) {
              const successMessage = hasActiveSubscription
                ? "Plan updated successfully! Welcome to your new plan!"
                : "Payment successful! Welcome to Ultralit!";
              alert(successMessage);
              router.push("/dashboard");
            } else {
              console.error("Payment verification failed:", verifyData);
              alert(
                verifyData.error ||
                  "Payment verification failed. Please contact support."
              );
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setIsProcessing(false);
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
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment process error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      if (plan.amount === 0 || plan.is_trial) {
        setIsProcessing(false);
      }
    }
  };

  const goBack = () => {
    if (hasActiveSubscription) {
      router.push("/dashboard");
    } else {
      router.push("/topic-selection");
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Show loading while checking subscription, loading preferences, or loading plans
  if (isCheckingSubscription || isLoadingPreferences || isLoadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">
            {isCheckingSubscription
              ? "Checking your subscription status..."
              : isLoadingPlans
              ? "Loading payment plans..."
              : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const modifiedPlans = getModifiedPlans();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            {hasActiveSubscription ? "Manage Your " : "Choose Your "}
            <span className="text-yellow-500">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {hasActiveSubscription
              ? "Upgrade your plan or explore additional topics"
              : "Select the perfect plan for your learning journey"}
          </p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>

          {/* Show current subscription status if exists */}
          {subscriptionStatus && (
            <div
              className={`${
                hasActiveSubscription
                  ? "bg-green-100 border-green-300"
                  : "bg-orange-100 border-orange-300"
              } rounded-xl p-6 mb-6 max-w-3xl mx-auto`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p
                    className={`${
                      hasActiveSubscription
                        ? "text-green-800"
                        : "text-orange-800"
                    } text-lg font-semibold`}
                  >
                    Current Plan:{" "}
                    <strong>{subscriptionStatus.plan_name}</strong>
                  </p>
                  <div className="mt-2 space-y-1">
                    <p
                      className={`${
                        hasActiveSubscription
                          ? "text-green-700"
                          : "text-orange-700"
                      } text-sm`}
                    >
                      Status:{" "}
                      <span className="font-medium capitalize">
                        {subscriptionStatus.status}
                      </span>
                    </p>
                    <p
                      className={`${
                        hasActiveSubscription
                          ? "text-green-700"
                          : "text-orange-700"
                      } text-sm`}
                    >
                      Amount: ₹{subscriptionStatus.amount}/month
                    </p>
                    {subscriptionStatus.next_renewal_date && (
                      <p
                        className={`${
                          hasActiveSubscription
                            ? "text-green-700"
                            : "text-orange-700"
                        } text-sm`}
                      >
                        {hasActiveSubscription ? "Next Renewal" : "Expired on"}:{" "}
                        {new Date(
                          subscriptionStatus.next_renewal_date
                        ).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
                {hasActiveSubscription && (
                  <div className="text-right">
                    <button
                      onClick={handleGoToDashboard}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </div>
              {!hasActiveSubscription && (
                <p className="text-orange-700 text-sm mt-2 font-medium">
                  Your subscription has expired. Please choose a new plan to
                  continue learning.
                </p>
              )}
            </div>
          )}

          {/* Selected Preferences Summary */}
          {userPreferences && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-300 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Selected Preferences
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {userPreferences.role && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    👤 {userPreferences.role}
                  </span>
                )}
                {userPreferences.industry && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    🏭 {userPreferences.industry}
                  </span>
                )}
                {userPreferences.language && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    🌐 {userPreferences.language}
                  </span>
                )}
                {userPreferences.preferred_mode && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    📱 {userPreferences.preferred_mode}
                  </span>
                )}
                {userPreferences.frequency && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    ⏰ {userPreferences.frequency}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {modifiedPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-8 border transition-all duration-500 ${
                plan.disabled
                  ? "opacity-60 cursor-not-allowed border-gray-300"
                  : plan.popular
                  ? "border-yellow-400 shadow-xl shadow-yellow-200 scale-105 hover:scale-110"
                  : "border-yellow-200 shadow-lg hover:scale-105"
              }`}
            >
              {plan.popular && !plan.disabled && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              {plan.disabled && subscriptionStatus?.plan_name === plan.name && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Current Plan
                </div>
              )}

              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-100 rounded-2xl text-4xl ${
                    plan.disabled ? "grayscale" : ""
                  }`}
                >
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
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelection(plan)}
                  disabled={isProcessing || plan.disabled}
                  className={`w-full bg-gradient-to-r ${
                    plan.buttonColor
                  } text-white py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    plan.disabled ? "from-gray-400 to-gray-500" : ""
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.disabled ? (
                    subscriptionStatus?.plan_name === plan.name ? (
                      "Current Plan"
                    ) : (
                      "Not Available"
                    )
                  ) : hasActiveSubscription ? (
                    plan.amount > (subscriptionStatus?.amount || 0) ? (
                      "Upgrade Plan"
                    ) : plan.amount < (subscriptionStatus?.amount || 0) ? (
                      "Downgrade Plan"
                    ) : (
                      "Switch Plan"
                    )
                  ) : plan.is_trial || plan.amount === 0 ? (
                    "Start Free Trial"
                  ) : (
                    "Choose Plan"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information for Active Subscribers */}
        {hasActiveSubscription && (
          <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              💡 For Existing Subscribers
            </h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Upgrade to access more premium features and content</li>
              <li>
                • Your current subscription will be prorated when you upgrade
              </li>
              <li>
                • You can select additional topics anytime from your dashboard
              </li>
              <li>
                • Changes take effect immediately after payment confirmation
              </li>
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={goBack}
            disabled={isProcessing}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {hasActiveSubscription ? "Back to Dashboard" : "Back to Topics"}
          </button>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600">
              {hasActiveSubscription ? "Plan Management" : "Final Step"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
