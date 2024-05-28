import { genModulesAbsolutePath, parseRelativePath } from '../src/path'
import { vi, describe, it, expect } from 'vitest'

vi.mock('path', () => {
  return {
    resolve: (_: string, path: string) => `/mock/${path.replace(/^\.\//, '')}`,
    isAbsolute: (path: string) => path.startsWith('/'),
    relative: (_: string, path: string) => path.replace(/^\//, ''),
  }
})

describe('genModulesAbsolutePath func', () => {
  it('should return absolute path list when dirs.path exist and is a relative path', () => {
    expect(genModulesAbsolutePath({ dirs: [{ path: './test' }] })).toEqual([
      '/mock/test',
    ])
  })

  it('should return absolute path list when dirs.path exist and is a absolute path', () => {
    expect(genModulesAbsolutePath({ dirs: [{ path: '/test' }] })).toEqual([
      '/test',
    ])
  })
})

describe('parseRelativePath func', () => {
  it('should return relative path when input a absolute path', () => {
    expect(parseRelativePath('/test')).toEqual('test')
  })
})
