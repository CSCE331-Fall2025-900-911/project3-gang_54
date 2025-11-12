import { NextRequest, NextResponse } from "next/server";

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

    const params = new URLSearchParams();
    texts.forEach((text) => {
      if (typeof text === "string" && text.trim().length > 0) {
        params.append("q", text);
      }
    });

    if (params.getAll("q").length === 0) {
      return NextResponse.json({ error: "No valid text strings provided for translation." }, { status: 400 });
    }

    params.append("target", targetLanguage);
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
      console.error("Google Translate API error", response.status, errorBody);
      return NextResponse.json({ error: "Translation service error." }, { status: 502 });
    }

    const data = (await response.json()) as {
      data?: { translations?: Array<{ translatedText: string }> };
    };

    const translationList = data.data?.translations ?? [];

    const translatedRecord: Record<string, string> = {};

    let index = 0;
    for (const original of texts) {
      if (typeof original !== "string" || original.trim().length === 0) {
        // skip invalid original entries to maintain alignment
        continue;
      }
      const translated = translationList[index]?.translatedText ?? original;
      translatedRecord[original] = decodeHtmlEntities(translated);
      index += 1;
    }

    return NextResponse.json({ translations: translatedRecord });
  } catch (error) {
    console.error("Unexpected translate route error", error);
    return NextResponse.json({ error: "Unable to process translation request." }, { status: 500 });
  }
}


