<template>
  <div>
    <v-app light />
    <Header />
    <side-bar />
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <Footer />
  </div>
</template>

<script>
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Footer from '../components/Footer'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Header,
    SideBar,
    Footer
  }
}
</script>
