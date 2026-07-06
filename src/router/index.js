import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ExerciseList from '../views/ExerciseList.vue'
import Details from '../views/Details.vue'
import Training from '../views/Training.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/exercises/:bodyPart?', name: 'ExerciseList', component: ExerciseList, props: true },
  { path: '/tag/:tag', name: 'TagList', component: ExerciseList, props: true },
  { path: '/exercise/:id', name: 'Details', component: Details, props: true },
  { path: '/training', name: 'Training', component: Training },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
