<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useTraining } from '../composables/useTraining'

const props = defineProps({
  show: { type: Boolean, default: false },
  addExercise: { type: Object, default: null },
})
const emit = defineEmits(['close', 'added'])

const router = useRouter()
const { t } = useLocale()
const { trainingDays, days, addDay, removeDay, addExerciseToDay, removeExerciseFromDay } = useTraining()

const showAddDay = ref(false)
const newDayName = ref('')
const selectedDay = ref('monday')
const showDayPicker = ref(false)

function handleAddDay() {
  if (!newDayName.value.trim()) return
  addDay(selectedDay.value, newDayName.value.trim())
  newDayName.value = ''
  showAddDay.value = false
}

function handleAddExercise(dayId) {
  if (!props.addExercise) return
  addExerciseToDay(dayId, props.addExercise)
  emit('added')
}

function handleRemoveDay(id) {
  removeDay(id)
}

function handleRemoveExercise(dayId, exerciseId) {
  removeExerciseFromDay(dayId, exerciseId)
}

function openFullView() {
  emit('close')
  router.push('/training')
}
</script>

<template>
  <div v-if="show" class="overlay" @click.self="emit('close')">
    <div class="panel">
      <div class="panel-header">
        <h2>Training Program</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div v-if="addExercise" class="add-notice">
        Add <strong>{{ addExercise.name }}</strong> to:
      </div>

      <div class="days-list" v-if="trainingDays.length">
        <div v-for="day in trainingDays" :key="day.id" class="day-block">
          <div class="day-header">
            <div class="day-info">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-label">{{ days.find(d => d.value === day.day)?.label }}</span>
            </div>
            <div class="day-actions">
              <button v-if="addExercise" class="btn-add" @click="handleAddExercise(day.id)">+ Add</button>
              <button class="btn-remove" @click="handleRemoveDay(day.id)" title="Remove day">×</button>
            </div>
          </div>
          <div class="day-exercises" v-if="day.exercises.length">
            <div v-for="ex in day.exercises" :key="ex.exerciseId" class="exercise-row">
              <span class="ex-order">{{ ex.order }}.</span>
              <span class="ex-name">{{ ex.name }}</span>
              <button v-if="!addExercise" class="btn-remove-ex" @click="handleRemoveExercise(day.id, ex.exerciseId)">×</button>
            </div>
          </div>
          <div v-else class="empty-day">No exercises yet</div>
        </div>
      </div>
      <div v-else class="empty">No training days yet</div>

      <div v-if="showAddDay" class="add-day-form">
        <select v-model="selectedDay" class="day-select">
          <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
        <input v-model="newDayName" class="day-input" placeholder="Day name (e.g. Push)" @keyup.enter="handleAddDay" />
        <button class="btn-save" @click="handleAddDay">Save</button>
      </div>

      <div class="panel-footer">
        <button class="btn-new-day" @click="showAddDay = !showAddDay">
          {{ showAddDay ? 'Cancel' : '+ New Day' }}
        </button>
        <button class="btn-full" @click="openFullView">View Full Program</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}
.panel {
  width: 100%;
  max-width: 420px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.panel-header h2 {
  margin: 0;
  font-size: 18px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.add-notice {
  padding: 12px 20px;
  background: #f0f7ff;
  border-bottom: 1px solid #d0e3f7;
  font-size: 14px;
}
.days-list {
  flex: 1;
  padding: 12px 20px;
}
.day-block {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fafafa;
}
.day-name {
  font-weight: 700;
  font-size: 15px;
}
.day-label {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}
.day-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.btn-add {
  padding: 4px 12px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}
.btn-remove {
  background: none;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
}
.btn-remove:hover {
  color: #e44;
}
.day-exercises {
  padding: 6px 14px 10px;
}
.exercise-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 13px;
}
.ex-order {
  color: #999;
  font-size: 12px;
  min-width: 20px;
}
.ex-name {
  flex: 1;
  text-transform: capitalize;
}
.btn-remove-ex {
  background: none;
  border: none;
  color: #ccc;
  font-size: 16px;
  cursor: pointer;
}
.btn-remove-ex:hover {
  color: #e44;
}
.empty-day {
  padding: 8px 14px;
  color: #bbb;
  font-size: 13px;
  font-style: italic;
}
.empty {
  padding: 20px;
  color: #999;
  text-align: center;
}
.add-day-form {
  padding: 12px 20px;
  display: flex;
  gap: 8px;
  border-top: 1px solid #eee;
}
.day-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}
.day-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}
.btn-save {
  padding: 8px 16px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}
.btn-new-day {
  padding: 8px 16px;
  border: 2px dashed #ddd;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}
.btn-full {
  padding: 8px 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-left: auto;
}
</style>
