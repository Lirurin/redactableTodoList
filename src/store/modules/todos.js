export default {
  actions: {
    deleteFromList(ctx, index) {
      ctx.commit('deleteTodo', index)
      ctx.commit('saveTodos')
    },
    addToList(ctx) {
      ctx.commit('addTodo')
      ctx.commit('saveTodos')
    },
    changeListItem(ctx, {index, title, tasks}) {
      ctx.commit('rewriteListItem', {index, title, tasks})
    },
    saveState(ctx) {
      ctx.commit('saveTodos')
    },
    loadState(ctx) {
      ctx.commit('loadTodos')
    },
  },
  mutations: {
    deleteTodo(state, index) {
      state.todos.splice(index, 1)
    },
    addTodo(state) {
      state.todos.push({
        title: 'Новая задача',
        tasks: []
      })
    },
    rewriteListItem(state, {index, title, tasks}) {
      state.todos[index] = {
        title,
        tasks
      }
    },
    saveTodos(state) {
      localStorage.setItem('savedStateData', JSON.stringify(state.todos));
    },
    loadTodos(state) {
      localStorage.getItem('savedStateData') !== null ? state.todos = JSON.parse(localStorage.getItem('savedStateData')): null
    }
  },
  getters: {
    getTodos(state) {
      return state.todos
    },
  },
  state: {
    todos: [
      {
        title: "Задача 1",
        tasks: [
          {
            task: 'Подзадача 1',
            checked: false
          },
          {
            task: 'Подзадача 2',
            checked: false
          },
          {
            task: 'Подзадача 3',
            checked: true
          },
          {
            task: 'Подзадача 4',
            checked: false
          }
        ]
      }
    ]
  }
}