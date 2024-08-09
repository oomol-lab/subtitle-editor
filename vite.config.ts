import fs from "fs";
import path from "path";

import { join } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({}) => ({
  root: join(__dirname, "src"),
  server: {
    port: 8080,
  },
  // 将 ./data 文件夹映射到 http://localhost:xxx/data/ 中
  plugins: [{
    name: "read-data-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/data/")) {
          const filePath = path.resolve(__dirname, "." + req.url!);
          if (fs.existsSync(filePath)) {
            const fileStream = fs.createReadStream(filePath);
            res.writeHead(200, { "Content-Type": "application/octet-stream" });
            fileStream.pipe(res);
          } else {
            res.statusCode = 404;
            res.end('Not Found');
          }
        } else {
          next();
        }
      });
    },
  }],
}));
