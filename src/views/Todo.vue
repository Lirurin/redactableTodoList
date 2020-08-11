<template lang="pug">
  .todo
    FocusTrap(:disabled="!trapActive")
      Dialog(
        :shown="dialog.show"
        :message="dialog.message"
        @decision="handleDecision"
      )
    h2.todo__header Список дел
    .todo__list
      .todo__task(v-for="(todo, index) of todos")
        .todo__inner
          h3.todo__task-name {{ todo.title }}
          ul.todo__task-list
            li.todo__task-item(v-for="item of filterItems(index)"
              :class="{done: item.checked}"
            ) {{ item.task }}
          span.todo__task-additional(v-if="todos[index].tasks.length - 2 > 0") - еще {{ todos[index].tasks.length - 2  }} в списке -
          .todo__task-controls
            router-link(
              :to="{ name: 'Change', params: { title: todo.title, tasks: todo.tasks, index } }"
            )
              .todo__task-action.todo__task-action--change
            .todo__task-action.todo__task-action--delete(@click="showDialog(`Вы уверены что хотите удалить задачу ${todo.title}?`, 'delete', index)")
      .todo__task
        .todo__inner
          .todo__create(@click="addToList")
            span.todo__create-text Добавить

</template>

<script>
import Dialog from '../components/Dialog/Dialog'
import Trap from 'vue-focus-lock'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',

  components: {
    Dialog,
    FocusTrap: Trap
  },

  data() {
    return {
      trapActive: false,

      dialog: {
        index: null,
        show: false,
        message: '',
        answer: null,
        delete: false,
        discard: false,
      },

      todos: [],
    }
  },

  methods: {
    ...mapGetters(['getTodos']),
    ...mapActions(['deleteFromList', 'addToList', 'loadState', 'saveState']),

    handleDecision(value) {
      (value && this.dialog.delete) ? this.deleteTodo() : this.hideDialog();
    },

    deleteTodo() {
      this.deleteFromList(this.dialog.index);
      this.hideDialog();
      this.saveState();
    },

    showDialog(message, action, index) {
      this.trapActive = true;
      this.dialog.index = index;
      this.dialog.show = true;
      this.dialog.message = message;
      action === 'delete' ? this.dialog.delete = true : this.dialog.discard = true;
    },

    hideDialog() {
      this.trapActive = false;
      this.dialog.show = false;
      this.dialog.message = '';
      this.dialog.answer = null;
      this.dialog.delete = false;
      this.dialog.discard = false;
    },

    filterItems(index) {
      return this.todos[index].tasks.slice(0, 2)
    }
  },

  mounted() {
    this.loadState();
    this.todos = this.getTodos();
  },

}
</script>

<style lang="sass" src="../assets/styles/views/Todo.sass"/>