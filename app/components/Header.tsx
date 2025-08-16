"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles, User, LogOut, BookOpen, CreditCard, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";


const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      const currentPath = pathname !== "/auth" ? pathname : "/";
      router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  };

  const handleGetStartedClick = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    // Simple flow (no server check)
    router.push("/dashboard");
  };

  const handleExploreTopics = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    router.push("/topic-selection");
  };

  // Close menus on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Don’t show header on auth page
  if (pathname === "/auth") return null;

  const getButtonText = () => {
    if (!isAuthenticated) return "Get Started";
    return "Dashboard"; // fixed (no dynamic status)
  };

  return (
    <header className="relative bg-white shadow-md border-b border-gray-100">
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <Link 
              href="/" 
              className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              ULTRALIT
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <button
                onClick={handleExploreTopics}
                className={`flex items-center space-x-2 text-gray-700 hover:text-yellow-500 transition-colors font-medium ${
                  pathname === "/topic-selection" ? "text-yellow-500" : ""
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Topics</span>
              </button>

              {/* {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-2 text-gray-700 hover:text-yellow-500 transition-colors font-medium ${
                    pathname === "/dashboard" ? "text-yellow-500" : ""
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )} */}
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-yellow-500 transition-colors font-medium p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="max-w-32 truncate">{user?.name || "User"}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{user?.name || "User"}</div>
                          <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleExploreTopics}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                        Explore Topics
                      </button>
{/* 
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Dashboard
                      </Link> */}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="text-gray-700 hover:text-yellow-500 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </button>
            )}

            {/* CTA Button */}
            <button
              onClick={handleGetStartedClick}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {getButtonText()}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50">
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Links */}
              <button
                onClick={handleExploreTopics}
                className={`flex items-center w-full py-3 px-2 text-gray-700 hover:text-yellow-500 font-medium transition-colors rounded-lg hover:bg-gray-50 ${
                  pathname === "/topic-selection" ? "text-yellow-500 bg-yellow-50" : ""
                }`}
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Explore Topics
              </button>

              {/* {isAuthenticated && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center w-full py-3 px-2 text-gray-700 hover:text-yellow-500 font-medium transition-colors rounded-lg hover:bg-gray-50 ${
                    pathname === "/dashboard" ? "text-yellow-500 bg-yellow-50" : ""
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
              )} */}

              {/* User Section */}
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-3 py-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{user?.name || "User"}</div>
                      <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-3 px-2 text-red-600 hover:text-red-700 font-medium transition-colors rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-3 px-2 text-gray-700 hover:text-yellow-500 font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Sign In
                  </button>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    handleGetStartedClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-4 rounded-full font-bold shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  {getButtonText()}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
