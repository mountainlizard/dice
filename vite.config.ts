import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "unplugin-dts/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ include: "lib", insertTypesEntry: true }),
  ],
  build: {
    // do not copy the contents of the public folder to the dist folder
    copyPublicDir: false,
    lib: {
      // this is the file that exports our components
      entry: resolve(import.meta.dirname, "lib/index.ts"),
      name: "dice",
      fileName: "dice",
      formats: ["es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "react",
        "react-dom",
        "@dimforge/rapier3d-compat",
        "@pmndrs/assets",
        "@react-three/drei",
        "@react-three/fiber",
        "three",
      ],
    },
  },
});
