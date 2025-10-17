"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";

/**
 * Global component that detects referral codes in URL and registers them
 * Listens for ?ref=USER_ID query parameter
 */
export function ReferralDetector() {
  const searchParams = useSearchParams();
  const echo = useEcho();
  const hasRegistered = useRef(false);

  useEffect(() => {
    const registerReferral = async () => {
      // Only run once per page load
      if (hasRegistered.current) return;

      // Get referral code from URL
      const referralCode = searchParams.get("ref");
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

        const appId = process.env.NEXT_PUBLIC_ECHO_APP_ID;
        if (!appId) {
          console.error("Echo App ID not configured");
          return;
        }

        console.log("Registering referral code:", referralCode);
        const result = await echo.users.registerReferralCode(appId, referralCode);

        if (result.success) {
          console.log("✅ Referral registered successfully:", result.message);
        } else {
          console.log("ℹ️ Referral registration:", result.message);
        }
      } catch (error) {
        console.error("Failed to register referral:", error);
        hasRegistered.current = false; // Allow retry on next page load
      }
    };

    registerReferral();
  }, [searchParams, echo.user, echo.users]);

  // This component doesn't render anything
  return null;
}
