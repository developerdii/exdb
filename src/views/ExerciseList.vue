<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import exercises from '../data/exercises.json'

const props = defineProps({ bodyPart: { type: String, default: '' } })
const router = useRouter()
const route = useRoute()
const { t } = useLocale()

const filteredByPart = computed(() =>
  exercises.filter(e => e.body_part === props.bodyPart)
)

const equipmentOptions = computed(() =>
  [...new Set(filteredByPart.value.map(e => e.equipment))]
)

const selectedEquipment = ref(route.query.equipment || '')

const filteredExercises = computed(() =>
  selectedEquipment.value
    ? filteredByPart.value.filter(e => e.equipment === selectedEquipment.value)
    : filteredByPart.value
)

function selectEquipment(eq) {
  selectedEquipment.value = eq
  router.replace({
    query: eq ? { equipment: eq } : {}
  })
}

function viewDetails(id) {
  router.push({ name: 'Details', params: { id } })
}

function goBack() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="list">
    <button class="back" @click="goBack">&larr; {{ t('back') }}</button>
    <h1>{{ props.bodyPart }} {{ t('exercises') }}</h1>

    <div class="filters" v-if="equipmentOptions.length">
      <button
        v-for="eq in equipmentOptions"
        :key="eq"
        :class="['filter-btn', { active: selectedEquipment === eq }]"
        @click="selectEquipment(selectedEquipment === eq ? '' : eq)"
      >
        {{ eq }}
      </button>
    </div>

    <div class="grid" v-if="filteredExercises.length">
      <div
        v-for="ex in filteredExercises"
        :key="ex.id"
        class="card"
        @click="viewDetails(ex.id)"
      >
        <h3>{{ ex.name }}</h3>
        <p class="meta">{{ ex.equipment }} &middot; {{ ex.target }}</p>
      </div>
    </div>
    <p v-else class="empty">{{ t('noResults') }}</p>
  </div>
</template>

<style scoped>
.list {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.back {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #4a90d9;
  padding: 8px 0;
}
h1 {
  text-transform: capitalize;
  margin-bottom: 16px;
}
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.2s;
}
.filter-btn.active {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}
.grid {
  display: grid;
  gap: 12px;
}
.card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card h3 {
  margin: 0 0 4px;
  text-transform: capitalize;
}
.meta {
  margin: 0;
  color: #777;
  font-size: 14px;
}
.empty {
  text-align: center;
  color: #999;
}
</style>
