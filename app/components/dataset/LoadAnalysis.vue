<template>
  <v-row>
    <v-col>
      <!-- load analysis -->
      <v-btn
        color="secondary"
        depressed
        class="mt-3 mx-3"
        @click="selectLoadRequestDataFile"
      >
        <input
          id="loadRequestDataFile"
          type="file"
          accept=".json"
          style="display: none"
          @change="loadRequestData"
        />
        <h2 class="title">Load Analysis</h2>
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";

@Component({})
class LoadAnalysis extends Vue {
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

export default LoadAnalysis;
</script>

<style scoped></style>
