<template lang="pug">
  .change(
    :class="{'redacted': !inputBlocked}"
  )
    FocusTrap(:disabled="!trapActive")
      Dialog( ref="dialog"
        :shown="dialog.show"
        :message="dialog.message"
        @decision="handleDecision"
      )

    template(v-if="title === undefined && tasks === undefined || deleted" )
      .change__placeholder
        span.change__text 
          | Выберите задачу на
          br
          router-link(:to="'/'") главной странице

    template(v-else)
      .change__inner
        .change__actions.change__actions--top
          router-link(:to="{ name: 'List' }")
            span.change__action.change__action--back
          button.change__action.change__action--delete(@click="showDialog(`Вы уверены что хотите удалить задачу ${title}?`, 'delete')") Удалить из списка
          button.change__action(@click="letChanges" :class="{'change__action--stop': !inputBlocked, 'change__action--redact': inputBlocked}")
        .change__title-wrap( :class='{ redactable: !inputBlocked }')
          h2.change__title Заголовок:
        label.change__label.change__label--title(:for="title")
          span.change__caption(
            v-if="inputBlocked"
          ) {{ localChanges.title.old }}
          input.change__input( type="text" autocomplete='off'
            :id="title"
            v-if="!inputBlocked"
            v-model="localChanges.title.old"
          )
          span.change__return(
            :class="{ 'back' : showRevertBack, 'forward': showRevertForward && !showRevertBack }"
            @click="showRevertBack ? revertTitle('old'): revertTitle('new')"
          )
        .change__title-wrap( :class='{ redactable: !inputBlocked }')
          h2.change__title Подзадачи:
        label.change__label( v-for="(item, index) in localChanges.tasks" 
          :class="{ redactable: !inputBlocked }"
        )
          span.change__task-delete( v-if="!inputBlocked" @click="removeTask(index)")
          span.change__caption(
            v-if="inputBlocked"
          ) {{ item.old }}
          input.change__input(type='text' autocomplete='off'
            :class="{ 'padded' : (checkRevertBack(index) || checkRevertForward(index))}"
            v-if="!inputBlocked"
            v-model="item.old"
          )
          span.change__return.change__return--task(
            :class="{ 'back' : checkRevertBack(index), 'forward': checkRevertForward(index) && !checkRevertBack(index)}"
            @click="checkRevertBack(index)? revertTask('old', index): revertTask('new', index)"
          )
          label(:for="index")
            input.change__check(type='checkbox' 
              :checked='item.checked'
              :id='index'
              v-model="item.checked"
            )
        button.change__action.change__action--add(
          v-if="!inputBlocked"
          @click="addTask"
        ) Добавить
        .change__actions.change__actions--bottom
          button.change__action.change__action--discard(
            @click="showDialog('Вы уверены что хотите отменить все изменения?', 'discard')"
          ) Отменить изменения
          button.change__action.change__action--save(
            @click="saveAll"
            :disabled="!savable"
          ) Сохранить
</template>

<script>
import Dialog from '../components/Dialog/Dialog'
import Trap from 'vue-focus-lock'
import { mapActions } from 'vuex'

