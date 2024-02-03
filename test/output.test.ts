import { describe, it, expect } from "vitest";
import { formatOutput } from "../src/output";



describe('output func', () => {
  it('should return true when input a file has default export', () => {
    expect(formatOutput([])).toBe('')
  })

  it('should return false when input a file has not default export', () => {
    expect(formatOutput([{ exportName: 'mockExport', exportPath: 'index.js', 'type': 'js' }])).toBe(`export * from './index.js'\n`)
    expect(formatOutput([{ exportName: 'mockExport', exportPath: 'index.vue', isDefaultExport: true, 'type': 'vue' }])).toBe(`export { default as MockExport } from './index.vue'\n`)
  })
})