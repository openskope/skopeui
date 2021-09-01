<template>
  <!-- footer -->
  <v-footer
    app
    absolute
    color="secondary"
    class="align-baseline"
    style="color: white"
  >
    <v-card tile flat width="100%" color="secondary" class="text-center">
      <v-card-text style="color: white" class="subtitle-2">
        This material is based upon work supported by the National Science
        Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
        University, SMA 1439603 and 1637155 to the University of Illinois at
        Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
        University.
      </v-card-text>
      <v-divider></v-divider>
      <span class="subtitle-1 font-weight-bold" style="color: white">
        &copy; 2016 -{{ new Date().getFullYear() }} Synthesizing Knowledge of
        Past Environments (SKOPE)
      </span>
      <TermsOfUse />
      <v-btn
        v-for="link in links"
        :key="link.id"
        plain
        style="font-weight: bold"
        color="white"
        class="subtitle-1"
        target="_blank"
        :href="link.url"
      >
        <v-icon left light>{{ link.icon }}</v-icon>
        {{ link.label }}
      </v-btn>
      <v-btn
        color="white"
        class="subtitle-1"
        plain
        target="_blank"
        :href="github.url"
      >
        <v-icon left light>{{ github.icon }}</v-icon>
        Build: {{ buildId }}
      </v-btn>
    </v-card>
  </v-footer>
  <!-- end footer -->
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { BUILD_ID } from "@/store/modules/_constants";
import TermsOfUse from "@/components/TermsOfUse.vue";

@Component({
  components: {
    TermsOfUse,
  },
})
class Footer extends Vue {
  buildId = BUILD_ID;
  github = {
    id: "github",
    label: "GitHub",
    icon: "fab fa-github",
    url: "https://github.com/openskope/skopeui/",
  };

  links = [
    {
      id: "docs",
      label: "User Guide",
      icon: "fas fa-question-circle",
      url: "https://www.openskope.org/skope-users-guide/",
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
