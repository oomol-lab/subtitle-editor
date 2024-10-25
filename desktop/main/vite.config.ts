import type { UserConfig } from "vite";
import * as fsP from "node:fs/promises";
import * as path from "node:path";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig(({ mode }) => {
    const isDEV = mode === "development";

    const define = {
        __DEV__: isDEV,
        // eslint-disable-next-line node/prefer-global/process
        RENDERER_URL: JSON.stringify(process.env.RENDERER_URL || "http://localhost:7083"),
    };

    const config: UserConfig = {
        build: {
            outDir: path.join(__dirname, "node_modules", ".main"),
            rollupOptions: {
                input: "index.html",
            },
        },
        plugins: [
            electron({
                main: {
                    entry: "src/index.ts",
                    vite: {
                        define,
                        build: {
                            outDir: "dist",
                            rollupOptions: {
                                output: {
                                    entryFileNames: "[name].mjs",
                                    chunkFileNames: "[name].mjs",
                                },
                            },
                        },
                    },
                },
                preload: {
                    input: "src/preload.ts",
                    vite: {
                        define,
                        build: {
                            outDir: "dist",
                        },
                    },
                },
            }),
        ],
    };

    if (!isDEV) {
        config.plugins!.push({
            name: "index.html",
            buildStart: async () => {
                await fsP.writeFile(path.join(__dirname, "index.html"), "", "utf-8");
            },
            buildEnd: async () => {
                await fsP.rm(path.join(__dirname, "index.html"));
            },
        });
    }

    return config;
});
