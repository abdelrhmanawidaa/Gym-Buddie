import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import db from '../db';
import { useSettings } from '../lib/useSettings';
import { en, ar, type TranslationKey } from '../lib/translations';
import { I18nContext, interpolate, type I18nValue, type Lang } from '../lib/i18n';

const DICTS: Record<Lang, Record<string, string>> = { en, ar };

export default function I18nProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const lang: Lang = settings.lang ?? 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback(
    async (next: Lang) => {
      const existing = await db.settings.toCollection().first();
      if (existing?.id) {
        await db.settings.update(existing.id, { lang: next });
      } else {
        await db.settings.add({ ...settings, lang: next });
      }
    },
    [settings],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const dict = DICTS[lang] ?? en;
      return interpolate(dict[key] ?? en[key] ?? key, params);
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, dir, t, setLang }), [lang, dir, t, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