export default {

  props: {
    index: Number,
    title: String,
    tasks: Array,
  },

  components: {
    Dialog,
    FocusTrap: Trap
  },
  
  data() {
    return {
      inputBlocked: true,
      deleted: false,
      trapActive: false,
      taskListChanged: false,

      localData: {
        title:  {
          old: '',
          new: ''
        },
        tasks: []
      },
      localChanges: {
        title: {
          old: '',
          new: ''
        },
        tasks: [],
      },

      dialog: {
        index: null,
        show: false,
        message: '',
        answer: null,
        delete: false,
        discard: false,
      },
    }
  },

  methods: {
    ...mapActions(['deleteFromList', 'addToList', 'changeListItem', 'saveState']),

    letChanges() {
      this.inputBlocked = !this.inputBlocked;
    },

    revertTitle(type) {
      if (type === 'old') {
        this.localChanges.title.new = this.localChanges.title.old;
        this.localChanges.title.old = this.localData.title.old;
      } else {
        this.localChanges.title.old = this.localChanges.title.new;
        this.localChanges.title.new = '';
      }
    },

    revertTask(type, index) {
      if (type === 'old') {
        this.localChanges.tasks[index].new = this.localChanges.tasks[index].old;
        this.localData.tasks[index] !== undefined ? this.localChanges.tasks[index].old = this.localData.tasks[index].old : this.localChanges.tasks[index].old = 'Новая подзадача'
      } else {
        this.localChanges.tasks[index].old = this.localChanges.tasks[index].new;
        this.localChanges.tasks[index].new = '';
      }
    },
    
    checkRevertBack(index) {
      if (this.localData.tasks[index] !== undefined) {
        return this.localChanges.tasks[index].old !== this.localData.tasks[index].old && !this.inputBlocked;
      } else {
        return this.localChanges.tasks[index].old !== 'Новая подзадача' && !this.inputBlocked;
      }
    },

    checkRevertForward(index) {
      this.checkRevertBack(index)
      return this.localChanges.tasks[index].new !== '' && !this.inputBlocked;
    },
  
    saveAll() {
      let changedItem = {
        index: this.index,
        title: this.localChanges.title.old,
        tasks: [],
      }

      for (let task of this.localChanges.tasks) {
        changedItem.tasks.push({
          task: task.old,
          checked: task.checked,
        })
      }
      
      this.changeListItem(changedItem);
      this.setLocalChanges()
      this.inputBlocked = true;
      this.saveState();
    },

    discardAll() {
      this.inputBlocked = true;
      this.taskListChanged = false
      this.setLocalData();
      this.hideDialog();
    },

    handleDecision(value) {
      if (value && this.dialog.delete) {
        this.deleteTodo()
      } else if (value && this.dialog.discard) {
        this.discardAll()
      } else {
        this.hideDialog()
      }
    },

    deleteTodo() {
      this.deleted = true;
      this.deleteFromList(this.dialog.index);
      this.hideDialog();
      this.saveState();
    },

    showDialog(message, action) {
      this.dialog.show = true;
      this.trapActive = true;
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

    addTask() {
      let prevTasks = this.localData.tasks
      this.localChanges.tasks.push({ old: 'Новая подзадача',  new: '', checked: false, created: true });
      this.checkTasksChanges(prevTasks);
      this.localData.tasks.push({ old: 'Новая подзадача',  new: '', checked: false, created: true });
    },

    removeTask(index) {
      let prevTasks = this.localData.tasks
      this.localChanges.tasks.splice(index, 1);
      this.checkTasksChanges(prevTasks);
      this.localData.tasks.splice(index, 1);
    },

    checkTasksChanges(prevTasks) {
      let results = [];
      let isLengthEqual = this.localChanges.tasks.length === prevTasks.length;

      for (let i=0; i<this.localChanges.tasks.length; i++) {
        if (prevTasks[i] !== undefined) {
          results.push(this.localChanges.tasks.some(el => el.old === prevTasks[i].old && el.checked === prevTasks[i].checked));
        } else {
          results.push(false)
        }
      }

      isLengthEqual ? this.taskListChanged = results.some(el => el === false): this.taskListChanged = !isLengthEqual
    },

    setLocalData() {
      this.localChanges.title.old = this.title;
      this.localData.title.old = this.title;

      if (this.tasks !== undefined) {
        this.localChanges.tasks = [];
        this.localData.tasks = [];
        for (let item of this.tasks) {
          this.localChanges.tasks.push({ old: item.task,  new: '', checked: item.checked });
          this.localData.tasks.push({ old: item.task,  new: '', checked: item.checked });
        }
      }
    }, 

    setLocalChanges() {
      this.localData.title.old = this.localChanges.title.old;
      this.taskListChanged = false;

      this.localData.tasks = [];
      for (let item of this.localChanges.tasks) {
        this.localData.tasks.push({ old: item.old,  new: '', checked: item.checked });
      }
    },

    checkChange(type) {
      let result;
      switch (type) {
        case 'title':
          result = this.localChanges.title.old !== this.localData.title.old;
          break
        case 'taskText':
          result = this.localData.tasks.some((el, index) => el.old !== this.localChanges.tasks[index].old);
          break
        case 'taskState':
          result = this.localData.tasks.some((el, index) => el.checked !== this.localChanges.tasks[index].checked);
          break
        default:
          result = false;
          break
      }
      return result
    },
  },

  computed: {
    showRevertBack: function() {
      return this.localChanges.title.old !== this.localData.title.old && !this.inputBlocked;
    },

    showRevertForward: function() {
      return this.localChanges.title.new !== '' && !this.inputBlocked;
    },

    savable: function() {
      let titleChanges = this.checkChange('title'),
          taskTextChanges = this.checkChange('taskText'),
          taskStateChanges = this.checkChange('taskState');
      return (this.taskListChanged || titleChanges || taskTextChanges || taskStateChanges);
    },
  },
 
  mounted() {
    this.dialog.index = this.index;
    this.setLocalData();
  }

}
</script>

<style lang="sass" src="../assets/styles/views/Change.sass"/>