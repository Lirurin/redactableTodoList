import Router from 'vue-router'

import home from './views/Todo.vue'
import change from './views/Change.vue'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'List',
      component: home,
      props: true
    },{
      path: '/change',
      name: 'Change',
      component: change,
      props: true
    }
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})