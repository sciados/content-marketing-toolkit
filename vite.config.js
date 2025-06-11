import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

// Get __dirname equivalent for ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Check if we should include the analyzer
  const shouldAnalyze = mode === 'analyze'
  
  return {
    plugins: [
      react(),
      // Bundle analyzer - only when building with analyze mode
      shouldAnalyze && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap' // or 'sunburst', 'network'
      })
    ].filter(Boolean), // Remove falsy values
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    
    build: {
      // Target modern browsers for better optimization
      target: 'es2020',
      
      // Output directory for Vercel compatibility
      outDir: 'dist',
      
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Disable source maps in production for smaller bundles
      sourcemap: false,
      
      rollupOptions: {
        output: {
          // Manual chunking strategy to split large bundles
          manualChunks: (id) => {
            // Vendor chunks - separate large libraries
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              
              // React Router
              if (id.includes('react-router')) {
                return 'router-vendor'
              }
              
              // Supabase
              if (id.includes('supabase')) {
                return 'supabase-vendor'
              }
              
              // Claude AI or other AI libraries
              if (id.includes('claude') || id.includes('openai') || id.includes('anthropic')) {
                return 'ai-vendor'
              }
              
              // Utility libraries
              if (id.includes('lodash') || id.includes('date-fns') || id.includes('moment')) {
                return 'utils-vendor'
              }
              
              // UUID library
              if (id.includes('uuid')) {
                return 'utils-vendor'
              }
              
              // Axios
              if (id.includes('axios')) {
                return 'http-vendor'
              }
              
              // All other node_modules - keep smaller libraries together
              return 'vendor'
            }
            
            // App chunks by feature/directory
            if (id.includes('/src/')) {
              // Video2Promo components and services (NEW)
              if (id.includes('Video2Promo') || 
                  id.includes('video2promo') || 
                  id.includes('VideoUrlForm') ||
                  id.includes('TranscriptDisplay') ||
                  id.includes('AssetGenerator') ||
                  id.includes('GeneratedAssets')) {
                return 'video2promo'
              }
              
              // Email generator components and services
              if (id.includes('EmailGenerator') || 
                  id.includes('email-generator') || 
                  id.includes('emailGenerator') ||
                  id.includes('SalesPageEmailGenerator')) {
                return 'email-generator'
              }
              
              // Email series management
              if (id.includes('EmailSeries') || 
                  id.includes('email-series') ||
                  id.includes('SupabaseEmailDisplay')) {
                return 'email-series'
              }
              
              // Authentication pages
              if (id.includes('/Auth/') || id.includes('auth')) {
                return 'auth'
              }
              
              // Supabase services
              if (id.includes('/services/supabase')) {
                return 'supabase-services'
              }
              
              // AI services
              if (id.includes('/services/ai')) {
                return 'ai-services'
              }
              
              // Video2Promo services (NEW)
              if (id.includes('/services/video2promo')) {
                return 'video2promo-services'
              }
              
              // Email generation services
              if (id.includes('/services/emailGenerator')) {
                return 'email-services'
              }
              
              // Other services
              if (id.includes('/services/')) {
                return 'services'
              }
              
              // Custom hooks
              if (id.includes('/hooks/')) {
                return 'hooks'
              }
              
              // Common components
              if (id.includes('/components/ui')) {
                return 'common-components'
              }
              
              // Layout components
              if (id.includes('/components/Layout')) {
                return 'layout-components'
              }
            }
            
            // Default chunk for remaining code
            return 'main'
          },
          
          // Better file naming for caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Organize assets by type
            if (/\.(css)$/.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash][extname]'
            }
            
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            
            return 'assets/misc/[name]-[hash][extname]'
          }
        }
      },
      
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console statements in production
          drop_console: true,
          drop_debugger: true,
          
          // Additional optimizations
          dead_code: true,
          conditionals: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          loops: true,
          unused: true,
          
          // Remove pure function calls that aren't used
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
        },
        
        mangle: {
          // Mangle names for smaller bundle size
          keep_fnames: false,
          keep_classnames: false
        },
        
        format: {
          // Remove comments
          comments: false
        }
      }
    },
    
    // Development server configuration
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: true,
      // API proxy for development (optional)
      proxy: {
        '/api': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    
    // Preview server configuration (for SPA routing)
    preview: {
      port: 3000,
      strictPort: true,
      host: true,
      open: true,
      // Handle SPA routing in preview mode
      cors: true
    },
    
    // Dependency pre-bundling optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'axios',
        'uuid'
      ]
    },
    
    // Environment variables configuration
     define: {
       // Ensure environment variables are available
       'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
    },
    
    // Base path configuration (useful for subdirectory deployments)
    base: '/',
    
    // Public directory
    publicDir: 'public'
  }
})
