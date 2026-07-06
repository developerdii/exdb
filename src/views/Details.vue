<script setup>
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import exercises from '../data/exercises.json'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { locale, t } = useLocale()

const exercise = exercises.find(e => e.id === props.id)

function goBack() {
  router.back()
}
</script>

<template>
  <div class="details" v-if="exercise">
    <button class="back" @click="goBack">&larr; {{ t('back') }}</button>
    <h1>{{ exercise.name }}</h1>

    <p class="tags">
      <span>{{ exercise.body_part }}</span>
      <span>{{ exercise.equipment }}</span>
      <span>{{ exercise.target }}</span>
    </p>

    <h3>{{ t('instructions') }}</h3>
    <p class="instructions">{{ exercise.instructions[locale] || exercise.instructions.en }}</p>

    <h3>{{ t('steps') }}</h3>
    <ol class="steps">
      <li v-for="(step, i) in (exercise.instruction_steps[locale] || exercise.instruction_steps.en)" :key="i">{{ step }}</li>
    </ol>

    <h3>{{ t('muscles') }}</h3>
    <p><strong>{{ t('primary') }}:</strong> {{ exercise.muscle_group }}</p>
    <p v-if="exercise.secondary_muscles.length"><strong>{{ t('secondary') }}:</strong> {{ exercise.secondary_muscles.join(', ') }}</p>
  </div>
  <div v-else class="not-found">
    <h1>{{ t('notFound') }}</h1>
    <button class="back" @click="goBack">&larr; {{ t('back') }}</button>
  </div>
</template>

<style scoped>
.details, .not-found {
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
  margin-bottom: 12px;
}
.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tags span {
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  text-transform: capitalize;
}
.instructions {
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
}
.steps {
  padding-left: 20px;
  line-height: 1.6;
}
.steps li {
  margin-bottom: 8px;
}
</style>
