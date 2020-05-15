<template>
  <v-app light>
    <Header />
    <SideBar />
    <div>
      <v-content>
        <v-container fluid>
          <Messages />
          <nuxt />
        </v-container>
      </v-content>
    </div>
    <Footer />
  </v-app>
</template>

<script>
import Header from '@/components/Header'
import SideBar from '@/components/SideBar'
import Messages from '@/components/Messages'
import Footer from '@/components/Footer'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Header,
    SideBar,
    Messages,
    Footer
  }
}
</script>
