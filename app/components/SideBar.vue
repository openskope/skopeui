<template>
  <v-navigation-drawer
    fixed
    app
  >
    <section class="sidebar">
      <!-- sidebar sort -->
      <side-bar-sort />
      <!-- end sidebar sort -->
    </section>
  </v-navigation-drawer>
</template>

<script>
import SideBarSort from '../components/SideBarSort'

export default {
  name: 'SideBar',
  components: {
    SideBarSort
  },
  data() {
    return {
      fixed: false
    }
  }
}
</script>

<style scoped>
.sidebar {
  padding-top: 30px;
}
</style>
