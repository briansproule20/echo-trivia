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

      // Store referral code for later use
      // The referral system will be implemented in a future update
      localStorage.setItem("pending_referral_code", referralCode);
      console.log("✅ Referral code saved for registration");
    } catch (error) {
      console.error("Failed to save referral code:", error);
      hasRegistered.current = false; // Allow retry on next page load
    }
  }, [searchParams, echo.user]);

  useEffect(() => {
    registerReferral();
  }, [registerReferral]);

  // This component doesn't render anything
  return null;
}
