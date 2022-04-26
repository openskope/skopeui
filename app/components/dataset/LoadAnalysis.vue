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
      @change="handleLoadRequestDataFile"
    />
    <v-icon left dark>fas fa-upload</v-icon>
    Load skope-request.json file (experimental)
  </v-btn>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { initializeDataset, loadRequestData } from "@/store/actions";

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
  handleLoadRequestDataFile(event) {
    const file = event.target.files[0];
    file.text().then((text) => {
      try {
        const requestData = JSON.parse(text);
        console.log(
          "going to ",
          requestData.dataset_id,
          "/",
          requestData.variable_id
        );
        const api = this.$api();
        const warehouse = this.$warehouse;
        this.$router.push(
          {
            name: "dataset-id-analyze-variable",
            params: {
              id: requestData.dataset_id,
              variable: requestData.variable_id,
            },
          },
          async function () {
            console.log("router push completed", requestData);
            await initializeDataset(
              warehouse,
              api,
              requestData.dataset_id,
              requestData.variable_id
            );
            await loadRequestData(api, requestData);
          },
          async function () {
            console.log("router push aborted", requestData);
            await initializeDataset(
              warehouse,
              api,
              requestData.dataset_id,
              requestData.variable_id
            );
            await loadRequestData(api, requestData);
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
