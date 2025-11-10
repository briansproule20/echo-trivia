"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";

/**
 * Global component that detects referral codes in URL and registers them
 * Listens for ?referral_code=USER_ID query parameter (snake_case to match Echo app)
 */
export function ReferralDetector() {
  const searchParams = useSearchParams();
  const echo = useEcho();
  const hasRegistered = useRef(false);

  const registerReferral = useCallback(async () => {
    // Only run once per page load
    if (hasRegistered.current) return;

    // Get referral code from URL - using snake_case to match Echo app
    const referralCode = searchParams.get("referral_code");
    if (!referralCode) return;

    // User must be authenticated to register a referral
    if (!echo.user) {
      console.log("User not authenticated, will register referral after sign-in");
      return;
    }

    // Don't register if user is referring themselves
    if (echo.user.id === referralCode) {
      console.log("Cannot use your own referral code");
      return;
    }

    try {
      hasRegistered.current = true;
      console.log("Referral code detected:", referralCode);

      // Call our API route which handles authentication server-side
      const response = await fetch("/api/referral/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: referralCode,
        }),
      });

      const data = await response.json();
      console.log("Referral registration response:", data);

      if (!response.ok) {
        // Parse the details if available
        let detailMessage = data.error;
        if (data.details) {
          try {
            const details = JSON.parse(data.details);
            detailMessage = details.message || data.error;
          } catch {
            detailMessage = data.error;
          }
        }

        console.warn("Referral registration failed:", detailMessage);

        // Don't retry if it's a business logic error (already has referrer, invalid code, etc)
        if (response.status === 400) {
          hasRegistered.current = true; // Don't retry 400 errors
        } else {
          hasRegistered.current = false; // Allow retry for other errors
        }
        return;
      }

      console.log("✅ Referral code successfully registered");

      // Clear any pending referral code from localStorage
      localStorage.removeItem("pending_referral_code");
    } catch (error) {
      console.error("Failed to register referral code:", error);
      hasRegistered.current = false; // Allow retry on next page load
    }
  }, [searchParams, echo.user]);

  useEffect(() => {
    registerReferral();
  }, [registerReferral]);

  // This component doesn't render anything
  return null;
}
