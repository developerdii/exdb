<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import exercises from '../data/exercises.json'

const props = defineProps({
  bodyPart: { type: String, default: '' },
  tag: { type: String, default: '' },
})
const router = useRouter()
const route = useRoute()
const { t } = useLocale()
const addToTraining = inject('addToTraining')

const searchQuery = ref('')

const filteredByPart = computed(() => {
  if (props.tag) {
    return exercises.filter(e =>
      e.target === props.tag ||
      e.muscle_group === props.tag ||
      e.equipment === props.tag ||
      e.body_part === props.tag ||
      (e.secondary_muscles && e.secondary_muscles.includes(props.tag))
    )
  }
  if (props.bodyPart) {
    return exercises.filter(e => e.body_part === props.bodyPart)
  }
  return exercises
})

const equipmentOptions = computed(() =>
  [...new Set(filteredByPart.value.map(e => e.equipment))]
)

const selectedEquipment = ref(route.query.equipment || '')

const filteredExercises = computed(() => {
  let result = selectedEquipment.value
    ? filteredByPart.value.filter(e => e.equipment === selectedEquipment.value)
    : filteredByPart.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.name.toLowerCase().includes(q) || e.target.toLowerCase().includes(q))
  }
  return result
})

const pageTitle = computed(() => {
  if (props.tag) return `${props.tag} ${t('exercises')}`
  return `${props.bodyPart} ${t('exercises')}`
})

watch(() => route.query.equipment, (val) => {
  selectedEquipment.value = val || ''
})

function selectEquipment(eq) {
  selectedEquipment.value = eq
  router.replace({
    query: eq ? { equipment: eq } : {}
  })
}

function viewDetails(id) {
  router.push({ name: 'Details', params: { id } })
}

function viewTag(tag) {
  if (!tag) return
  router.push({ name: 'TagList', params: { tag } })
}

function goBack() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="list">
    <button class="back" @click="goBack">&larr; {{ t('back') }}</button>
    <h1>{{ pageTitle }}</h1>

    <div class="filters" v-if="equipmentOptions.length && props.bodyPart">
      <button
        v-for="eq in equipmentOptions"
        :key="eq"
        :class="['filter-btn', { active: selectedEquipment === eq }]"
        @click="selectEquipment(selectedEquipment === eq ? '' : eq)"
      >
        {{ eq }}
      </button>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        :placeholder="t('searchPlaceholder')"
      />
    </div>

    <div class="grid" v-if="filteredExercises.length">
      <div
        v-for="ex in filteredExercises"
        :key="ex.id"
        class="card"
        @click="viewDetails(ex.id)"
      >
        <div class="card-row">
          <div class="card-info">
            <h3>{{ ex.name }}</h3>
            <div class="tags">
              <span class="tag" @click.stop="viewTag(ex.target)">{{ ex.target }}</span>
              <span class="tag tag-alt" @click.stop="viewTag(ex.muscle_group)">{{ ex.muscle_group }}</span>
            </div>
          </div>
          <button class="plus-btn" @click.stop="addToTraining(ex)" title="Add to training">+</button>
        </div>
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
  margin-bottom: 16px;
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
.search-bar {
  margin-bottom: 20px;
}
.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
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
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card h3 {
  margin: 0 0 8px;
  text-transform: capitalize;
}
.plus-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #4a90d9;
  background: white;
  color: #4a90d9;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  line-height: 1;
}
.plus-btn:hover {
  background: #4a90d9;
  color: white;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  background: #e8f0fe;
  color: #4a90d9;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  text-transform: capitalize;
  transition: background 0.15s;
}
.tag:hover {
  background: #4a90d9;
  color: white;
}
.tag-alt {
  background: #f0e8f8;
  color: #7c5cbf;
}
.tag-alt:hover {
  background: #7c5cbf;
  color: white;
}
.empty {
  text-align: center;
  color: #999;
}
</style>
