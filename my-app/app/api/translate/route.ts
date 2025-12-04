import { NextRequest, NextResponse } from "next/server";

/**
 * Google Translate API Route
 * 
 * Uses Google Cloud Translation API v2
 * Endpoint: https://translation.googleapis.com/language/translate/v2
 * 
 * Requires GOOGLE_TRANSLATE_API_KEY environment variable
 * Enable the Cloud Translation API in Google Cloud Console
 * Get your API key at: https://console.cloud.google.com/apis/credentials
 */

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Google Translate API key. Set GOOGLE_TRANSLATE_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null) as {
      texts?: unknown;
      targetLanguage?: unknown;
    };

    const { texts, targetLanguage } = body ?? {};

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Request must include a non-empty texts array." }, { status: 400 });
    }

    if (typeof targetLanguage !== "string" || targetLanguage.trim().length === 0) {
      return NextResponse.json({ error: "Request must include a valid targetLanguage." }, { status: 400 });
    }

    // Filter valid text strings
    const validTexts = texts.filter((text): text is string => 
      typeof text === "string" && text.trim().length > 0
    );

    if (validTexts.length === 0) {
      return NextResponse.json({ error: "No valid text strings provided for translation." }, { status: 400 });
    }

    // Google Translate API v2 requires form-urlencoded format
    const params = new URLSearchParams();
    validTexts.forEach((text) => {
      params.append("q", text);
    });
    params.append("target", targetLanguage);
    params.append("source", "en");
    params.append("format", "text");

    const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Translation service error.";
      let errorDetails = "";
      
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorJson.error?.errors?.[0]?.message || errorJson.error || errorMessage;
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error("Google Translate API error", response.status, errorJson);
      } catch {
        console.error("Google Translate API error", response.status, errorBody);
        errorDetails = errorBody;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails || "Check that GOOGLE_TRANSLATE_API_KEY is set correctly and has Translate API enabled.",
          status: response.status
        }, 
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 }
      );
    }

    const data = (await response.json()) as {
      data?: { translations?: Array<{ translatedText: string }> };
    };

    const translationList = data.data?.translations ?? [];

    const translatedRecord: Record<string, string> = {};

    // Map translations back to original texts in order
    let translationIndex = 0;
    for (const original of texts) {
      if (typeof original === "string" && original.trim().length > 0) {
        const translated = translationList[translationIndex]?.translatedText ?? original;
        translatedRecord[original] = decodeHtmlEntities(translated);
        translationIndex += 1;
      } else {
        // For invalid entries, use original as-is
        if (typeof original === "string") {
          translatedRecord[original] = original;
        }
      }
    }

    return NextResponse.json({ translations: translatedRecord });
  } catch (error) {
    console.error("Unexpected translate route error", error);
    return NextResponse.json({ error: "Unable to process translation request." }, { status: 500 });
  }
}


