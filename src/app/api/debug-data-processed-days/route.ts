import { NextResponse } from "next/server";

const FUNCTION_ID = "761745fb-7401-45d2-b7b6-44f4cbb3f386";
const API_URL = `https://api.quicknode.com/functions/rest/v1/functions/${FUNCTION_ID}/call?result_only=true`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const chainParam = searchParams.get("chain");
  if (chainParam === null) {
    throw new Error("Missing 'chain' query parameter");
  }
  const chain = chainParam;

  const daysParam = searchParams.get("days");
  if (daysParam === null) {
    throw new Error("Missing 'days' query parameter");
  }
  const days = parseInt(daysParam);

  const apiKey = process.env.QUICKNODE_API_KEY;

  console.log("GET request:", { chain, days });

  if (!apiKey) {
    console.error("Missing QUICKNODE_API_KEY");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const requestBody = {
    user_data: {
      chain: chain,
      days: days,
      method: "getHistoricalMetrics",
    },
  };

  // console.log("Request to QuickNode:", {
  //   url: API_URL,
  //   body: requestBody,
  // });

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
    console.log("QuickNode Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText,
    });

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
