import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { articleUpdates } from "./scripts/article-updates";

export default defineConfig({
  plugins: [
    articleUpdates(),
    tailwindcss(),
    react(),
    reactRouterRSC(),
    rsc(),
    cloudflare({ viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] } }),
    devtoolsJson(),
  ],
  resolve: { tsconfigPaths: true },
});
