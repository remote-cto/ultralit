"use client";
import React, { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-white shadow-md">
      {/* Top Gradient Accent */}
      <div className="absolute inset-0 "></div>

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-yellow-500">
              ULTRALIT
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#pricing"
              className="text-gray-700 hover:text-yellow-500 transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#login"
              className="text-gray-700 hover:text-yellow-500 transition-colors font-medium"
            >
              Login
            </a>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:scale-105">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#pricing"
                className="block py-2 text-gray-700 hover:text-yellow-500 font-medium"
              >
                Pricing
              </a>
              <a
                href="#login"
                className="block py-2 text-gray-700 hover:text-yellow-500 font-medium"
              >
                Login
              </a>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-full font-bold mt-4 shadow-md">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
