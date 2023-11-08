import { vi, describe, expect, it } from "vitest";
import parseDefault from '../src/parse-default'

const { readFileCtx } = vi.hoisted(() => {
  return {
    readFileCtx: { current: '' }
  }
})

vi.mock('fs', () => {
  return {
    readFileSync: () => readFileCtx.current
  }
})


describe('parse-default func', () => {
  it('should return true when input a file has default export', () => {
    readFileCtx.current = `export default {}`
    expect(parseDefault('')).toBe(true)
  })

  it('should return false when input a file has not default export', () => {
    readFileCtx.current = `export {}`
    expect(parseDefault('')).toBe(false)
  })
})