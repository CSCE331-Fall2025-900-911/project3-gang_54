'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LanguageCode = "en" | "es" | "zh";

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

export function useTranslation(texts: string[]) {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const translationsCache = useRef<Partial<Record<LanguageCode, Record<string, string>>>>({});

  const TRANSLATABLE_STRINGS = useMemo(() => Array.from(new Set(texts)), [texts]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    if (language === "en") {
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    const cached = translationsCache.current[language];
    if (cached) {
      setTranslations(cached);
      setTranslationError(null);
      setIsTranslating(false);
      return () => abortController.abort();
    }

    async function translate() {
      try {
        setIsTranslating(true);
        setTranslationError(null);

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: TRANSLATABLE_STRINGS, targetLanguage: language }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error("Translation request failed.");

        const data = (await response.json()) as { translations?: Record<string, string> };
        if (!data.translations) throw new Error("Translation data missing.");

        if (!cancelled) {
          translationsCache.current[language] = data.translations;
          setTranslations(data.translations);
          setIsTranslating(false);
        }
      } catch (error) {
        if (cancelled || abortController.signal.aborted) return;
        console.error("Translation error", error);
        setTranslationError("We couldn't translate right now. Showing original text.");
        setIsTranslating(false);
        setTranslations({});
      }
    }

    void translate();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [language, TRANSLATABLE_STRINGS]);

  const display = useCallback(
    (text: string | undefined | null) => {
      if (!text) return "";
      return translations[text] ?? text;
    },
    [translations]
  );

  return {
    language,
    setLanguage,
    display,
    isTranslating,
    translationError,
  };
}


