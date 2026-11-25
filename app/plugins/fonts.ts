import font0 from "~/assets/fonts/bitter/bitter-latin-normal-700.woff2?url";
import font1 from "~/assets/fonts/source-sans-3/source-sans-3-latin-normal-300-700.woff2?url";

// Preload the same Vite-fingerprinted URLs used by the font-face declarations.
export default defineNuxtPlugin(() => {
  useHead({
    link: [
      {
        key: "font-bitter-latin",
        rel: "preload",
        href: font0,
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      {
        key: "font-source-sans-3-latin",
        rel: "preload",
        href: font1,
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
    ],
  });
});
