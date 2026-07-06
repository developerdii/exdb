<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import exercises from '../data/exercises.json'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { locale, t } = useLocale()
const addToTraining = inject('addToTraining')

const exercise = exercises.find(e => e.id === props.id)

function goBack() {
  router.back()
}

function viewTag(tag) {
  router.push({ name: 'TagList', params: { tag } })
}
</script>

<template>
  <div class="details" v-if="exercise">
    <button class="back" @click="goBack">&larr; {{ t('back') }}</button>
    <div class="title-row">
      <h1>{{ exercise.name }}</h1>
      <button class="plus-btn" @click="addToTraining(exercise)" title="Add to training">+</button>
    </div>

    <p class="toptags">
      <span class="toptag tlink" @click="router.push({ name: 'ExerciseList', params: { bodyPart: exercise.body_part } })">{{ exercise.body_part }}</span>
      <span class="toptag tlink" @click="viewTag(exercise.equipment)">{{ exercise.equipment }}</span>
      <span class="toptag tlink" @click="viewTag(exercise.target)">{{ exercise.target }}</span>
    </p>

    <h3>{{ t('instructions') }}</h3>
    <p class="instructions">{{ exercise.instructions[locale] || exercise.instructions.en }}</p>

    <h3>{{ t('steps') }}</h3>
    <ol class="steps">
      <li v-for="(step, i) in (exercise.instruction_steps[locale] || exercise.instruction_steps.en)" :key="i">{{ step }}</li>
    </ol>

    <h3>{{ t('muscles') }}</h3>
    <p><strong>{{ t('primary') }}:</strong> <span class="tlink" @click="viewTag(exercise.muscle_group)">{{ exercise.muscle_group }}</span></p>
    <p v-if="exercise.secondary_muscles.length"><strong>{{ t('secondary') }}:</strong>
      <template v-for="(sm, i) in exercise.secondary_muscles" :key="sm">
        <span class="tlink" @click="viewTag(sm)">{{ sm }}</span>{{ i < exercise.secondary_muscles.length - 1 ? ', ' : '' }}
      </template>
    </p>
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
  color: var(--text-link);
  padding: 8px 0;
}
h1 {
  text-transform: capitalize;
  margin: 0;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.plus-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  background: var(--bg-card);
  color: var(--primary);
  font-size: 22px;
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
  background: var(--primary);
  color: white;
}
.toptags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.toptag {
  background: var(--bg-tag);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  text-transform: capitalize;
}
.tlink {
  background: var(--bg-tag-blue);
  color: var(--primary);
  cursor: pointer;
  transition: background 0.15s;
}
.tlink:hover {
  background: var(--primary);
  color: white;
}
.instructions {
  line-height: 1.6;
  color: var(--text);
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
