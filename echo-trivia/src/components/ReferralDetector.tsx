"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useEcho } from "@merit-systems/echo-react-sdk";

const PENDING_REFERRAL_KEY = "pending_referral_code";

/**
 * Global component that detects referral codes in URL and registers them
 * Listens for ?referral_code=CODE query parameter
 *
 * Flow:
 * 1. User arrives with ?referral_code=ABC123
 * 2. If not authenticated, store code in localStorage
 * 3. Once authenticated, register the referral with Echo
 */
export function ReferralDetector() {
  const searchParams = useSearchParams();
  const echo = useEcho();
  const hasRegistered = useRef(false);

  const registerReferral = useCallback(async (code: string) => {
    console.log("[ReferralDetector] Attempting to register referral code:", code);

    // Mark as registered early to prevent duplicate calls
    hasRegistered.current = true;

    try {
      // Call our API route which handles authentication server-side
      const response = await fetch("/api/referral/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log("[ReferralDetector] API response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        // Parse the details if available
        let detailMessage = data.error;
        if (data.details) {
          try {
            const details = JSON.parse(data.details);
            detailMessage = details.message || data.error;
          } catch {
            detailMessage = data.details || data.error;
          }
        }

        console.warn("[ReferralDetector] Registration failed:", detailMessage);

        // Don't retry if it's a business logic error (already has referrer, invalid code, etc)
        if (response.status === 400) {
          // Clear pending code on 400 errors (invalid/expired/already has referrer)
          localStorage.removeItem(PENDING_REFERRAL_KEY);
        } else {
          hasRegistered.current = false; // Allow retry for other errors
        }
        return;
      }

      console.log("[ReferralDetector] ✅ Referral code successfully registered!");
      localStorage.removeItem(PENDING_REFERRAL_KEY);
    } catch (error) {
      console.error("[ReferralDetector] Failed to register referral code:", error);
      hasRegistered.current = false; // Allow retry on next attempt
    }
  }, []);

  useEffect(() => {
    // Skip if already registered this session
    if (hasRegistered.current) {
      console.log("[ReferralDetector] Already registered this session, skipping");
      return;
    }

    // Check for referral code in URL first
    const urlReferralCode = searchParams.get("referral_code");

    // Check for pending referral code in localStorage
    const pendingCode = localStorage.getItem(PENDING_REFERRAL_KEY);

    // Use URL code if present, otherwise use pending code
    const referralCode = urlReferralCode || pendingCode;

    console.log("[ReferralDetector] Checking for referral:", {
      urlCode: urlReferralCode,
      pendingCode,
      activeCode: referralCode,
      isAuthenticated: !!echo.user,
      userId: echo.user?.id,
    });

    if (!referralCode) {
      console.log("[ReferralDetector] No referral code found");
      return;
    }

    // If user is not authenticated, store the code for later
    if (!echo.user) {
      if (urlReferralCode) {
        console.log("[ReferralDetector] User not authenticated, storing referral code for later:", urlReferralCode);
        localStorage.setItem(PENDING_REFERRAL_KEY, urlReferralCode);
      }
      return;
    }

    // User is authenticated - register the referral
    console.log("[ReferralDetector] User authenticated, proceeding with registration");
    registerReferral(referralCode);
  }, [searchParams, echo.user, registerReferral]);

  // This component doesn't render anything
  return null;
}
