import colors from "vuetify/es5/util/colors";
import Vue from "vue";
import Vuetify from "vuetify/lib";

export default {
  primary: "#001E6B",
  accent: "#EE6C4D",
  secondary: "#6DB1BF",
  success: "#008148",
  error: "#CC0000",
  info: "#E0FBFC",
  warning: "#FFD275",
  theme: {
    themes: {
      light: {
        primary: "#001E6B",
        accent: "#EE6C4D",
        secondary: "#039BE5",
        success: "#008148",
        error: "#CC0000",
        info: "#E0FBFC",
        warning: "#FAB716",
      },
      dark: {
        primary: "#3D5A80",
        accent: "#EE6C4D",
        secondary: "#6DB1BF",
        success: "#008148",
        error: "#CC0000",
        info: "#E0FBFC",
        warning: "#FAB716",
      },
    },
  },
  breakpoint: {
    thresholds: {
      md: 1616, // 1600px (window width) + 16px (desktop scrollbar width)
    },
  },
};
