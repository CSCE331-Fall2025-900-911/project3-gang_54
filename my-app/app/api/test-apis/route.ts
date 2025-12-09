import { NextRequest, NextResponse } from "next/server";

/**
 * Test API Route - Helps debug API configuration issues
 * 
 * This endpoint checks if environment variables are set and tests API connectivity
 */

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGoogleTranslateKey: !!process.env.GOOGLE_TRANSLATE_API_KEY,
      googleTranslateKeyLength: process.env.GOOGLE_TRANSLATE_API_KEY?.length || 0,
      note: "Open-Meteo API does not require an API key",
    },
    tests: {},
  };

  // Test Weather API (Open-Meteo - no API key required)
  try {
    const testUrl = `https://api.open-meteo.com/v1/forecast?latitude=30.6279&longitude=-96.3344&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
    const weatherRes = await fetch(testUrl, { cache: "no-store" });
    const weatherData = await weatherRes.json();
    
    results.tests.weather = {
      status: weatherRes.status,
      ok: weatherRes.ok,
      hasData: !!weatherData.current?.temperature_2m,
      temperature: weatherData.current?.temperature_2m,
      weatherCode: weatherData.current?.weather_code,
      error: weatherRes.ok ? null : "API call failed",
    };
  } catch (error) {
    results.tests.weather = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Test Google Translate API
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    try {
      const params = new URLSearchParams();
      params.append("q", "Hello");
      params.append("target", "es");
      params.append("source", "en");
      params.append("format", "text");
      
      const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(process.env.GOOGLE_TRANSLATE_API_KEY)}`;
      const translateRes = await fetch(translateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        cache: "no-store",
      });
      
      const translateData = await translateRes.json();
      
      results.tests.translate = {
        status: translateRes.status,
        ok: translateRes.ok,
        hasData: !!translateData.data?.translations,
        error: translateData.error?.message || (translateRes.ok ? null : "API call failed"),
        errorDetails: translateData.error,
      };
    } catch (error) {
      results.tests.translate = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  } else {
    results.tests.translate = {
      error: "GOOGLE_TRANSLATE_API_KEY not set",
    };
  }

  return NextResponse.json(results, { status: 200 });
}

