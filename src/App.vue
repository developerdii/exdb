<script setup>
import { useRouter } from 'vue-router'
import { useLocale } from './composables/useLocale'

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
</script>

<template>
  <nav class="navbar">
    <span class="brand" @click="router.push('/')">ExDB</span>
    <select v-model="locale" @change="setLocale(locale)" class="lang-select">
      <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.flag }} {{ l.name }}</option>
    </select>
  </nav>
  <div class="page">
    <router-view />
  </div>
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
