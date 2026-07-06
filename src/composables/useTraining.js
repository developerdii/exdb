import { ref, watch } from 'vue'

const STORAGE_KEY = 'exdb_training'

const days = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

function loadTrainingDays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const trainingDays = ref(loadTrainingDays())

watch(trainingDays, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useTraining() {
  function addDay(dayValue, name) {
    if (trainingDays.value.find(d => d.day === dayValue)) return
    const id = Date.now().toString(36)
    trainingDays.value.push({ id, day: dayValue, name, exercises: [] })
  }

  function removeDay(id) {
    trainingDays.value = trainingDays.value.filter(d => d.id !== id)
  }

  function addExerciseToDay(dayId, exercise) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    if (day.exercises.find(e => e.exerciseId === exercise.id)) return
    day.exercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      order: day.exercises.length + 1,
    })
  }

  function removeExerciseFromDay(dayId, exerciseId) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    day.exercises = day.exercises
      .filter(e => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i + 1 }))
  }

  function getExercisesForDay(dayId) {
    const day = trainingDays.value.find(d => d.id === dayId)
    return day ? day.exercises : []
  }

  return {
    trainingDays,
    days,
    addDay,
    removeDay,
    addExerciseToDay,
    removeExerciseFromDay,
    getExercisesForDay,
  }
}
