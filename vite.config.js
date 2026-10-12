import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function inlineStandaloneAssets() {
  return {
    name: 'inline-standalone-assets',
    async writeBundle(outputOptions) {
      const outputDir = resolve(outputOptions.dir || 'dist');
      const htmlPath = resolve(outputDir, 'index.html');
      let source = await readFile(htmlPath, 'utf8');
      const assetName = (url) => decodeURIComponent(url.split(/[?#]/, 1)[0]).replace(/^\.?\//, '');

      const scriptTags = [...source.matchAll(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)];
      for (const [tag, url] of scriptTags) {
        const filePath = resolve(outputDir, assetName(url));
        const code = await readFile(filePath, 'utf8');
        source = source.replace(tag, `<script type="module">${code}</script>`);
        await unlink(filePath);
      }

      const stylesheetLinks = [...source.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g)];
      for (const [tag, url] of stylesheetLinks) {
        const filePath = resolve(outputDir, assetName(url));
        const css = await readFile(filePath, 'utf8');
        source = source.replace(tag, `<style>${css}</style>`);
        await unlink(filePath);
      }

      source = source.replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/g, '');
      await writeFile(htmlPath, source);
    },
  };
}

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [react(), inlineStandaloneAssets()],
});
