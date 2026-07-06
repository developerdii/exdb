<script setup>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from './composables/useLocale'
import TrainingPanel from './components/TrainingPanel.vue'

const router = useRouter()
const { locale, setLocale } = useLocale()

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
      <button class="nav-btn" @click="openTraining" title="Training Program">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
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
  background: #fff;
  border-bottom: 1px solid #eee;
}
.brand {
  font-size: 20px;
  font-weight: 800;
  color: #4a90d9;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  transition: all 0.15s;
}
.nav-btn:hover {
  background: #f0f0f0;
  color: #4a90d9;
  border-color: #4a90d9;
}
.lang-select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}
.page {
  padding-top: 56px;
}
</style>
