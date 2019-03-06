<template>
  <v-layout>
    <v-flex text-xs-center>
      <div style="height: 600px">
        <no-ssr>
          <l-map
            :center="[38.63,-90.23]"
            :min-zoom="4"
            :zoom="4"
          >
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" :draggable="false" />
          </l-map>
        </no-ssr>
      </div>
    </v-flex>
  </v-layout>
</template>
