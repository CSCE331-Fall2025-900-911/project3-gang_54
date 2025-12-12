"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslationContext } from "../contexts/TranslationContext";

export type LanguageCode = "en" | "es" | "zh";

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function useTranslation(texts: string[]) {
  const { language, setLanguage: setGlobalLanguage } = useTranslationContext();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const translationsCache = useRef<
    Partial<Record<LanguageCode, Record<string, string>>>
  >({});

  const TRANSLATABLE_STRINGS = useMemo(
    () => Array.from(new Set(texts)),
    [texts]
  );
  const stringsKey = useMemo(
    () => TRANSLATABLE_STRINGS.sort().join("|"),
    [TRANSLATABLE_STRINGS]
  );

  // Only clear cache when the actual strings change (not just reference)
  useEffect(() => {
    // Don't clear cache - preserve translations across string updates
    // Only clear if strings actually changed significantly
  }, [stringsKey]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    // Capture current values to avoid stale closures
    const currentStrings = TRANSLATABLE_STRINGS;
    const currentLanguage = language;

    console.log(`[useTranslation] Effect triggered - language: ${currentLanguage}, stringsKey length: ${stringsKey.length}, strings count: ${currentStrings.length}`);

    if (currentLanguage === "en") {
      console.log(`[useTranslation] Language is English, clearing translations`);
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    // Skip if no strings to translate
    if (currentStrings.length === 0) {
      console.log(`[useTranslation] No strings to translate`);
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    // Check cache for current language
    const cached = translationsCache.current[language];

    // Find missing strings that need translation
    const missingStrings = cached
      ? TRANSLATABLE_STRINGS.filter((str) => !(str in cached))
      : TRANSLATABLE_STRINGS;

    // If we have cached translations, use them immediately (even if incomplete)
    if (cached && Object.keys(cached).length > 0) {
      // Filter to only include strings we currently need
      const relevantTranslations: Record<string, string> = {};
      TRANSLATABLE_STRINGS.forEach((str) => {
        if (str in cached) {
          relevantTranslations[str] = cached[str];
        }
      });
      console.log(`[useTranslation] Using ${Object.keys(relevantTranslations).length} cached translations out of ${currentStrings.length} needed`);
      if (!cancelled) {
        setTranslations(relevantTranslations);
      }
    } else {
      console.log(`[useTranslation] No cached translations found for language ${currentLanguage}`);
    }

    // If all strings are cached, we're done
    if (missingStrings.length === 0) {
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    // Fetch translations for missing strings
    async function translate() {
      try {
        setIsTranslating(true);
        setTranslationError(null);

        const BATCH_SIZE = 40; // safely under Google limits
        const batches = chunkArray(missingStrings, BATCH_SIZE);

        console.log(
          `[Translation] Translating ${missingStrings.length} strings in ${batches.length} batches (${language})`
        );

        const mergedTranslations: Record<string, string> = {};

        for (const batch of batches) {
          if (cancelled || abortController.signal.aborted) return;

          const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: batch,
              targetLanguage: language,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            console.error("[Translation] API error:", errorData);
            throw new Error(errorData.error || "Translation request failed.");
          }

          const data = await response.json();
          if (!data.translations) {
            throw new Error("Missing translations in response.");
          }

          Object.assign(mergedTranslations, data.translations);
        }

        if (!cancelled) {
          translationsCache.current[language] = {
            ...translationsCache.current[language],
            ...mergedTranslations,
          };

          const allTranslations: Record<string, string> = {};
          TRANSLATABLE_STRINGS.forEach((str) => {
            const cachedValue = translationsCache.current[language]?.[str];
            if (cachedValue) allTranslations[str] = cachedValue;
          });

          setTranslations(allTranslations);
          setIsTranslating(false);
        }
      } catch (error) {
        if (cancelled || abortController.signal.aborted) return;
        const err = error instanceof Error ? error.message : "Unknown error";
        console.error("[Translation] Translation failed:", err);
        setTranslationError(
          `Translation unavailable: ${err}. Showing original text.`
        );
        setIsTranslating(false);
      }
    }

    translate();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [language, stringsKey]);

  const display = useCallback(
    (text: string | undefined | null) => {
      if (!text) return "";
      return translations[text] ?? text;
    },
    [translations]
  );

  return {
    language,
    setLanguage: setGlobalLanguage,
    display,
    isTranslating,
    translationError,
  };
}
