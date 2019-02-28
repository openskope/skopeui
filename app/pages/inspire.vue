<template>
  <v-layout>
    <v-flex text-xs-center>
      <div style="height: 600px">
        <no-ssr>
          <l-map
            :zoom="4"
            :min-zoom="4"
            :center="[38.63,-90.23]"
          >
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" :draggable="false" />
          </l-map>
        </no-ssr>
      </div>
    </v-flex>
  </v-layout>
</template>
