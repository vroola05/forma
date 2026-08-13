import { defineConfig } from 'vite';
import { resolve } from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  root: '.',
  plugins: [
    {
      name: 'multi-tenant-router',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';

          if (url.includes('.') || url.includes('/api')) {
            return next();
          }

          if (/^\/[^\/]+\/admin(\/.*)?$/.test(url)) {
            req.url = '/admin/index.html';
            return next();
          }

          if (/^\/[^\/]+\/?$/.test(url)) {
            req.url = '/index.html';
            return next();
          }

          next();
        });
      },
    }
  ],
  build: {
    outDir: '../src/main/resources/static', 
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'admin' ? 'admin/assets/admin-[hash].js' : 'assets/main-[hash].js';
        },
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name.includes('admin') ? 'admin/assets/[name]-[hash].js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const isAdmin = assetInfo.name && (assetInfo.name.includes('admin') || assetInfo.names?.some(n => n.includes('admin')));
          return isAdmin ? 'admin/assets/admin-[hash].[ext]' : 'assets/main-[hash].[ext]';
        }
      }
    }
  },
  server: {
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300
    },
    
    proxy: {
      '^.*/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false

      }
    }
  }
});
