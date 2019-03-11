<template>
  <div>
    <v-app light />
    <Header />
    <side-bar />
    <div>
      <v-content>
        <v-container fluid>
          <nuxt />
        </v-container>
      </v-content>
    </div>
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
