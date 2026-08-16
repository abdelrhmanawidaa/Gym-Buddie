import { createContext, useContext } from 'react';
import { en, type TranslationKey } from './translations';

export type Lang = 'en' | 'ar';

export interface I18nValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used inside <I18nProvider>');
  return ctx;
}

/** Picks the right localised field off a record that carries `x` and `xAr`. */
export function localized(row: object, field: string, lang: Lang): string {
  const rec = row as Record<string, unknown>;
  if (lang === 'ar') {
    const arVal = rec[`${field}Ar`];
    if (typeof arVal === 'string' && arVal.trim()) return arVal;
  }
  const base = rec[field];
  return typeof base === 'string' ? base : '';
}

export const FALLBACK_DICT = en;
