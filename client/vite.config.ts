import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "serve-presentations",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url?.split("?")[0] ?? "";
          if (!rawUrl.startsWith("/presentations/")) return next();
          const decoded = decodeURIComponent(rawUrl);
          // Reject any path segment that is ".." to block traversal
          if (decoded.split("/").some((seg) => seg === "..")) return next();
          const presentationsRoot = path.resolve(__dirname, "public", "presentations");
          let resolved = path.resolve(presentationsRoot, "." + decoded.slice("/presentations".length));
          // Ensure resolved path stays inside public/presentations/
          if (!resolved.startsWith(presentationsRoot + path.sep) && resolved !== presentationsRoot) return next();
          if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
            resolved = path.join(resolved, "index.html");
          }
          if (fs.existsSync(resolved)) {
            const ext = path.extname(resolved);
            const mime: Record<string, string> = {
              ".html": "text/html", ".css": "text/css",
              ".js": "text/javascript", ".png": "image/png",
              ".jpg": "image/jpeg", ".svg": "image/svg+xml",
            };
            res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
            res.end(fs.readFileSync(resolved));
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5180,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
