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

  const TRANSLATABLE_STRINGS = useMemo(() => Array.from(new Set(texts)), [texts]);
  const stringsKey = useMemo(() => TRANSLATABLE_STRINGS.sort().join("|"), [TRANSLATABLE_STRINGS]);

  // Only clear cache when the actual strings change (not just reference)
  useEffect(() => {
    // Don't clear cache - preserve translations across string updates
    // Only clear if strings actually changed significantly
  }, [stringsKey]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    if (language === "en") {
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    // Skip if no strings to translate
    if (TRANSLATABLE_STRINGS.length === 0) {
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    // Check cache for current language
    const cached = translationsCache.current[language];
    
    // Find missing strings that need translation
    const missingStrings = cached 
      ? TRANSLATABLE_STRINGS.filter(str => !(str in cached))
      : TRANSLATABLE_STRINGS;

    // If we have cached translations, use them immediately (even if incomplete)
    if (cached && Object.keys(cached).length > 0) {
      // Filter to only include strings we currently need
      const relevantTranslations: Record<string, string> = {};
      TRANSLATABLE_STRINGS.forEach(str => {
        if (str in cached) {
          relevantTranslations[str] = cached[str];
        }
      });
      setTranslations(relevantTranslations);
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

        console.log(`[Translation] Fetching translations for ${missingStrings.length} missing strings (${TRANSLATABLE_STRINGS.length} total) in ${language}`);

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: missingStrings, targetLanguage: language }),
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
          translationsCache.current[language] = {
            ...translationsCache.current[language],
            ...data.translations,
          };
          
          // Update translations state with all cached translations for current strings
          const allTranslations: Record<string, string> = {};
          TRANSLATABLE_STRINGS.forEach(str => {
            if (str in translationsCache.current[language]!) {
              allTranslations[str] = translationsCache.current[language]![str];
            }
          });
          
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