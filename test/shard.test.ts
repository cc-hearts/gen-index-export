import { describe, it, expect, vi } from 'vitest'
import {
  replacePathIndex,
  replaceSuffix,
  capitalize,
  getOutputAbsolutePath,
} from '../src/shard'

vi.mock('path', () => {
  return {
    resolve: (_: string, path: string) =>
      `/mock/${path.replace(/^\.\//, '')}`,
  }
})

describe('replacePathIndex func', () => {
  it('should is true when path is container /index end path', () => {
    expect(replacePathIndex('./b/index')).toEqual('./b')
    expect(replacePathIndex('./index')).toEqual('.')
  })

  it('should is true when path is container /index.js end path', () => {
    expect(replacePathIndex('./index.js')).toEqual('./index.js')
  })
})

describe('replaceSuffix func', () => {
  it('should equal `/index` when input a `/index.js` or `/index` as params', () => {
    expect(replaceSuffix('/index')).toEqual('/index')
    expect(replaceSuffix('/index.js')).toEqual('/index')
  })
})

describe('capitalize func', () => {
  it('should equal `Index` when input a `index` as params', () => {
    expect(capitalize('index')).toEqual('Index')
  })
})

describe('getOutputAbsolutePath func', () => {
  it('should return absolute path list when dirs.output path exist and is a array', () => {
    expect(getOutputAbsolutePath({ dirs: [{ path: '', output: './test' }] })).toEqual(['/mock/test'])
  })
})
