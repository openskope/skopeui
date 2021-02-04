<template>
  <v-app light>
    <Header />
    <DiscoverSideBar />
    <v-main>
      <v-container class="mt-5" fluid>
        <Messages />
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import Header from '@/components/global/Header'
import DiscoverSideBar from '@/components/DiscoverSideBar'
import Messages from '@/components/Messages'
import Footer from '@/components/global/Footer'

@Component({
  components: {
    Header,
    DiscoverSideBar,
    Messages,
    Footer,
  },
})
class BaseDefault extends Vue {}
export default BaseDefault
</script>
