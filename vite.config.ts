import fs from "fs";
import path from "path";

import { join } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ }) => ({
  root: join(__dirname, "src"),
  server: {
    port: 8080,
  },
  plugins: [{
    name: "read-data-files",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/data/")) {
          const filePath = path.resolve(__dirname, "." + req.url!);
          if (fs.existsSync(filePath)) {
            const fileStats = fs.statSync(filePath);
            const range = req.headers.range;
            const fileSize = fileStats.size;

            let start = 0;
            let end = fileSize - 1;

            if (range) {
              const parts = range.replace(/bytes=/, "").split("-");
              start = parseInt(parts[0], 10);
              end = parts[1] ? parseInt(parts[1], 10) : end;
            }

            const chunkSize = end - start + 1;
            res.writeHead(206, {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunkSize,
              "Content-Type": "application/octet-stream",
            });

            const fileStream = fs.createReadStream(filePath, { start, end });
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
