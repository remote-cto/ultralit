// app/pages/payment.tsx

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

// Simplified interface for the topic being purchased
interface TopicToPurchase {
  id: number;
  name: string;
  price: number;
  duration: number;
}

const PaymentPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [topic, setTopic] = useState<TopicToPurchase | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      alert("Failed to load payment gateway. Please refresh the page.");
    };
    document.head.appendChild(script);
  }, []);

  // Get topic details from sessionStorage
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth?redirect=topic-selection"); // Redirect to login if not authenticated
      return;
    }

    const topicId = sessionStorage.getItem("selectedTopicForPayment");
    const topicName = sessionStorage.getItem("selectedTopicName");
    const topicPrice = sessionStorage.getItem("selectedTopicPrice");
    const topicDuration = sessionStorage.getItem("selectedTopicDuration");

    if (topicId && topicName && topicPrice && topicDuration) {
      setTopic({
        id: parseInt(topicId, 10),
        name: topicName,
        price: parseFloat(topicPrice),
        duration: parseInt(topicDuration, 10),
      });
    } else {
      // If details are missing, the user probably landed here by mistake.
      alert("No topic selected. Redirecting you back to the topic list.");
      router.push("/topic-selection");
    }
  }, [isAuthenticated, router]);

  const handlePurchase = async () => {
    if (isProcessing || !topic || !user) return;

    setIsProcessing(true);

    // --- Handle FREE topics ---
    if (topic.price === 0) {
      try {
        const response = await fetch("/api/purchase-topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            topic_id: topic.id,
            plan_name: "Free Topic",
            amount: 0,
            payment_status: "completed",
            duration_days: topic.duration,
          }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          alert(`Successfully enrolled in the free topic: "${topic.name}"!`);
          sessionStorage.clear(); // Clear all session data on success
          router.push("/dashboard");
        } else {
          alert(data.error || "Failed to enroll in the free topic.");
        }
      } catch (error) {
        console.error("Error enrolling in free topic:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // --- Handle PAID topics ---
    if (!isRazorpayLoaded || !window.Razorpay) {
      alert("Payment gateway is not loaded yet. Please wait a moment and try again.");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: topic.price,
          currency: "INR",
          notes: { // Pass all necessary info to the backend
            user_id: user.id,
            topic_id: topic.id,
            topic_name: topic.name,
            payment_type: "topic_purchase",
            duration_days: topic.duration,
          },
        }),
      });

      const data = await res.json();
      if (!data.order) {
        throw new Error(data.error || "Failed to create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Your Platform Name",
        description: `Payment for topic: ${topic.name}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          // This function is called after a successful payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              topic_id: topic.id,
              amount: topic.price,
              plan_name: "Per-Topic Purchase", // A static name for this type of purchase
              duration_days: topic.duration,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Payment successful! You now have access to "${topic.name}"`);
            sessionStorage.clear();
            router.push("/dashboard");
          } else {
            alert(verifyData.error || "Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setIsProcessing(false);
          },
        },
        theme: { color: "#F59E0B" }, // A nice yellow theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Payment process error:", error);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!topic) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
        </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg border">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Confirm Your Purchase
            </h2>
          </div>
          <div className="rounded-md -space-y-px">
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <p className="text-sm text-gray-600">You are purchasing:</p>
              <h3 className="text-2xl font-bold text-gray-800 my-2">{topic.name}</h3>
              <div className="mt-4 pt-4 border-t border-yellow-300 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total Price:</span>
                <span className="text-3xl font-bold text-gray-900">
                  {topic.price === 0 ? "Free" : `₹${topic.price}`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handlePurchase}
              disabled={isProcessing || (!isRazorpayLoaded && topic.price > 0)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing 
                ? "Processing..." 
                : (topic.price === 0 ? "Enroll for Free" : "Pay and Confirm")}
            </button>
          </div>
            <div className="text-center">
            <button onClick={() => router.push('/topic-selection')} className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                ← Select a different topic
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;