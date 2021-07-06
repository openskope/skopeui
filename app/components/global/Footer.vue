<template>
  <!-- footer -->
  <v-footer
    app
    color="secondary"
    class="align-baseline subtitle-1"
    style="color: white"
  >
    This material is based upon work supported by the National Science
    Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
    University, SMA 1439603 and 1637155 to the University of Illinois at
    Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
    University. &copy; 2016 - {{ new Date().getFullYear() }}
    <v-spacer></v-spacer>
    <TermsOfUse />
    <v-btn
      v-for="link in links"
      v-bind="attrs"
      :key="link.id"
      plain
      style="font-weight: bold"
      color="white"
      class="subtitle-1"
      target="_blank"
      :href="link.url"
      v-on="on"
    >
      {{ link.label }}
    </v-btn>
  </v-footer>
  <!-- end footer -->
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import TermsOfUse from "@/components/global/TermsOfUse.vue";

@Component({
  components: {
    TermsOfUse,
  },
})
class Footer extends Vue {
  links = [
    {
      id: "docs",
      label: "Docs",
      icon: "fas fa-question-circle",
      url: "https://www.openskope.org/skope-users-guide ",
    },
    {
      id: "github",
      label: "GitHub",
      icon: "fab fa-github",
      url: "https://github.com/openskope/skopeui",
    },
    {
      id: "contact",
      label: "Contact",
      icon: "email",
      url: "https://www.comses.net/about/contact/",
    },
  ];
}
export default Footer;
</script>
