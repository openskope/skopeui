<template>
  <v-app light>
    <Header />
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
import Footer from '../components/Footer'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Header,
    Footer
  }
}
</script>
