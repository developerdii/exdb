<script setup>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from './composables/useLocale'
import { useTheme } from './composables/useTheme'
import TrainingPanel from './components/TrainingPanel.vue'

const router = useRouter()
const { locale, setLocale } = useLocale()
const { theme, toggle: toggleTheme } = useTheme()

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'EN' },
  { code: 'it', flag: '🇮🇹', name: 'IT' },
  { code: 'tr', flag: '🇹🇷', name: 'TR' },
  { code: 'es', flag: '🇪🇸', name: 'ES' },
  { code: 'ru', flag: '🇷🇺', name: 'RU' },
  { code: 'zh', flag: '🇨🇳', name: 'ZH' },
]

const showTraining = ref(false)
const addExercise = ref(null)

function openTraining() {
  addExercise.value = null
  showTraining.value = true
}

function addToTraining(exercise) {
  addExercise.value = exercise
  showTraining.value = true
}

provide('addToTraining', addToTraining)
</script>

<template>
  <nav class="navbar">
    <span class="brand" @click="router.push('/')">ExDB</span>
    <div class="nav-right">
      <button class="nav-btn" @click="toggleTheme" :title="theme === 'light' ? 'Dark mode' : 'Light mode'">
        <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <button class="nav-btn" @click="openTraining" title="Training Program">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
      </button>
      <select v-model="locale" @change="setLocale(locale)" class="lang-select">
        <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.flag }} {{ l.name }}</option>
      </select>
    </div>
  </nav>
  <div class="page">
    <router-view />
  </div>
  <TrainingPanel :show="showTraining" :addExercise="addExercise" @close="showTraining = false" @added="showTraining = false" />
</template>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: var(--bg-nav);
  border-bottom: 1px solid var(--border-light);
}
.brand {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 1px;
  cursor: pointer;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-btn {
  background: none;
  border: 1px solid var(--border-input);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
}
.nav-btn:hover {
  background: var(--bg-hover);
  color: var(--primary);
  border-color: var(--primary);
}
.lang-select {
  padding: 6px 10px;
  border: 1px solid var(--border-input);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text);
  cursor: pointer;
}
.page {
  padding-top: 56px;
}
</style>
