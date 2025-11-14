// Browser polyfills for Node.js modules
import { Buffer } from 'buffer'
import process from 'process'

// Make Buffer and process globally available
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.process = process
  window.global = window
}

export {}
