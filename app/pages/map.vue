<template>
  <v-layout>
    <v-flex text-xs-center>
      <div class="nav">
        <v-layout row wrap>
          <v-btn text icon class="arrow_back">
            <v-icon color="grey darken-2">
              arrow_back
            </v-icon>
          </v-btn>
          <v-stepper v-model="e1" alt-labels non-linear class="stepper">
            <v-stepper-header>
              <v-stepper-step complete editable step="1">
                Datasets
              </v-stepper-step>
              <v-divider />
              <v-stepper-step editable :complete="e1 > 2" step="2">
                Info
              </v-stepper-step>
              <v-divider />
              <v-stepper-step step="3" editable>
                Map
              </v-stepper-step>
            </v-stepper-header>
          </v-stepper>
        </v-layout>
      </div>
      <div style="height: 600px">
        <client-only>
          <l-map :center="[35, -105]" :min-zoom="4" :zoom="4">
            <l-tile-layer
              url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              :draggable="false"
            />
          </l-map>
        </client-only>
      </div>
    </v-flex>
  </v-layout>
</template>

<style>
.nav {
  padding-left: 400px;
  padding-bottom: 50px;
}
.arrow_back {
  padding-top: 40px;
}
.stepper {
  width: 75%;
}
</style>
