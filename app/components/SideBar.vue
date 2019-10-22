<template>
  <v-navigation-drawer absolute app style="position: fixed">
    <!-- had to fixed style since fixed prop didn't work -->
    <section class="sidebar">
      <discover-side-bar />
    </section>
  </v-navigation-drawer>
</template>

<script>
import DiscoverSideBar from '../components/DiscoverSideBar'

export default {
  name: 'SideBar',
  components: {
    DiscoverSideBar
  }
}
</script>

<style scoped>
.sidebar {
  padding-top: 30px;
}
</style>
