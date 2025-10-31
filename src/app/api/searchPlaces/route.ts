import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "Missing Google API key" },
      { status: 500 }
    );
  }

  let url = "";

  if (query && query.trim() !== "") {
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&location=${lat},${lng}&radius=1000&language=ja&key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    }`;
  } else if (lat && lng) {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&language=ja&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  } else {
    return NextResponse.json(
      { error: "Missing query or location parameters" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Google Places API" },
      { status: 500 }
    );
  }
}
