<template>
  <v-row>
    <v-col class="text-right">
      <v-menu v-if="isMdAndDown" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn
            plain
            color="white"
            large
            icon
            v-bind="attrs"
            class="mt-3 mx-3 button"
            v-on="on"
          >
            <v-icon large color="secondary">fas fa-ellipsis-v</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(link, index) in links"
            :key="index"
            link
            nuxt
            :href="link.url"
          >
            <v-icon>{{ link.icon }}</v-icon>
            <span class="mx-3">{{ link.label }}</span>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-else>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              plain
              color="white"
              large
              icon
              v-bind="attrs"
              class="mt-3 mx-3 button"
              target="_blank"
              :href="links[0].url"
              v-on="on"
            >
              <v-icon large color="white">{{ links[0].icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ links[0].label }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              plain
              color="white"
              icon
              large
              :href="links[1].url"
              target="_blank"
              v-bind="attrs"
              class="mt-3 mx-3 button"
              v-on="on"
            >
              <v-icon large color="white">{{ links[1].icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ links[1].label }}</span>
        </v-tooltip>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import _ from "lodash";

@Component()
class Links extends Vue {
  links = [
    {
      id: "github",
      label: "GitHub",
      icon: "fab fa-github",
      url: "https://github.com/openskope/skopeui",
    },
    {
      id: "email",
      label: "Email us",
      icon: "email",
      url: "https://www.comses.net/about/contact/",
    },
  ];

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }
}

export default Links;
</script>

<style scoped></style>
