import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDEV = mode === "development";

  return {
    define: {
      __DEV__: isDEV,
    },
    css: {
      modules: { generateScopedName: createGenerateScopedName() },
    },
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 7083,
      fs: {
        allow: [
          "/",
        ],
      },
    },
    base: "./",
    build: {
      outDir: "dist",
      target: "es2023",
      sourcemap: true,
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        input: "index.html",
        output: {
          entryFileNames: "index.js",
          assetFileNames: "[name].[ext]",
          // ref: https://github.com/vitejs/vite/discussions/9440#discussioncomment-8358001
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              const basic = id.toString().split("node_modules/")[1];
              const sub1 = basic.split("/")[0];
              if (sub1 !== ".pnpm") {
                return sub1.toString();
              }
              const name2 = basic.split("/")[1];
              return name2.split("@")[name2[0] === "@" ? 1 : 0].toString();
            }
          },
        },
      },
    },
  };
});

export function createGenerateScopedName() {
  /**
   * Cached CSS file hash
   */
  const cachedCSSHash = new Map<string, string>();

  function getCSSHash(fileName: string, css: string): string {
    let hash = cachedCSSHash.get(fileName);
    if (!hash) {
      hash = crypto.createHash("md5").update(css).digest("hex").slice(0, 5);
      cachedCSSHash.set(fileName, hash);
    }
    return hash;
  }

  return function generateScopedName(
    className: string,
    fileName: string,
    css: string,
  ): string {
    const moduleName = path.basename(fileName).split(".")[0];
    const hash = getCSSHash(fileName, css);
    return `${moduleName}_${className}_${hash}`;
  };
}
