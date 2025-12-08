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
      hasOpenWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      googleTranslateKeyLength: process.env.GOOGLE_TRANSLATE_API_KEY?.length || 0,
      openWeatherKeyLength: process.env.OPENWEATHER_API_KEY?.length || 0,
    },
    tests: {},
  };

  // Test Weather API
  if (process.env.OPENWEATHER_API_KEY) {
    try {
      const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=College%20Station,TX,US&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`;
      const weatherRes = await fetch(testUrl, { cache: "no-store" });
      const weatherData = await weatherRes.json();
      
      results.tests.weather = {
        status: weatherRes.status,
        ok: weatherRes.ok,
        hasData: !!weatherData.main,
        error: weatherData.message || (weatherRes.ok ? null : "API call failed"),
      };
    } catch (error) {
      results.tests.weather = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  } else {
    results.tests.weather = {
      error: "OPENWEATHER_API_KEY not set",
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

