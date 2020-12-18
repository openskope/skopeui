<template>
  <v-app light>
    <Header />
    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Footer from '@/components/global/Footer.vue'
import Header from '@/components/global/Header.vue'

export default {
  name: 'Dashboard',
  components: { Footer, Header },
}
</script>
