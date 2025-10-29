import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const keyword = searchParams.get("keyword");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not configured" },
      { status: 500 }
    );
  }

  if (!lat || !lng || !keyword) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    keyword
  )}&location=${lat},${lng}&radius=300&key=${apiKey}`;

  try {
    const apiResponse = await fetch(searchUrl);
    const data = await apiResponse.json();

    console.log("Google API response:", JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google API fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Google" },
      { status: 500 }
    );
  }
}
