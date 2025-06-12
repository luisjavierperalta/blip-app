import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['mapbox-gl'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    alias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
}); 