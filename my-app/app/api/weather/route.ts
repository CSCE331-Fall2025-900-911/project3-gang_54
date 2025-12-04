import { NextRequest, NextResponse } from "next/server";

/**
 * Weather API Route
 * 
 * Fetches weather data from OpenWeatherMap API (https://openweathermap.org/api)
 * 
 * Source: OpenWeatherMap Current Weather Data API
 * Endpoint: https://api.openweathermap.org/data/2.5/weather
 * 
 * Requires OPENWEATHER_API_KEY environment variable
 * Get your free API key at: https://openweathermap.org/api
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DEFAULT_CITY = "College Station";
const DEFAULT_STATE = "TX";

export async function GET(req: NextRequest) {
  try {
    // If no API key, return a fallback response
    if (!OPENWEATHER_API_KEY) {
      console.warn("OPENWEATHER_API_KEY not set, returning fallback weather data");
      return NextResponse.json({
        temp: 72,
        condition: "Sunny",
        feels_like: 70,
        city: DEFAULT_CITY,
        error: "Weather API key not configured",
      });
    }

    // Get city from query params or use default
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || DEFAULT_CITY;
    const state = searchParams.get("state") || DEFAULT_STATE;
    const location = `${city},${state},US`;

    // Call OpenWeather API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=imperial`;

    const response = await fetch(weatherUrl, {
      cache: "no-store",
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeather API error", response.status, errorText);
      
      // Return fallback on API error
      return NextResponse.json({
        temp: 72,
        condition: "Sunny",
        feels_like: 70,
        city: city,
        error: "Weather service temporarily unavailable",
      });
    }

    const data = await response.json() as {
      main?: { temp?: number; feels_like?: number };
      weather?: Array<{ main?: string; description?: string }>;
      name?: string;
    };

    const temp = Math.round(data.main?.temp ?? 72);
    const feelsLike = Math.round(data.main?.feels_like ?? temp);
    const condition = data.weather?.[0]?.main ?? "Clear";
    const description = data.weather?.[0]?.description ?? "clear sky";

    return NextResponse.json({
      temp,
      feels_like: feelsLike,
      condition,
      description,
      city: data.name || city,
    });
  } catch (error) {
    console.error("Weather API error", error);
    // Return fallback on any error
    return NextResponse.json({
      temp: 72,
      condition: "Sunny",
      feels_like: 70,
      city: DEFAULT_CITY,
      error: "Unable to fetch weather data",
    });
  }
}
