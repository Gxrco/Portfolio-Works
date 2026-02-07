import es from '../locales/es.json';
import en from '../locales/en.json';

export type Locale = 'es' | 'en';

const translations = {
  es,
  en,
};

export function getTranslations(locale: Locale = 'es') {
  return translations[locale] || translations.es;
}
