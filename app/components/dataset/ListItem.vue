<template>
  <v-row align-content-start justify-space-around>
    <v-col xs4>
      <client-only>
        <l-map
          :min-zoom="2"
          :zoom="region.zoom"
          :center="region.center"
          style="position: relative; z-index: 1"
        >
          <l-control-scale />
          <l-tile-layer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <l-rectangle :bounds="region.extents" :l-style="region.style" />
        </l-map>
      </client-only>
    </v-col>
    <v-col xs8>
      <v-card elevation="0">
        <v-card-title class="ma-0 pb-0">
          <h2 class="headline">
            <nuxt-link :to="absoluteUrl" class="dataset-title">
              {{ title }}
            </nuxt-link>
            <MetadataModal :metadata-id="id" />
          </h2>
        </v-card-title>
        <v-subheader class="ma-0">
          {{ spatialCoverage }} | {{ temporalCoverage }}
        </v-subheader>
        <v-card-text class="ma-0">
          <span v-html="$md.render(description)"></span>
        </v-card-text>
        <v-subheader class="ma-0"><h3>Variables</h3></v-subheader>
        <!-- FIXME: extract this to a component and reuse across the detail page -->
        <v-list dense class="ma-0 pa-0">
          <v-list-item v-for="(variable, index) in variables" :key="index">
            <v-list-item-content>
              <v-list-item-title>
                <v-chip small label color="info" text-color="black">
                  {{ variable.class }}
                </v-chip>
                {{ variable.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-text class="citation font-weight-bold">
          Source:
          <a target="_blank" :href="sourceUrl">
            {{ sourceUrl }}
          </a>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { Prop } from "vue-property-decorator";
import { BaseMapProvider } from "@/store/modules/constants";
import MetadataModal from "@/components/dataset/MetadataModal.vue";

@Component({
  components: { MetadataModal },
})
class ListItem extends Vue {
  @Prop()
  title; //: String

  @Prop()
  status; //: String

  @Prop()
  revised; //: String

  @Prop()
  region; //: Object

  @Prop()
  timespan; //: Object

  @Prop()
  description; //: String

  @Prop()
  id; //: String

  @Prop()
  sourceUrl; //: String

  @Prop()
  variables;

  // --------- GETTERS ---------

  get defaultBaseMap() {
    return BaseMapProvider.default;
  }
  get spatialCoverage() {
    return `${this.region.name} at ${this.region.resolution}`;
  }
  get temporalCoverage() {
    const period = this.timespan.period;
    const timespan =
      period.gte === period.lte ? period.gte : `${period.gte}-${period.lte}`;
    return `${timespan}${period.suffix} ${this.timespan.resolutionLabel}`;
  }
  get absoluteUrl() {
    return `/dataset/${this.id}`;
  }
  get defaultCrs() {
    if (this.$L) {
      return this.$L.CRS.EPSG4326;
    }
    return "";
  }
}
export default ListItem;
</script>
<style scoped>
.dataset-title {
  text-decoration: none;
  box-shadow: inset 0 -2px 0 #ee6c4d, 0 2px 0 #ee6c4d;
  transition: box-shadow 0.3s;
  color: inherit;
  overflow: hidden;
}

.dataset-title:hover {
  box-shadow: inset 0 -30px 0 #ee6c4d, 0 2px 0 #ee6c4d;
  color: white;
}
</style>
