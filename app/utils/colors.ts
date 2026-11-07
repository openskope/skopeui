// Every color SKOPE UI uses, in one place. The page reads them through the
// Vuetify theme (`color="accent"`, `rgb(var(--v-theme-accent))`); the maps and
// the plot, which draw outside Vuetify, import them from here.

/** The palette: navy and maroon are the logo's. */
export const PALETTE = {
  navy: "#001E6B",
  maroon: "#800000",
  coral: "#EE6C4D",
  lightTeal: "#6DB1BF",
};

/** The Vuetify theme. */
export const THEME_COLORS = {
  primary: PALETTE.navy,
  secondary: PALETTE.lightTeal,
  accent: PALETTE.coral,
  brand: PALETTE.maroon,
  tint: PALETTE.lightTeal,
  footer: PALETTE.lightTeal,
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
  studyArea: PALETTE.coral,
  studyAreaHalo: "#FFFFFF",
  /** The outline of a shape still being drawn, apart from a finished one. */
  drawing: PALETTE.lightTeal,
};

/** How much the study area's fill covers the map: while drawing it, and over
 *  a data layer, where more would tint the data's colors. */
export const MAP_OPACITIES = {
  studyAreaDrawing: 0.2,
  studyAreaOverData: 0.1,
};

export const PLOT_COLORS = {
  /** The first series: Original or Transformed. */
  main: PALETTE.navy,
  /** What the plot marks: the Smoothed series and the selected year. */
  plotAccent: PALETTE.coral,
};
