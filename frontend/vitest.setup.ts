import '@testing-library/jest-dom'
import { crypto } from 'node:crypto'

// Polyfill crypto for stellar-sdk in node/jsdom environment
if (!globalThis.crypto) {
  // @ts-expect-error - jsdom needs a crypto polyfill for stellar-sdk
  globalThis.crypto = crypto
}
