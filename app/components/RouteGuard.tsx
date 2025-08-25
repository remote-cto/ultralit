//components/RouteGuard.tsx

"use client";
import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { redirectUserBasedOnSetup } from "../../utils/authUtils";


interface RouteGuardProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresSetup?: boolean;
  redirectPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiresAuth = true,
  requiresSetup = false,
  redirectPath 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check authentication
        if (requiresAuth && (!isAuthenticated || !user)) {
          console.log("User not authenticated, redirecting to auth");
          router.push("/auth");
          return;
        }

        // If authentication is not required, allow access
        if (!requiresAuth) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Check setup completion if required
        if (requiresSetup && user?.id) {
          console.log("Checking user setup status...");
          if (redirectPath) {
            router.push(redirectPath);
            return;
          } else {
            // Use the utility function to redirect based on setup status
           await redirectUserBasedOnSetup(user.id.toString(), router);
            return;
          }
        }

        // If we reach here, user has access
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error in route guard:", error);
        if (requiresAuth) {
          router.push("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, user, router, requiresAuth, requiresSetup, redirectPath]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {requiresAuth ? "Checking access..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;