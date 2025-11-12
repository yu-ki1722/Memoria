import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const keyword = searchParams.get("keyword");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&keyword=${encodeURIComponent(
    keyword || ""
  )}&language=ja&key=${apiKey}`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.results.length === 0) {
      return NextResponse.json({ status: "ZERO_RESULTS", results: [] });
    }

    const firstResult = searchData.results[0];
    const placeId = firstResult.place_id;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,url,photos&language=ja&key=${apiKey}`;

    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    const mergedResult = {
      ...detailsData.result,
      place_id: placeId,
    };

    return NextResponse.json({ status: "OK", result: mergedResult });
  } catch (error) {
    console.error("Google Places error:", error);
    return NextResponse.json({ error: "Google API error" }, { status: 500 });
  }
}
