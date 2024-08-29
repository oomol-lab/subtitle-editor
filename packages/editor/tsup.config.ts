import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist/lib",
  dts: {
    only: true,
  },
  minify: false,
  splitting: false,
});