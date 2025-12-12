'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslationContext } from "../contexts/TranslationContext";

export type LanguageCode = "en" | "es" | "zh";

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

export function useTranslation(texts: string[]) {
  const { language, setLanguage: setGlobalLanguage } = useTranslationContext();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const translationsCache = useRef<Partial<Record<LanguageCode, Record<string, string>>>>({});

  // Create a stable array reference and deduplicate
  const TRANSLATABLE_STRINGS = useMemo(() => {
    const unique = Array.from(new Set(texts.filter(t => t && typeof t === 'string' && t.trim().length > 0)));
    console.log(`[useTranslation] Processing ${unique.length} unique strings (from ${texts.length} input)`);
    return unique;
  }, [texts]);
  
  // Create a stable key for the strings array
  const stringsKey = useMemo(() => {
    const key = TRANSLATABLE_STRINGS.sort().join("|");
    console.log(`[useTranslation] stringsKey updated, length: ${key.length}`);
    return key;
  }, [TRANSLATABLE_STRINGS]);

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
    const cached = translationsCache.current[currentLanguage];
    
    // Find missing strings that need translation
    const missingStrings = cached 
      ? currentStrings.filter(str => !(str in cached))
      : currentStrings;

    // If we have cached translations, use them immediately (even if incomplete)
    if (cached && Object.keys(cached).length > 0) {
      // Filter to only include strings we currently need
      const relevantTranslations: Record<string, string> = {};
      currentStrings.forEach(str => {
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

        console.log(`[Translation] Fetching translations for ${missingStrings.length} missing strings (${currentStrings.length} total) in ${currentLanguage}`);

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: missingStrings, targetLanguage: currentLanguage }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("[Translation] API error:", errorData);
          throw new Error(errorData.error || errorData.details || "Translation request failed.");
        }

        const data = (await response.json()) as { translations?: Record<string, string>; error?: string };
        if (data.error) {
          console.error("[Translation] Error in response:", data.error);
          throw new Error(data.error);
        }
        if (!data.translations) {
          console.error("[Translation] No translations in response");
          throw new Error("Translation data missing.");
        }

        console.log(`[Translation] Received ${Object.keys(data.translations).length} new translations`);

        if (!cancelled) {
          // Merge with existing cache
          translationsCache.current[currentLanguage] = {
            ...translationsCache.current[currentLanguage],
            ...data.translations,
          };
          
          // Update translations state with all cached translations for current strings
          // Use the latest strings to avoid stale closures
          const latestStrings = TRANSLATABLE_STRINGS;
          const allTranslations: Record<string, string> = {};
          latestStrings.forEach(str => {
            if (str in translationsCache.current[currentLanguage]!) {
              allTranslations[str] = translationsCache.current[currentLanguage]![str];
            }
          });
          
          console.log(`[useTranslation] Setting ${Object.keys(allTranslations).length} translations for ${latestStrings.length} strings`);
          setTranslations(allTranslations);
          setIsTranslating(false);
        }
      } catch (error) {
        if (cancelled || abortController.signal.aborted) return;
        const err = error instanceof Error ? error.message : "Unknown error";
        console.error("[Translation] Translation failed:", err);
        setTranslationError(`Translation unavailable: ${err}. Showing original text.`);
        setIsTranslating(false);
        // Don't clear translations on error - keep what we have
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