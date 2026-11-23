/// <reference types="vitest" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Inyecta en dist/sw.js la lista de archivos del build y una versión basada
 * en su contenido, para que el service worker precachee todo (también los
 * chunks que se cargan bajo demanda) y limpie las cachés de builds anteriores.
 */
function precacheManifest(): Plugin {
  let files: string[] = [];
  let outDir = "dist";
  return {
    name: "pokedex-precache",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    generateBundle(_, bundle) {
      files = Object.keys(bundle).filter((f) => !f.endsWith(".map"));
    },
    async closeBundle() {
      const swPath = resolve(outDir, "sw.js");
      const sw = await readFile(swPath, "utf8");
      const urls = ["/", ...files.map((f) => `/${f}`)];
      const version = createHash("sha1").update(urls.join("|")).digest("hex").slice(0, 10);
      await writeFile(
        swPath,
        sw.replace('"__VERSION__"', JSON.stringify(version)).replace("[] /* __PRECACHE__ */", JSON.stringify(urls)),
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), precacheManifest()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
