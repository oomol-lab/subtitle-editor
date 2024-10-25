import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
    const isDEV = mode === "development";

    return {
        define: {
            __DEV__: isDEV,
        },
        css: {
            preprocessorOptions: {
                less: {
                    math: "always",
                },
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
