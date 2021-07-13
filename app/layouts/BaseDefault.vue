<template>
  <v-app light>
    <Header />
    <v-main>
      <v-container fluid>
        <v-dialog v-model="firstTimeUser" persistent max-width="600">
          <v-card>
            <v-card-title class="headline">
              Are you a first time user?
            </v-card-title>
            <v-card-text class="subtitle-1"
              >If yes, you can enable hints throughout the app.</v-card-text
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn outlined color="accent" text @click="setFirstTime(false)">
                No, I am not a first time user.
              </v-btn>
              <v-btn depressed color="accent" text @click="setFirstTime(true)">
                Yes, enable tutorial mode.
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <DiscoverSideBar />
        <Messages />
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Header from "@/components/global/Header";
import DiscoverSideBar from "@/components/DiscoverSideBar";
import Messages from "@/components/Messages";
import Footer from "@/components/global/Footer";

@Component({
  components: {
    Header,
    DiscoverSideBar,
    Messages,
    Footer,
  },
})
class BaseDefault extends Vue {
  firstTimeUser = true;

  created() {
    if (process.client) {
      const warehouse = this.$warehouse;
      this.showTerms = !warehouse.get(this.firstTimeWarehouseKey);
      console.log("warehouse? ", this.showTerms);
    }
  }

  get firstTimeWarehouseKey() {
    return "skope:firstTime";
  }

  setFirstTime(value) {
    this.firstTimeUser = value;
    if (value) {
      this.$warehouse.set(this.firstTimeWarehouseKey, true);
    } else {
      this.$warehouse.remove(this.firstTimeWarehouseKey);
    }
  }

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }
}
export default BaseDefault;
</script>
