<script setup>
import { useRouter } from 'vue-router'
import { useTraining } from '../composables/useTraining'
import exercises from '../data/exercises.json'

const router = useRouter()
const { trainingDays, days, removeDay, removeExerciseFromDay } = useTraining()

function getExerciseById(id) {
  return exercises.find(e => e.id === id)
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="training-page">
    <button class="back" @click="goBack">&larr; Back</button>
    <h1>Training Program</h1>

    <div v-if="trainingDays.length" class="days-grid">
      <div v-for="day in trainingDays" :key="day.id" class="day-card">
        <div class="card-header">
          <div>
            <h2>{{ day.name }}</h2>
            <span class="day-label">{{ days.find(d => d.value === day.day)?.label }}</span>
          </div>
          <button class="btn-remove" @click="removeDay(day.id)" title="Remove day">×</button>
        </div>
        <div class="card-exercises" v-if="day.exercises.length">
          <div v-for="ex in day.exercises" :key="ex.exerciseId" class="exercise-row">
            <span class="order">{{ ex.order }}</span>
            <span class="ex-name">{{ ex.name }}</span>
            <button class="btn-remove-ex" @click="removeExerciseFromDay(day.id, ex.exerciseId)">×</button>
          </div>
        </div>
        <div v-else class="card-empty">No exercises added</div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No training days yet.</p>
      <p>Click the program button in the navbar to create your first training day.</p>
    </div>
  </div>
</template>

<style scoped>
.training-page {
  padding: 20px;
  max-width: 900px;
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
  margin-bottom: 20px;
}
.days-grid {
  display: grid;
  gap: 16px;
}
.day-card {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}
.card-header h2 {
  margin: 0;
  font-size: 17px;
}
.day-label {
  font-size: 12px;
  color: #999;
}
.btn-remove {
  background: none;
  border: none;
  color: #ccc;
  font-size: 22px;
  cursor: pointer;
}
.btn-remove:hover {
  color: #e44;
}
.card-exercises {
  padding: 8px 18px 12px;
}
.exercise-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}
.exercise-row:last-child {
  border-bottom: none;
}
.order {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4a90d9;
  color: white;
  font-size: 12px;
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
.btn-remove-ex {
  background: none;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
}
.btn-remove-ex:hover {
  color: #e44;
}
.card-empty {
  padding: 14px 18px;
  color: #bbb;
  font-size: 13px;
  font-style: italic;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
