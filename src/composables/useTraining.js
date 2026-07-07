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
    if (!raw) return []
    const data = JSON.parse(raw)
    // Migrate old exercises without sets to new format
    for (const day of data) {
      for (const ex of day.exercises) {
        if (!ex.sets) {
          ex.sets = [{ reps: null, weight: null }, { reps: null, weight: null }, { reps: null, weight: null }]
        }
        if (!ex.history) {
          ex.history = []
        }
      }
    }
    return data
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

  function addExerciseToDay(dayId, exercise, setsCount = 3) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    if (day.exercises.find(e => e.exerciseId === exercise.id)) return
    const sets = Array.from({ length: setsCount }, () => ({ reps: null, weight: null }))
    day.exercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      order: day.exercises.length + 1,
      sets,
      history: [],
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

  function updateSetReps(dayId, exerciseId, setIndex, reps) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    const ex = day.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex || !ex.sets[setIndex]) return
    ex.sets[setIndex].reps = reps === '' || reps === null ? null : Number(reps)
  }

  function updateSetWeight(dayId, exerciseId, setIndex, weight) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    const ex = day.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex || !ex.sets[setIndex]) return
    ex.sets[setIndex].weight = weight === '' || weight === null ? null : Number(weight)
  }

  function addSetToExercise(dayId, exerciseId) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    const ex = day.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) return
    ex.sets.push({ reps: null, weight: null })
  }

  function removeSet(dayId, exerciseId, setIndex) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    const ex = day.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex || ex.sets.length <= 1) return
    ex.sets.splice(setIndex, 1)
  }

  function completeWorkout(dayId) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    for (const ex of day.exercises) {
      const snapshot = ex.sets.map(s => ({ reps: s.reps, weight: s.weight }))
      ex.history.push({
        date: new Date().toISOString().split('T')[0],
        sets: snapshot,
      })
      // Reset sets for next workout
      ex.sets = ex.sets.map(() => ({ reps: null, weight: null }))
    }
  }

  function updateExerciseOrder(dayId, exerciseId, newOrder) {
    const day = trainingDays.value.find(d => d.id === dayId)
    if (!day) return
    const ex = day.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) return
    const oldOrder = ex.order
    if (newOrder < 1 || newOrder > day.exercises.length) return
    const other = day.exercises.find(e => e.order === newOrder)
    if (other) other.order = oldOrder
    ex.order = newOrder
  }

  return {
    trainingDays,
    days,
    addDay,
    removeDay,
    addExerciseToDay,
    removeExerciseFromDay,
    getExercisesForDay,
    updateSetReps,
    updateSetWeight,
    addSetToExercise,
    removeSet,
    completeWorkout,
    updateExerciseOrder,
  }
}