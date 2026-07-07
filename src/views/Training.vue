<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTraining } from '../composables/useTraining'

const router = useRouter()
const {
  trainingDays, days,
  removeDay, removeExerciseFromDay,
  updateSetReps, updateSetWeight,
  addSetToExercise, removeSet,
  completeWorkout,
} = useTraining()

const historyVisible = ref({}) // exerciseId -> boolean
const confirmDayId = ref(null)

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

function toggleHistory(exerciseId) {
  historyVisible.value[exerciseId] = !historyVisible.value[exerciseId]
}

function confirmComplete(dayId) {
  confirmDayId.value = dayId
}

function doCompleteWorkout() {
  if (confirmDayId.value) {
    completeWorkout(confirmDayId.value)
    confirmDayId.value = null
  }
}

function cancelComplete() {
  confirmDayId.value = null
}

function formatHistoryDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString()
}

function getLastHistory(ex) {
  if (!ex.history || !ex.history.length) return null
  return ex.history[ex.history.length - 1]
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
            <div class="day-header-left">
              <h2>{{ day.name }}</h2>
              <span class="day-full-label">{{ getDayLabel(day.day) }}</span>
            </div>
            <div class="day-header-actions">
              <button
                v-if="day.exercises.length"
                class="btn-complete"
                @click="confirmComplete(day.id)"
              >
                ✓ Complete
              </button>
              <button class="btn-remove" @click="removeDay(day.id)" title="Remove day">×</button>
            </div>
          </div>

          <div class="exercises" v-if="day.exercises.length">
            <div v-for="ex in day.exercises" :key="ex.exerciseId" class="ex-block">
              <div class="ex-header">
                <span class="order">{{ ex.order }}</span>
                <span class="ex-name">{{ ex.name }}</span>
                <button class="btn-rm-ex" @click="removeExerciseFromDay(day.id, ex.exerciseId)">×</button>
              </div>

              <!-- Sets table -->
              <table class="sets-table">
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Reps</th>
                    <th>Weight (kg)</th>
                    <th v-if="getLastHistory(ex)" class="th-last">Last</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(s, si) in ex.sets" :key="si">
                    <td class="set-num">{{ si + 1 }}</td>
                    <td>
                      <input
                        type="number"
                        class="set-input"
                        min="0"
                        placeholder="–"
                        :value="s.reps"
                        @input="updateSetReps(day.id, ex.exerciseId, si, $event.target.value)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        class="set-input"
                        min="0"
                        step="0.5"
                        placeholder="–"
                        :value="s.weight"
                        @input="updateSetWeight(day.id, ex.exerciseId, si, $event.target.value)"
                      />
                    </td>
                    <td v-if="getLastHistory(ex)" class="td-last">
                      <span v-if="getLastHistory(ex).sets[si]">
                        {{ getLastHistory(ex).sets[si].reps || '–' }}
                        <span v-if="getLastHistory(ex).sets[si].weight">× {{ getLastHistory(ex).sets[si].weight }}kg</span>
                      </span>
                      <span v-else class="no-data">–</span>
                    </td>
                    <td>
                      <button
                        v-if="ex.sets.length > 1"
                        class="btn-rm-set"
                        @click="removeSet(day.id, ex.exerciseId, si)"
                        title="Remove set"
                      >×</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button class="btn-add-set" @click="addSetToExercise(day.id, ex.exerciseId)">+ Add set</button>

              <!-- History toggle -->
              <div class="history-section" v-if="ex.history && ex.history.length">
                <button class="btn-history" @click="toggleHistory(ex.exerciseId)">
                  {{ historyVisible[ex.exerciseId] ? '▼' : '▶' }} History ({{ ex.history.length }})
                </button>
                <div v-if="historyVisible[ex.exerciseId]" class="history-list">
                  <div
                    v-for="(h, hi) in [...ex.history].reverse()"
                    :key="hi"
                    class="history-entry"
                  >
                    <span class="history-date">{{ formatHistoryDate(h.date) }}</span>
                    <span class="history-data">
                      <template v-for="(hs, hsi) in h.sets" :key="hsi">
                        <span class="hset">{{ hs.reps || '–' }}<template v-if="hs.weight"> × {{ hs.weight }}kg</template></span>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
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

    <!-- Confirm complete workout overlay -->
    <div v-if="confirmDayId" class="confirm-overlay" @click.self="cancelComplete">
      <div class="confirm-box">
        <h3>Complete Workout?</h3>
        <p>This will save today's sets to history and reset the values for your next workout.</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelComplete">Cancel</button>
          <button class="btn-confirm" @click="doCompleteWorkout">Complete</button>
        </div>
      </div>
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
  color: var(--text-link);
  padding: 8px 0;
}
h1 {
  margin-bottom: 24px;
}
.days-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  background: var(--primary);
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
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  overflow: hidden;
  min-width: 0;
}
.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-muted);
  border-bottom: 1px solid var(--border-light);
}
.day-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.day-header-left h2 {
  margin: 0;
  font-size: 16px;
}
.day-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.day-full-label {
  font-size: 12px;
  color: var(--text-muted);
}
.btn-complete {
  padding: 5px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-complete:hover {
  background: #388e3c;
}
.btn-remove {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}
.btn-remove:hover {
  color: var(--danger);
}
.exercises {
  padding: 8px 16px 12px;
}
.ex-block {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
.ex-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.ex-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.order {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--primary);
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
  font-size: 15px;
  font-weight: 600;
}
.btn-rm-ex {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 16px;
  cursor: pointer;
}
.btn-rm-ex:hover {
  color: var(--danger);
}
.sets-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px;
}
.sets-table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 600;
  padding: 4px 6px;
  text-align: left;
}
.sets-table th.th-last {
  color: #4caf50;
}
.sets-table td {
  padding: 3px 6px;
}
.set-num {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-muted);
  width: 30px;
}
.set-input {
  width: 60px;
  padding: 5px 8px;
  border: 2px solid var(--border-input);
  border-radius: 4px;
  font-size: 13px;
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
}
/* Hide number spinners for cleaner look */
.set-input::-webkit-outer-spin-button,
.set-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.set-input[type=number] {
  -moz-appearance: textfield;
}
.td-last {
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
}
.no-data {
  color: var(--text-dim);
}
.btn-rm-set {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  padding: 0 4px;
}
.btn-rm-set:hover {
  color: var(--danger);
}
.btn-add-set {
  background: none;
  border: 1px dashed var(--border-input);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
}
.btn-add-set:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.history-section {
  margin-top: 10px;
}
.btn-history {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 0;
}
.btn-history:hover {
  color: var(--primary);
}
.history-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.history-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--bg-muted);
}
.history-date {
  color: var(--text-muted);
  white-space: nowrap;
  font-weight: 600;
}
.history-data {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.hset {
  background: var(--bg-tag);
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--text);
}
.no-ex {
  padding: 16px;
  color: var(--text-dim);
  font-size: 13px;
  font-style: italic;
}
.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
}
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-box {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.confirm-box h3 {
  margin: 0 0 8px;
  font-size: 18px;
}
.confirm-box p {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.btn-cancel {
  padding: 8px 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-input);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text);
}
.btn-confirm {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm:hover {
  background: #388e3c;
}
</style>