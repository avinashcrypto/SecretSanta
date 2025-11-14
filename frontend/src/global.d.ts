// Global type declarations for browser polyfills
import { Buffer } from 'buffer'

declare global {
  interface Window {
    Buffer: typeof Buffer
    process: NodeJS.Process
    global: typeof globalThis
  }

  // Make these available globally
  const Buffer: typeof import('buffer').Buffer
  const process: NodeJS.Process
  const global: typeof globalThis
}

export {}
