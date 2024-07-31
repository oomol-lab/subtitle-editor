import { join } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({}) => ({
  root: join(__dirname, "src"),
  server: {
    port: 8080,
  },
}));
