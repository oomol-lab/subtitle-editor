let minify = true;
let env = process.env.NODE_ENV;

if (!env) {
  env = "development";
}
if (env !== "production") {
  minify = false;
}

export default {
  main: {
    build: {
      outDir: "lib/main",
      sourcemap: true,
      emptyOutDir: true,
      minify,
      rollupOptions: {
        input: "src/main/index.ts",
        output: {
          format: "es",
        },
      },
    }
  },
  preload: {
    build: {
      outDir: "lib/preload",
      sourcemap: true,
      emptyOutDir: true,
      minify,
      rollupOptions: {
        input: "src/preload/index.ts",
        output: {
          format: "cjs",
        },
      },
    }
  },
  renderer: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(env),
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
      minify,
      rollupOptions: {
        format: "iife",
        input: "src/browser/index.tsx",
        output: {
          entryFileNames: "index.js",
          assetFileNames: "[name].[ext]",
        },
      },
    }
  }
}