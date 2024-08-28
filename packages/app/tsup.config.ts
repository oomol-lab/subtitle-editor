import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/main/index.ts"],
  format: ["esm"],
  outDir: "lib/main",
  sourcemap: true,
  minify: false,
  splitting: true,
});