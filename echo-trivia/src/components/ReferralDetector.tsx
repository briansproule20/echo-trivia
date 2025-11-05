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

      // Get authentication token from Echo
      const token = await echo.getToken();
      if (!token) {
        console.error("Failed to get authentication token");
        hasRegistered.current = false;
        return;
      }

      // Make POST request to Echo API to register the referral
      const response = await fetch("https://echo.merit.systems/api/v1/user/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          echoAppId: process.env.NEXT_PUBLIC_ECHO_APP_ID,
          code: referralCode,
        }),
      });

      console.log("Referral API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const responseData = await response.text();
      console.log("Referral API response body:", responseData);

      if (!response.ok) {
        throw new Error(`Failed to register referral: ${response.status} ${response.statusText} - ${responseData}`);
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
