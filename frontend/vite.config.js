import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/data': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/data/, ''),
      },
    },
  },
});
