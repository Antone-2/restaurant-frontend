import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // Base path for production deployment
  // For Vercel: '/' (default)
  // For GitHub Pages: '/repo-name/'
  // For Render: '/'
  base: mode === 'production' ? '/' : '/',
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build optimization
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React and its ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI Components (shadcn/ui)
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-popover',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
          ],
          // Charts
          'charts': ['recharts'],
          // Icons
          'icons': ['lucide-react'],
        },
      },
    },
    // Minify with esbuild
    minify: 'esbuild',
    // Generate source maps for production debugging
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));
