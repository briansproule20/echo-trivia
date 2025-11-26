import { NextRequest, NextResponse } from "next/server";
import Echo from "@merit-systems/echo-next-sdk";

export const dynamic = 'force-dynamic';

const echo = Echo({
  appId: process.env.ECHO_APP_ID!,
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const isSignedIn = await echo.isSignedIn();
    if (!isSignedIn) {
      return NextResponse.json(
        { error: "User must be authenticated to register a referral" },
        { status: 401 }
      );
    }

    // Get the referral code from the request body
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Get Echo authentication token
    const token = await echo.getEchoToken();
    if (!token) {
      console.error("[referral/register] Failed to get Echo token");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    console.log("[referral/register] Registering referral code:", code);

    // Make authenticated POST request to Echo API to register the referral
    // POST /api/v1/user/referral with { echoAppId, code }
    const response = await fetch("https://echo.merit.systems/api/v1/user/referral", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        echoAppId: process.env.ECHO_APP_ID,
        code,
      }),
    });

    console.log("[referral/register] Echo API response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const responseData = await response.text();
    console.log("[referral/register] Echo API response body:", responseData);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to register referral",
          details: responseData,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Try to parse the response as JSON, fallback to text
    let data;
    try {
      data = responseData ? JSON.parse(responseData) : { success: true };
    } catch {
      data = { success: true, message: responseData };
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error registering referral:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
