import { NextResponse } from "next/server";

// Temporary placeholder version for Sprint 1.
// Replace with real OpenWeather API call in Sprint 2.
export async function GET() {
  return NextResponse.json({
    temp: 72,
    condition: "Sunny",
    feels_like: 70,
    city: "College Station",
  });
}
