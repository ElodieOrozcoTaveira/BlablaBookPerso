import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Étendre expect avec jest-dom matchers
expect.extend(matchers)

// Nettoyer après chaque test
afterEach(() => {
  cleanup()
})