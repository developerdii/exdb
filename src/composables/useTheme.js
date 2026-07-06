import { ref, watchEffect } from 'vue'

const theme = ref(localStorage.getItem('exdb_theme') || 'light')

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('exdb_theme', theme.value)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  return { theme, toggle }
}
