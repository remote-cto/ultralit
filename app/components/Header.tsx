"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

interface UserStatus {
  hasPreferences: boolean;
  hasSubscription: boolean;
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setUserStatus(null);
    router.push("/");
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      router.push("/auth");
    }
  };

  const checkUserStatus = async () => {
    if (!user?.id || isCheckingStatus) return null;

    try {
      setIsCheckingStatus(true);
      const res = await fetch(`/api/check-user-status?user_id=${user.id}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setUserStatus({
          hasPreferences: data.hasPreferences,
          hasSubscription: data.hasSubscription,
        });
        return data;
      } else {
        setUserStatus(null);
        return null;
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserStatus(null);
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleGetStartedClick = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    const status = userStatus || (await checkUserStatus());

    if (!status) return;

    if (status.hasSubscription) {
      router.push("/dashboard");
    } else if (!status.hasPreferences) {
      router.push("/preferences");
    } else {
      router.push("/payment");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id && !userStatus) {
      checkUserStatus();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  if (pathname === "/auth") return null;

  const getButtonText = () => {
    if (!isAuthenticated) return "Get Started";
    if (userStatus?.hasSubscription) return "Dashboard";
    if (userStatus?.hasPreferences) return "Choose Plan";
    return "Continue";
  };

  return (
    <header className="relative bg-white shadow-md">
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <Link href="/" className="text-3xl font-bold text-yellow-500">
              ULTRALIT
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-yellow-500 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || "User"}</span>
                  {userStatus?.hasSubscription && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active Plan
                    </span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-68 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{user?.name || "User"}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      {userStatus?.hasSubscription ? (
                        <div className="mt-1 text-xs">
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Active Subscription
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs">
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                            No Subscription
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="text-gray-700 hover:text-yellow-500 transition-colors font-medium"
              >
                Login
              </button>
            )}

            <button
              onClick={handleGetStartedClick}
              disabled={isCheckingStatus}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50"
            >
              {isCheckingStatus ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                getButtonText()
              )}
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>

              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 py-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{user?.name || "User"}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      {userStatus?.hasSubscription ? (
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active Subscription
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            No Subscription
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-gray-700 hover:text-yellow-500 font-medium"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => {
                  handleGetStartedClick();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isCheckingStatus}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-full font-bold mt-4 shadow-md disabled:opacity-50"
              >
                {isCheckingStatus ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  getButtonText()
                )}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
