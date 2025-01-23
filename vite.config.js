import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    glsl(), // This adds GLSL support
  ],
  assetsInclude: ['**/*.glsl'], // Include GLSL files as assets
});
