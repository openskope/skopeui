<template>
  <v-app light>
    <Header />
    <dataset-side-bar />
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import Header from '../components/Header'
import DatasetSideBar from '../components/DatasetSideBar'
import Footer from '../components/Footer'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Header,
    DatasetSideBar,
    Footer
  }
}
</script>
