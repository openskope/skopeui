import Vue from "vue";
import VueGtag from "vue-gtag";


Vue.use(VueGtag, {
  config: { id: "G-M0NVBT90BT" },
  enabled: process.env.NODE_ENV === 'production',
})
