<template>
  <!-- footer -->
  <v-footer app absolute padless>
    <v-card color="secondary" class="flex p-2">
      <v-card-text class="text-center subtitle-1">
        This material is based upon work supported by the National Science
        Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
        University, SMA 1439603 and 1637155 to the University of Illinois at
        Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
        University. &copy; 2016 - {{ new Date().getFullYear() }}
        <v-divider vertical class="mx-3"></v-divider>
        <TermsOfUse />
      </v-card-text>
    </v-card>
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
class Footer extends Vue {}
export default Footer;
</script>
