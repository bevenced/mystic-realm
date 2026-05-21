import { cookies, headers } from "next/headers";
import type { Locale, Dictionary } from "./config";
import { DEFAULT_LOCALE, getLocaleFromBrowser } from "./config";
import { dictionary as enDict } from "./dictionaries/en";
import { dictionary as zhCNDict } from "./dictionaries/zh-CN";
import { dictionary as zhTWDict } from "./dictionaries/zh-TW";

const DICTIONARIES: Record<Locale, Dictionary> = {
  en: enDict,
  "zh-CN": zhCNDict,
  "zh-TW": zhTWDict,
};

export function getServerLocale(): Locale {
  try {
    const cookieStore = cookies();
    const localePref = cookieStore.get("locale")?.value as Locale | undefined;
    if (localePref) return localePref;

    // Fall back to browser Accept-Language
    const headersList = headers();
    const acceptLanguage = headersList.get("accept-language") || undefined;
    return getLocaleFromBrowser(acceptLanguage);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getServerTranslation(): Dictionary {
  const locale = getServerLocale();
  return DICTIONARIES[locale] || enDict;
}
