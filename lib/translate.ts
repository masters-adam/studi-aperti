import translate from "google-translate-api-x";

type TranslationResult = {
  name: { en: string; it: string };
  description: { en: string; it: string };
};

async function translateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  if (!text.trim()) return text;
  try {
    const result = await translate(text, { from, to });
    return result.text;
  } catch (error) {
    console.error(`Translation failed (${from} -> ${to}):`, error);
    return text; // Return original on failure
  }
}

async function detectLanguage(text: string): Promise<"en" | "it"> {
  try {
    const result = await translate(text, { to: "en" });
    const detected = result.from.language.iso;
    return detected === "it" ? "it" : "en";
  } catch {
    return "en"; // Default to English on detection failure
  }
}

export async function translateListing(
  name: string,
  description: string
): Promise<TranslationResult> {
  // Detect language from description (longer text = better detection)
  const sourceLang = await detectLanguage(
    description.length > name.length ? description : name
  );
  const targetLang = sourceLang === "it" ? "en" : "it";

  const [translatedName, translatedDescription] = await Promise.all([
    translateText(name, sourceLang, targetLang),
    translateText(description, sourceLang, targetLang),
  ]);

  return {
    name: {
      [sourceLang]: name,
      [targetLang]: translatedName,
    } as { en: string; it: string },
    description: {
      [sourceLang]: description,
      [targetLang]: translatedDescription,
    } as { en: string; it: string },
  };
}
