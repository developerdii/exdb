<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTraining } from '../composables/useTraining'

const props = defineProps({
  show: { type: Boolean, default: false },
  addExercise: { type: Object, default: null },
})
const emit = defineEmits(['close', 'added'])

const router = useRouter()
const { trainingDays, days, addDay, removeDay, addExerciseToDay, removeExerciseFromDay } = useTraining()

const sortedDays = computed(() => {
  const order = days.map(d => d.value)
  return [...trainingDays.value].sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day))
})

const editingDay = ref(null)
const newName = ref('')

const configuredDays = computed(() => {
  return days.map(d => {
    const existing = trainingDays.value.find(td => td.day === d.value)
    return { ...d, configured: !!existing, trainingDay: existing }
  })
})

function startEditing(day) {
  editingDay.value = day.value
  newName.value = ''
}

function saveDay(day) {
  if (!newName.value.trim()) return
  addDay(day.value, newName.value.trim())
  editingDay.value = null
  newName.value = ''
}

function handleAddExercise(dayId) {
  if (!props.addExercise) return
  addExerciseToDay(dayId, props.addExercise)
  emit('added')
}

function handleRemoveDay(trainingDay) {
  if (!trainingDay) return
  removeDay(trainingDay.id)
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

      <div class="days-section">
        <div v-for="day in configuredDays" :key="day.value" class="day-row">
          <div class="day-tag" :class="{ active: day.configured, editing: editingDay === day.value }">
            <span class="dot"></span>
            <span class="label">{{ day.label.substring(0, 3) }}</span>
          </div>

          <div class="day-content">
            <template v-if="editingDay === day.value">
              <input
                v-model="newName"
                class="name-input"
                placeholder="Name (e.g. Push)"
                @keyup.enter="saveDay(day)"
                autofocus
              />
              <button class="save-btn" @click="saveDay(day)">Save</button>
            </template>

            <template v-else-if="day.configured">
              <span class="day-name">{{ day.trainingDay.name }}</span>
              <div class="day-exercises" v-if="day.trainingDay.exercises.length">
                <span v-for="ex in day.trainingDay.exercises" :key="ex.exerciseId" class="mini-ex">
                  {{ ex.name }}
                  <button v-if="!addExercise" class="rm-ex" @click="handleRemoveExercise(day.trainingDay.id, ex.exerciseId)">×</button>
                </span>
              </div>
              <div class="day-actions">
                <button v-if="addExercise" class="add-btn" @click="handleAddExercise(day.trainingDay.id)">+ Add here</button>
                <button class="rm-day" @click="handleRemoveDay(day.trainingDay)" title="Remove day">Remove</button>
              </div>
            </template>

            <template v-else>
              <button class="config-btn" @click="startEditing(day)">+ Set name</button>
            </template>
          </div>
        </div>
      </div>

      <div class="panel-footer">
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
  background: var(--bg-card);
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
  border-bottom: 1px solid var(--border-light);
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
  color: var(--text-muted);
}
.add-notice {
  padding: 12px 20px;
  background: var(--bg-notice);
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
}
.days-section {
  flex: 1;
  padding: 16px 20px;
}
.day-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}
.day-tag {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.day-tag.active {
  border-color: var(--primary);
  background: var(--primary);
}
.day-tag.active .dot {
  background: white;
}
.day-tag.active .label {
  color: white;
}
.day-tag.editing {
  border-color: #f0a030;
  background: #f0a030;
}
.day-tag.editing .dot {
  background: white;
}
.day-tag.editing .label {
  color: white;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
  margin-bottom: 2px;
}
.label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
}
.day-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}
.name-input {
  padding: 6px 10px;
  border: 1px solid var(--border-input);
  border-radius: 4px;
  font-size: 13px;
  background: var(--bg-card);
  color: var(--text);
  width: 140px;
  margin-right: 6px;
}
.name-input::placeholder {
  color: var(--text-muted);
}
.save-btn {
  padding: 6px 14px;
  background: #f0a030;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.day-name {
  font-weight: 700;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}
.day-exercises {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}
.mini-ex {
  background: var(--bg-tag);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.rm-ex {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.rm-ex:hover {
  color: var(--danger);
}
.day-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.add-btn {
  padding: 3px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.rm-day {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
}
.rm-day:hover {
  color: var(--danger);
}
.config-btn {
  padding: 4px 12px;
  background: none;
  border: 1px dashed var(--border-input);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-muted);
}
.config-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
}
.btn-full {
  padding: 8px 16px;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-left: auto;
}
</style>
