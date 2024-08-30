import vite from "vite";

export default vite.defineConfig(({ mode }) => {
  let minify = true;
  if (mode !== "production") {
    minify = false;
  }
  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    css: {
      preprocessorOptions: {
        less: {
          math: "always",
        },
      },
    },
    build: {
      outDir: "lib/browser",
      target: "chrome58",
      sourcemap: true,
      emptyOutDir: true,
      minify: minify,
      rollupOptions: {
        format: "iife",
        input: "src/browser/index.tsx",
        output: {
          entryFileNames: "index.js",
          assetFileNames: "[name].[ext]",
        },
      },
    }
  };
});