import * as Leaflet from "leaflet";
import {
  LMap,
  LTileLayer,
  LRectangle,
  LControlLayers,
  LControlScale,
} from "@vue-leaflet/vue-leaflet";

export default defineNuxtPlugin(async (nuxtApp) => {
  // Leaflet Draw expects a global L reference when loaded, and adds to it
  // (L.Draw, L.drawLocal, L.drawVersion). A production build's module
  // namespace is not extensible, so give it a plain copy.
  const L = { ...Leaflet };
  (globalThis as any).L = L;
  await import("leaflet-draw");

  nuxtApp.vueApp.component("LMap", LMap);
  nuxtApp.vueApp.component("LTileLayer", LTileLayer);
  nuxtApp.vueApp.component("LRectangle", LRectangle);
  nuxtApp.vueApp.component("LControlLayers", LControlLayers);
  nuxtApp.vueApp.component("LControlScale", LControlScale);

  // Preserve legacy `$L` access pattern during migration.
  return {
    provide: {
      L,
    },
  };
});
