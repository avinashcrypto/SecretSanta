import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Custom plugin to serve WASM files with correct MIME type
function wasmContentTypePlugin(): Plugin {
  return {
    name: 'wasm-content-type-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      wasmContentTypePlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/fhevmjs/bundle/*.wasm',
            dest: 'fhevmjs'
          }
        ]
      })
    ],
    define: {
      // Make env variables available
      'import.meta.env.VITE_CONTRACT_ADDRESS': JSON.stringify(env.VITE_CONTRACT_ADDRESS),
      'import.meta.env.VITE_CHAIN_ID': JSON.stringify(env.VITE_CHAIN_ID),
      'import.meta.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID),
      // Polyfill process.env for browser
      'process.env': JSON.stringify({}),
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['fhevmjs', 'buffer', 'process'],
      esbuildOptions: {
        target: 'esnext',
        define: {
          global: 'globalThis',
        },
      },
    },
    resolve: {
      alias: {
        // Fix for Node.js modules browser compatibility
        util: 'util/',
        stream: 'stream-browserify',
        buffer: 'buffer/',
        process: 'process/browser',
      },
    },
    build: {
      target: 'esnext',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        plugins: [
          {
            name: 'node-globals',
            resolveId(id) {
              if (id === 'process' || id === 'buffer') {
                return id
              }
            },
          },
        ],
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      fs: {
        // Allow serving files from node_modules
        allow: ['..'],
      },
    },
    // Ensure proper MIME types for WASM files
    assetsInclude: ['**/*.wasm'],
    worker: {
      format: 'es',
    },
  }
})
