import path from "path";
import { VitePWA } from 'vite-plugin-pwa'; 
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/ai-powered-task-manager/",
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "robots.txt",
          "favicon.png",
          "apple-touch-icon.webp",
          "pwa-192x192.webp",
          "pwa-512x512.webp",
        ],
        manifest: {
          name: "ai-powered-task-manager",
          short_name: "Launch",
          start_url: "/ai-powered-task-manager/",
          scope: "/ai-powered-task-manager/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/ai-powered-task-manager/pwa-192x192.webp",
              sizes: "192x192",
              type: "image/webp",
            },
            {
              src: "/ai-powered-task-manager/pwa-512x512.webp",
              sizes: "512x512",
              type: "image/webp",
            },
            {
              src: "/ai-powered-task-manager/pwa-512x512.webp",
              sizes: "512x512",
              type: "image/webp",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
  };
});
