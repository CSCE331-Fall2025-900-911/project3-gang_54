import { NextRequest, NextResponse } from "next/server";

/**
 * Weather API Route
 * 
 * Fetches weather data from Open-Meteo API (https://open-meteo.com)
 * 
 * Source: Open-Meteo Weather Forecast API
 * Endpoint: https://api.open-meteo.com/v1/forecast
 * 
 * No API key required - completely free and open source
 */

const DEFAULT_CITY = "College Station";
const DEFAULT_STATE = "TX";

// Coordinates for College Station, TX (default location)
const DEFAULT_LATITUDE = 30.6279;
const DEFAULT_LONGITUDE = -96.3344;

// Map Open-Meteo weather codes to readable conditions
function getWeatherCondition(weatherCode: number): string {
  // WMO Weather interpretation codes (WW)
  if (weatherCode === 0) return "Clear";
  if (weatherCode <= 3) return "Partly Cloudy";
  if (weatherCode <= 48) return "Foggy";
  if (weatherCode <= 67) return "Rainy";
  if (weatherCode <= 77) return "Snowy";
  if (weatherCode <= 82) return "Rainy";
  if (weatherCode <= 86) return "Snowy";
  if (weatherCode <= 99) return "Thunderstorm";
  return "Clear";
}

export async function GET(req: NextRequest) {
  try {
    // Get location from query params or use default
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || DEFAULT_CITY;
    const latitude = parseFloat(searchParams.get("latitude") || String(DEFAULT_LATITUDE));
    const longitude = parseFloat(searchParams.get("longitude") || String(DEFAULT_LONGITUDE));

    // Call Open-Meteo API - no API key required!
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;

    const response = await fetch(weatherUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Open-Meteo API error", response.status, errorText);
      
      // Return fallback on API error
      console.warn(`Weather API error (${response.status}): Weather service temporarily unavailable`);
      return NextResponse.json({
        temp: 72,
        condition: "Sunny",
        feels_like: 72,
        city: city,
        error: "Weather service temporarily unavailable",
        isRealData: false,
      });
    }

    const data = await response.json() as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
      };
    };

    const temp = Math.round(data.current?.temperature_2m ?? 72);
    const weatherCode = data.current?.weather_code ?? 0;
    const condition = getWeatherCondition(weatherCode);

    console.log(`Weather API success: ${temp}°F in ${city}, condition: ${condition}`);

    return NextResponse.json({
      temp,
      feels_like: temp, // Open-Meteo doesn't provide feels_like, use temp
      condition,
      description: condition.toLowerCase(),
      city: city,
      isRealData: true, // Flag to indicate this is real API data
    });
  } catch (error) {
    console.error("Weather API error", error);
    // Return fallback on any error
    return NextResponse.json({
      temp: 72,
      condition: "Sunny",
      feels_like: 72,
      city: DEFAULT_CITY,
      error: "Unable to fetch weather data",
      isRealData: false,
    });
  }
}
