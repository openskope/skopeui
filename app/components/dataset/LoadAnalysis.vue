<template>
  <!-- load analysis button / component -->
  <v-btn
    color="primary"
    tile
    rounded
    class="mt-1"
    @click="selectLoadRequestDataFile"
  >
    <input
      id="loadRequestDataFile"
      type="file"
      accept=".json"
      style="display: none"
      @change="loadRequestData"
    />
    <v-icon left dark>fas fa-upload</v-icon>
    Load skope-request.json file
  </v-btn>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";

@Component({})
class LoadAnalysis extends Vue {
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
        this.$router.push(
          {
            name: "dataset-id-analyze-variable",
            params: {
              id: requestData.dataset_id,
              variable: requestData.variable_id,
            },
          },
          function () {
            console.log("router push completed", requestData);
          }
        );
      } catch (error) {
        console.error(error);
        alert("Unable to import the request file.");
      }
    });
  }
}

export default LoadAnalysis;
</script>

<style scoped></style>
