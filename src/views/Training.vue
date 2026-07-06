<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTraining } from '../composables/useTraining'

const router = useRouter()
const { trainingDays, days, removeDay, removeExerciseFromDay } = useTraining()

const sortedDays = computed(() => {
  const order = days.map(d => d.value)
  return [...trainingDays.value].sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day))
})

function goBack() {
  router.push('/')
}

function getDayLabel(dayValue) {
  return days.find(d => d.value === dayValue)?.label || dayValue
}
</script>

<template>
  <div class="training-page">
    <button class="back" @click="goBack">&larr; Back</button>
    <h1>Training Program</h1>

    <div v-if="sortedDays.length" class="days-list">
      <div v-for="day in sortedDays" :key="day.id" class="day-block">
        <div class="day-tag">
          <span class="dot"></span>
          <span class="label">{{ getDayLabel(day.day).substring(0, 3) }}</span>
        </div>
        <div class="day-info">
          <div class="day-header">
            <h2>{{ day.name }}</h2>
            <span class="day-full-label">{{ getDayLabel(day.day) }}</span>
            <button class="btn-remove" @click="removeDay(day.id)" title="Remove">×</button>
          </div>
          <div class="exercises" v-if="day.exercises.length">
            <div v-for="ex in day.exercises" :key="ex.exerciseId" class="ex-row">
              <span class="order">{{ ex.order }}</span>
              <span class="ex-name">{{ ex.name }}</span>
              <button class="btn-rm-ex" @click="removeExerciseFromDay(day.id, ex.exerciseId)">×</button>
            </div>
          </div>
          <div v-else class="no-ex">No exercises added</div>
        </div>
      </div>
    </div>
    <div v-else class="empty">
      <p>No training days yet.</p>
      <p>Click the program button in the navbar to create your first training day.</p>
    </div>
  </div>
</template>

<style scoped>
.training-page {
  padding: 20px;
  max-width: 700px;
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
  margin-bottom: 24px;
}
.days-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.day-block {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.day-tag {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #4a90d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
  margin-bottom: 2px;
}
.label {
  font-size: 11px;
  font-weight: 700;
  color: white;
}
.day-info {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}
.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}
.day-header h2 {
  margin: 0;
  font-size: 16px;
}
.day-full-label {
  font-size: 12px;
  color: #999;
}
.btn-remove {
  margin-left: auto;
  background: none;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
}
.btn-remove:hover {
  color: #e44;
}
.exercises {
  padding: 8px 16px 12px;
}
.ex-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}
.ex-row:last-child {
  border-bottom: none;
}
.order {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a90d9;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ex-name {
  flex: 1;
  text-transform: capitalize;
  font-size: 14px;
}
.btn-rm-ex {
  background: none;
  border: none;
  color: #ccc;
  font-size: 16px;
  cursor: pointer;
}
.btn-rm-ex:hover {
  color: #e44;
}
.no-ex {
  padding: 12px 16px;
  color: #bbb;
  font-size: 13px;
  font-style: italic;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
