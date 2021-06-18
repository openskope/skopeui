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
              @click="selectLoadRequestDataFile"
              v-on="on"
            >
              <input
                id="loadRequestDataFile"
                type="file"
                accept=".json"
                style="display: none"
                @change="loadRequestData"
              />
              <v-icon large color="white">fas fa-file-upload</v-icon>
            </v-btn>
          </template>
          <span>Load Analysis</span>
        </v-tooltip>
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
              large
              icon
              v-bind="attrs"
              class="mt-3 mx-3 button"
              target="_blank"
              :href="links[2].url"
              v-on="on"
            >
              <v-icon large color="white">{{ links[2].icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ links[2].label }}</span>
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
import { Component, Watch } from "nuxt-property-decorator";

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
    {
      id: "docs",
      label: "Documentation",
      icon: "fas fa-question-circle",
      url: "https://www.openskope.org/skope-users-guide ",
    },
  ];

  /**
   *  Determine if current breakpoint is <= medium.
   */
  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }

  /**
   * Returns the id loadRequestFile to trigger a select file
   * window on click.
   */
  selectLoadRequestDataFile() {
    document.getElementById("loadRequestDataFile").click();
  }

  /**
   * When a click event is triggered, open a window for the user
   * to select a file
   * @param event A click event
   */
  loadRequestData(event) {
    const file = event.target.files[0];
    file.text().then((text) => {
      console.log("received request data: ", text);
      try {
        const requestData = JSON.parse(text);
        this.$api().analysis.setRequestData(requestData);
        if (this.$route.name === "dataset-id-analyze-variable") {
          console.log("in analyze");
          // this.$router.push({
          //   name: "dataset-id-visualize-variable",
          //   params: {
          //     id: requestData.dataset_id,
          //     variable: requestData.variable_id,
          //   },
          // });
        }
        this.$router.push({
          name: "dataset-id-analyze-variable",
          params: {
            id: requestData.dataset_id,
            variable: requestData.variable_id,
          },
        });
      } catch (error) {
        console.error(error);
        alert(
          "This should not be an alert but something bad happened when we tried to import this file."
        );
      }
    });
  }
}

export default Links;
</script>

<style scoped></style>
