"use client";

import { useEffect } from "react";
import { useEcho } from "@merit-systems/echo-react-sdk";
import { processPendingSubmissions } from "@/lib/sync-queue";

/**
 * Background component that processes pending quiz submissions
 * when the app loads and user is authenticated
 */
export function SyncQueueProcessor() {
  const echo = useEcho();

  useEffect(() => {
    // Process pending submissions when user signs in
    if (echo.user?.id) {
      console.log('🔄 Checking for pending quiz submissions...');
      processPendingSubmissions().catch((error) => {
        console.error('Error processing pending submissions:', error);
      });
    }
  }, [echo.user?.id]);

  // This component renders nothing
  return null;
}
