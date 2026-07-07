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
const {
  trainingDays, days, addDay, removeDay, addExerciseToDay, removeExerciseFromDay,
  updateSetReps, updateSetWeight, addSetToExercise, removeSet,
} = useTraining()

const editingDay = ref(null)
const newName = ref('')
const setsCount = ref(3)
const expandedEx = ref({}) // dayId_exerciseId -> boolean

const configuredDays = computed(() => {
  return days.map(d => {
    const existing = trainingDays.value.find(td => td.day === d.value)
    return { ...d, configured: !!existing, trainingDay: existing }
  })
})

function expandKey(dayId, exId) {
  return dayId + '_' + exId
}

function toggleExpand(dayId, exId) {
  const key = expandKey(dayId, exId)
  expandedEx.value[key] = !expandedEx.value[key]
}

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
  addExerciseToDay(dayId, props.addExercise, setsCount.value)
  setsCount.value = 3
  emit('added')
}

function handleRemoveDay(trainingDay) {
  if (!trainingDay) return
  removeDay(trainingDay.id)
}

function handleRemoveExercise(dayId, exerciseId) {
  removeExerciseFromDay(dayId, exerciseId)
}

function exerciseSummary(ex) {
  if (!ex.sets) return ''
  const filledSets = ex.sets.filter(s => s.reps !== null)
  if (!filledSets.length) return `${ex.sets.length} sets`
  const parts = filledSets.map(s => {
    let str = `${s.reps || '-'}`
    if (s.weight) str += ` × ${s.weight}kg`
    return str
  })
  return parts.join(' / ')
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
        <div>Add <strong>{{ addExercise.name }}</strong> to:</div>
        <div class="set-picker">
          <label>Sets:</label>
          <button class="set-btn" @click="setsCount = Math.max(1, setsCount - 1)">−</button>
          <span class="set-val">{{ setsCount }}</span>
          <button class="set-btn" @click="setsCount = Math.min(10, setsCount + 1)">+</button>
        </div>
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
                <div v-for="ex in day.trainingDay.exercises" :key="ex.exerciseId" class="mini-ex-wrap">
                  <div class="mini-ex-header">
                    <span class="mini-ex-name">{{ ex.name }}</span>
                    <button
                      class="mini-ex-toggle"
                      @click="toggleExpand(day.trainingDay.id, ex.exerciseId)"
                    >
                      {{ expandedEx[expandKey(day.trainingDay.id, ex.exerciseId)] ? '▼' : '▶' }}
                    </button>
                    <button v-if="!addExercise" class="rm-ex" @click="handleRemoveExercise(day.trainingDay.id, ex.exerciseId)">×</button>
                  </div>
                  <span class="mini-ex-summary">{{ exerciseSummary(ex) }}</span>

                  <!-- Expanded set editor -->
                  <div v-if="expandedEx[expandKey(day.trainingDay.id, ex.exerciseId)]" class="sets-editor">
                    <div class="set-row" v-for="(s, si) in ex.sets" :key="si">
                      <span class="set-label">Set {{ si + 1 }}</span>
                      <input
                        type="number"
                        class="set-input"
                        min="0"
                        placeholder="Reps"
                        :value="s.reps"
                        @input="updateSetReps(day.trainingDay.id, ex.exerciseId, si, $event.target.value)"
                      />
                      <span class="set-sep">×</span>
                      <input
                        type="number"
                        class="set-input weight-input"
                        min="0"
                        step="0.5"
                        placeholder="kg"
                        :value="s.weight"
                        @input="updateSetWeight(day.trainingDay.id, ex.exerciseId, si, $event.target.value)"
                      />
                      <span class="set-unit">kg</span>
                      <button
                        v-if="ex.sets.length > 1"
                        class="btn-rm-set"
                        @click="removeSet(day.trainingDay.id, ex.exerciseId, si)"
                      >×</button>
                    </div>
                    <button class="btn-add-set" @click="addSetToExercise(day.trainingDay.id, ex.exerciseId)">+ Add set</button>
                  </div>
                </div>
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
.set-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.set-picker label {
  font-size: 13px;
  color: var(--text-muted);
}
.set-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-input);
  background: var(--bg-card);
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  line-height: 1;
}
.set-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.set-val {
  font-weight: 700;
  font-size: 16px;
  min-width: 20px;
  text-align: center;
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
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}
.mini-ex-wrap {
  background: var(--bg-tag);
  padding: 6px 8px;
  border-radius: 10px;
  font-size: 11px;
}
.mini-ex-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mini-ex-name {
  text-transform: capitalize;
  font-weight: 600;
  font-size: 12px;
  flex: 1;
}
.mini-ex-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 10px;
  cursor: pointer;
  padding: 2px 4px;
}
.mini-ex-toggle:hover {
  color: var(--primary);
}
.rm-ex {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}
.rm-ex:hover {
  color: var(--danger);
}
.mini-ex-summary {
  color: var(--text-muted);
  font-size: 10px;
  display: block;
  margin-top: 2px;
}
.sets-editor {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.set-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.set-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  width: 34px;
  flex-shrink: 0;
}
.set-input {
  width: 50px;
  padding: 4px 6px;
  border: 2px solid var(--border-input);
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-card);
  color: var(--text);
  outline: none;
  text-align: center;
  transition: border-color 0.15s;
}
.set-input:focus {
  border-color: var(--primary);
}
.set-input::placeholder {
  color: var(--text-dim);
  font-size: 10px;
}
/* Hide number spinners */
.set-input::-webkit-outer-spin-button,
.set-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.set-input[type=number] {
  -moz-appearance: textfield;
}
.weight-input {
  width: 45px;
}
.set-sep {
  font-size: 11px;
  color: var(--text-dim);
}
.set-unit {
  font-size: 10px;
  color: var(--text-dim);
}
.btn-rm-set {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
}
.btn-rm-set:hover {
  color: var(--danger);
}
.btn-add-set {
  background: none;
  border: 1px dashed var(--border-input);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
  margin-top: 2px;
}
.btn-add-set:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.day-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
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