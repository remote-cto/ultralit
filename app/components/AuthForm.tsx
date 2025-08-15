//app/components/AuthForm.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    zipCode: "",
    country: "",
  });

  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent to your email. Please check your inbox.");
        setShowOtpField(true);
      } else {
        setMessage(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful! Redirecting...");

        const userData = {
          id: data.user?.id,
          name: data.user?.name || "User",
          email: formData.email,
          phone: data.user?.phone,
          profession: data.user?.profession,
          zipCode: data.user?.zipCode,
          country: data.user?.country,
        };
        login(userData);

        // ✅ Check preferences + subscription
        const statusRes = await fetch(
          `/api/check-user-status?user_id=${data.user?.id}`
        );
        const statusData = await statusRes.json();

        let redirectPath = "/preferences";
        if (
          statusData.success &&
          statusData.hasPreferences &&
          statusData.hasSubscription
        ) {
          redirectPath = "/dashboard";
        }

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          profession: "",
          zipCode: "",
          country: "",
        });
        setOtp("");
        setShowOtpField(false);

        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setMessage(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        // Registration
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            profession: formData.profession || undefined,
            zipCode: formData.zipCode || undefined,
            country: formData.country || undefined,
            userType: 1, // Individual user
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("Registration successful! Please login to continue.");
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            profession: "",
            zipCode: "",
            country: "",
          });
          // Switch to login form after registration
          setTimeout(() => setIsRegister(false), 2000);
        } else {
          setMessage(data.error || "Registration failed. Please try again.");
        }
      } else {
        // Login - Send OTP
        await handleSendOtp();
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetLoginForm = () => {
    setShowOtpField(false);
    setOtp("");
    setMessage("");
    setFormData((prev) => ({
      ...prev,
      email: "",
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 px-4 py-12">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-yellow-300">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            <span className="text-yellow-500">Ultralit</span>
          </h1>
          <h2 className="text-2xl font-bold text-blue-800">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isRegister
              ? "Join the AI learning community"
              : "Sign in to continue your learning"}
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-center text-sm ${
              message.includes("successful") ||
              message.includes("sent") ||
              message.includes("Redirecting")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {isRegister && (
            <>
              <div>
                <label className="block text-blue-700 font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Your profession"
                  className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Your zip code"
                  className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Your country"
                  className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-blue-700 font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              required
              disabled={showOtpField}
              className={`w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                showOtpField ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* OTP Field - Only show for login when OTP is sent */}
          {!isRegister && showOtpField && (
            <div>
              <label className="block text-blue-700 font-medium mb-1">
                Enter OTP *
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={resetLoginForm}
                className="text-sm text-yellow-600 hover:underline mt-2"
              >
                Use different email?
              </button>
            </div>
          )}

          {/* Submit Button */}
          {!showOtpField ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading
                ? isRegister
                  ? "Creating Account..."
                  : "Sending OTP..."
                : isRegister
                ? "Sign Up"
                : "Send OTP"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Verifying..." : "Verify OTP & Continue"}
            </button>
          )}
        </div>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-blue-700">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setShowOtpField(false);
              setOtp("");
              setFormData({
                name: "",
                email: "",
                phone: "",
                profession: "",
                zipCode: "",
                country: "",
              });
            }}
            className="text-yellow-500 font-semibold hover:underline"
          >
            {isRegister ? "Login" : "Sign Up"}
          </button>
        </p>

        {/* Progress indicator for new users */}
        {!isRegister && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-8 h-1 bg-gray-300"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="ml-4 text-sm text-gray-600">Step 1 of 3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
