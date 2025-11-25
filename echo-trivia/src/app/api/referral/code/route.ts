import { NextResponse } from "next/server";
import Echo from "@merit-systems/echo-next-sdk";

export const dynamic = 'force-dynamic';

const echo = Echo({
  appId: process.env.ECHO_APP_ID!,
});

/**
 * GET /api/referral/code
 * Fetches the authenticated user's referral code from Echo
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const isSignedIn = await echo.isSignedIn();
    if (!isSignedIn) {
      return NextResponse.json(
        { error: "User must be authenticated" },
        { status: 401 }
      );
    }

    // Get Echo authentication token
    const token = await echo.getEchoToken();
    if (!token) {
      console.error("[referral/code] Failed to get Echo token");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Fetch user's referral code from Echo
    // TODO: Update this URL once the Echo team exposes the endpoint
    const response = await fetch(
      `https://echo.merit.systems/api/v1/apps/${process.env.ECHO_APP_ID}/referral-code`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    console.log("[referral/code] Echo API response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[referral/code] Echo API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch referral code", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[referral/code] Referral code fetched successfully");

    return NextResponse.json({
      success: true,
      code: data.code,
      referralLinkUrl: data.referralLinkUrl,
      expiresAt: data.expiresAt,
    });
  } catch (error) {
    console.error("[referral/code] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
