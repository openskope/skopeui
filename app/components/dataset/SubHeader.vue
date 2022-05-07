<template>
  <v-row dense align="start" justify="space-between">
    <v-col md="6" sm="9" cols="12">
      <span class="text-h6">
        {{ metadata.title }}
      </span>
      <MetadataModal :metadata-id="metadata.id" />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            icon
            depressed
            fab
            x-small
            href="https://www.openskope.org/skope-users-guide/"
            target="_blank"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>fas fa-question-circle</v-icon>
          </v-btn>
        </template>
        <span>View the SKOPE user guide (opens in a new tab)</span>
      </v-tooltip>
    </v-col>
    <v-col v-if="selectVariable">
      <v-select
        v-model="variable"
        label="Select a variable"
        item-color="secondary"
        color="secondary"
        dense
        :items="variables"
        item-text="name"
        item-value="id"
        outlined
      />
    </v-col>
    <v-col cols="3" class="ml-auto" align="end">
      <!-- slot for next nav button -->
      <slot />
    </v-col>
  </v-row>
</template>
<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";
import MetadataModal from "@/components/dataset/MetadataModal.vue";
import _ from "lodash";

@Component({
  components: { MetadataModal },
})
class SubHeader extends Vue {
  @Prop({ default: false })
  selectVariable;

  showInstructions = false;

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  set variable(variableId) {
    const id = this.$route.params.id;
    const name = this.$route.name;
    this.$api().dataset.setVariable(variableId);
    this.$router.push({
      name,
      params: {
        id,
        variable: variableId,
      },
    });
  }

  get variables() {
    return this.metadata.variables;
  }

  location(variable) {
    const id = this.$route.params.id;
    const name = this.$route.name;
    return {
      name,
      params: { id, variable },
    };
  }
}
export default SubHeader;
</script>
