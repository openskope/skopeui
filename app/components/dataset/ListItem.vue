<template>
  <v-row align-content-start justify-space-around>
    <v-col xs4>
      <client-only>
        <nuxt-link :to="absoluteUrl">
          <l-map
            :min-zoom="2"
            :zoom="region.zoom"
            :center="region.center"
            class="list-item-map"
          >
            <l-control-scale />
            <l-tile-layer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
            <l-rectangle :bounds="region.extents" :l-style="region.style" />
          </l-map>
        </nuxt-link>
      </client-only>
    </v-col>
    <v-col xs8>
      <v-card elevation="0">
        <v-card-title class="ma-0 pa-0">
          <div class="text-h6">
            <nuxt-link :to="absoluteUrl" class="dataset-title">
              {{ title }}
            </nuxt-link>
            <MetadataModal :metadata-id="id" />
          </div>
          <div class="text-subtitle-2 pa-0 ma-0">
            {{ spatialCoverage }} | {{ temporalCoverage }}
          </div>
        </v-card-title>
        <v-card-text class="mt-3 pa-0">
          <span v-html="$md.render(description)"></span>
        </v-card-text>
        <VariableList :variables="variables" />
        <v-card-text class="ma-0 pa-0">
          <b class="text-subtitle-1">Source:</b>
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
import VariableList from "@/components/dataset/VariableList.vue";

@Component({
  components: { MetadataModal, VariableList },
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

.list-item-map {
  position: relative;
  z-index: 1;
  cursor: pointer;
}
</style>
