<template>
  <v-navigation-drawer
    absolute
    app
  >
    <section class="sidebar">
      <!-- sidebar sort -->
      <discover-side-bar />
      <!-- end sidebar sort -->
    </section>
  </v-navigation-drawer>
</template>

<script>
import DiscoverSideBar from '../components/DiscoverSideBar'

export default {
  name: 'SideBar',
  components: {
    DiscoverSideBar
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
