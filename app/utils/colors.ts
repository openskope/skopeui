// Every color SKOPE UI uses, in one place. The page reads them through the
// Vuetify theme (`color="accent"`, `rgb(var(--v-theme-accent))`); the maps and
// the plot, which draw outside Vuetify, import them from here.

/** The palette: navy and maroon are the logo's. */
export const PALETTE = {
  navy: "#193479",
  maroon: "#800000",
  terracotta: "#A85A43",
  teal: "#00546B",
  mutedTeal: "#527E7E",
  lightTeal: "#6DB1BF",
  mustard: "#B8860B",
};

/** The Vuetify theme. White text passes 4.5:1 on primary, secondary, accent,
 *  brand and footer (4.52:1, just); tint is too light for it (2.4:1). */
export const THEME_COLORS = {
  primary: PALETTE.navy,
  secondary: PALETTE.teal,
  accent: PALETTE.terracotta,
  brand: PALETTE.maroon,
  tint: PALETTE.lightTeal,
  footer: PALETTE.mutedTeal,
  /** Secondary text; panel backs the area readout. */
  muted: "#596D7B",
  panel: "#E4E7EF",
  success: "#008148",
  error: "#CC0000",
  info: "#E0FBFC",
  warning: "#FAB716",
};

export const MAP_COLORS = {
  /** Where a dataset has data. */
  datasetExtent: PALETTE.navy,
  /** The user's study area, drawn with a white halo so it shows over any
   *  data layer. */
  studyArea: PALETTE.teal,
  studyAreaHalo: "#FFFFFF",
  /** The outline of a shape still being drawn, apart from a finished one. */
  drawing: PALETTE.mustard,
};

/** How much the study area's fill covers the map: while drawing it, and over
 *  a data layer, where more would tint the data's colors. */
export const MAP_OPACITIES = {
  studyAreaDrawing: 0.2,
  studyAreaOverData: 0.1,
};

export const PLOT_COLORS = {
  /** The first series: Original or Transformed. */
  main: PALETTE.teal,
  /** What the plot marks: the Smoothed series and the selected year. 3.25:1
   *  on white, and apart from main for every kind of color blindness. */
  plotAccent: PALETTE.mustard,
};
