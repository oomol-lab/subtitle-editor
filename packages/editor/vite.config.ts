import * as vite from "vite";

const packageJSON = require("./package.json");
const external = new Set([
  ...Object.keys(packageJSON.peerDependencies),
  ...Object.keys(packageJSON.dependencies),
]);

export default vite.defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  build: {
    outDir: "lib",
    sourcemap: true,
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...external],
      output: {
        entryFileNames: "index.js",
      },
    },
  },
});