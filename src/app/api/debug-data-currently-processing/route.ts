import { NextResponse } from "next/server";

const FUNCTION_ID = "761745fb-7401-45d2-b7b6-44f4cbb3f386";
const API_URL = `https://api.quicknode.com/functions/rest/v1/functions/${FUNCTION_ID}/call?result_only=true`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain") || "base";
  const apiKey = process.env.QUICKNODE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const requestBody = {
    user_data: {
      chain: chain,
      method: "getCurrentMetrics",
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // const responseText = await response.text();
    // console.log("QuickNode Response:", {
    //   status: response.status,
    //   statusText: response.statusText,
    //   headers: Object.fromEntries(response.headers),
    //   body: responseText,
    // });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
