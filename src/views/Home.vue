<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { locale, setLocale, t } = useLocale()
const svgContent = ref('')
const hoveredPart = ref(null)

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'EN' },
  { code: 'it', flag: '🇮🇹', name: 'IT' },
  { code: 'tr', flag: '🇹🇷', name: 'TR' },
  { code: 'es', flag: '🇪🇸', name: 'ES' },
  { code: 'ru', flag: '🇷🇺', name: 'RU' },
  { code: 'zh', flag: '🇨🇳', name: 'ZH' },
]

const zones = [
  { key: 'chest', labelKey: 'chest', x: 65, y: 50, w: 75, h: 60 },
  { key: 'back', labelKey: 'backLabel', x: 280, y: 50, w: 75, h: 100 },
  { key: 'waist', labelKey: 'waist', x: 65, y: 115, w: 75, h: 75 },
  { key: 'upper legs', labelKey: 'upperLegs', x: 68, y: 195, w: 68, h: 60 },
  { key: 'lower legs', labelKey: 'lowerLegs', x: 68, y: 260, w: 68, h: 42 },
]

function selectBodyPart(part) {
  router.push({ name: 'ExerciseList', params: { bodyPart: part } })
}

onMounted(async () => {
  const res = await fetch(import.meta.env.BASE_URL + 'body.svg')
  let svg = await res.text()

  let overlay = '\n<g id="opencode-overlay" style="pointer-events:all">\n'
  for (const z of zones) {
    overlay += `<rect class="ozone" data-part="${z.key}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="transparent" style="cursor:pointer"/>\n`
    overlay += `<text data-plabel="${z.key}" x="${z.x + z.w/2}" y="${z.y + z.h/2 + 5}" text-anchor="middle" fill="#fff" font-size="13" font-weight="900" style="opacity:0;pointer-events:none" stroke="#000" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${t(z.labelKey)}</text>\n`
  }
  overlay += '</g>'

  svg = svg.replace('</svg>', overlay + '</svg>')
  svgContent.value = svg
})

watch(() => svgContent.value, () => {
  setTimeout(() => {
    document.querySelectorAll('.ozone').forEach(rect => {
      rect.addEventListener('mouseenter', () => {
        hoveredPart.value = rect.getAttribute('data-part')
        const label = document.querySelector(`[data-plabel="${hoveredPart.value}"]`)
        if (label) label.style.opacity = '1'
      })
      rect.addEventListener('mouseleave', () => {
        const label = document.querySelector(`[data-plabel="${hoveredPart.value}"]`)
        if (label) label.style.opacity = '0'
        hoveredPart.value = null
      })
      rect.addEventListener('click', () => {
        selectBodyPart(rect.getAttribute('data-part'))
      })
    })
  }, 100)
})

watch(locale, () => {
  document.querySelectorAll('[data-plabel]').forEach(el => {
    const key = el.getAttribute('data-plabel')
    for (const z of zones) {
      if (z.key === key) { el.textContent = t(z.labelKey); break }
    }
  })
})
</script>

<template>
  <div class="home">
    <div class="top-bar">
      <span class="brand">ExDB</span>
      <select v-model="locale" @change="setLocale(locale)" class="lang-select">
        <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.flag }} {{ l.name }}</option>
      </select>
    </div>
    <h1>{{ t('selectBodyPart') }}</h1>
    <div class="body-map">
      <div class="svg-wrap" v-html="svgContent"></div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
  min-height: 100vh;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.brand {
  font-size: 20px;
  font-weight: 800;
  color: #4a90d9;
  letter-spacing: 1px;
}
.lang-select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}
h1 {
  margin-bottom: 20px;
}
.body-map {
  display: flex;
  justify-content: center;
}
.svg-wrap :deep(svg) {
  width: 100%;
  max-width: 750px;
  height: auto;
}
</style>
