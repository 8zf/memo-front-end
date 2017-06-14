import Vue from 'vue'
import Router from 'vue-router'
import Test from '@/components/Test'
import noteForm from '@/components/noteForm'
import note from '@/components/note'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/test',
      name: 'Test',
      component: Test
    },
    {
      path: '/note/:id',
      name: 'Note',
      component: noteForm
    }
  ]
})
