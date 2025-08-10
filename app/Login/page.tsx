"use client";
import React, { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center bg-white px-4 py-12">
        <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-yellow-300">
          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">
            {isRegister ? "Create Account" : "Login"}
          </h2>

          {/* Form */}
          <form className="space-y-5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
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
                    placeholder="Your profession"
                    className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-blue-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {isRegister ? "Sign Up" : "Login"}
            </button>
          </form>

          {/* Toggle link */}
          <p className="mt-6 text-center text-sm text-blue-700">
            {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-yellow-500 font-semibold hover:underline"
            >
              {isRegister ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
