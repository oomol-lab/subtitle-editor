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
    build: {
      outDir: "lib/browser",
      sourcemap: true,
      emptyOutDir: true,
      minify: minify,
      rollupOptions: {
        input: "src/browser/index.tsx",
        output: {
          entryFileNames: "index.js"
        },
      },
    }
  };
});