<template lang="pug">
  #app
    router-view
</template>

<script>
import router from './routes.js'
import store from './store'

export default {
  name: 'App',
  router,
  store,
}
</script>

<style lang="sass" src="./assets/styles/common/App.sass" />
