import { NextResponse } from "next/server";

const FUNCTION_ID = "f7fd3872-7554-40f9-b72c-ff3092f9925f";
const API_URL = `https://api.quicknode.com/functions/rest/v1/functions/${FUNCTION_ID}/call?result_only=true`; // Updated URL

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.QUICKNODE_API_KEY;

  if (!apiKey) {
    console.error("Missing QUICKNODE_API_KEY");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const requestBody = {
    user_data: {
      chain: searchParams.get("chain") || "ETH",
      date: searchParams.get("date") || undefined,
      metric: searchParams.get("metric"),
      days: Number(searchParams.get("days")) || 7,
    },
  };

  console.log("Request to QuickNode:", {
    url: API_URL,
    body: requestBody,
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    // console.log("QuickNode Response:", {
    //   status: response.status,
    //   statusText: response.statusText,
    //   headers: Object.fromEntries(response.headers),
    //   body: responseText,
    // });

    if (!response.ok) {
      throw new Error(
        `QuickNode API error: ${response.status} ${response.statusText}\n${responseText}`
      );
    }

    const data = responseText ? JSON.parse(responseText) : null;
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
