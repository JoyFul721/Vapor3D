import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8000,
    cors: true
  },
  build: {
    minify: true,

    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Vapor3D',
      fileName: 'vapor3d',
      formats: ['iife']
    },
    outDir: 'dist',

    sourcemap: true
  }
});