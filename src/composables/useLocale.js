import { ref, computed } from 'vue'
import { translations } from './translations'

const locale = ref(localStorage.getItem('locale') || 'en')

export function useLocale() {
  function setLocale(l) {
    locale.value = l
    localStorage.setItem('locale', l)
  }
  function t(key) {
    const map = translations[locale.value] || translations.en
    return map[key] || key
  }
  return { locale, setLocale, t }
}
