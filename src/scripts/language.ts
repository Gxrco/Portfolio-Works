export function initLanguage() {
  const currentLang = localStorage.getItem('locale') || 'es';

  document.documentElement.lang = currentLang;
}

export function switchLanguage(newLang: 'es' | 'en') {
  localStorage.setItem('locale', newLang);
  window.location.reload();
}

if (typeof window !== 'undefined') {
  initLanguage();
}
