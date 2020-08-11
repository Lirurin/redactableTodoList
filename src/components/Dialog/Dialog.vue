<template lang="pug">
  .dialog( 
    :class="{shown}" 
    ref="container"
    @click="closeDialog($event)"  
  )
    .dialog__inner
      span.dialog__text {{ message }}
      .dialog__actions(ref="answers")
        button.dialog__btn(@click="confirmDecision(true)" ref="answer") Да
        button.dialog__btn(@click="confirmDecision(false)") Нет
</template>

<script>

export default {

  props: {
    shown: Boolean,
    message: String,
  },
  
  methods: {

    closeDialog(e) {
      if ( e.target === this.$refs.container && !e.target.closest('div').classList.contains('dialog__inner')) {
        this.$emit("decision", false);
      }
    },

    confirmDecision(answer) {
      this.$emit("decision", answer);
    },

    focusOnDialog() {
      this.$refs.answer.focus();
    }

  },
  watch: {

    shown() {
      this.focusOnDialog()
    }

  }
}
</script>

<style lang="sass" src="../../assets/styles/components/Dialog.sass"/>