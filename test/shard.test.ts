import { describe, it, expect } from 'vitest'
import { replacePathIndex, replaceSuffix } from '../src/shard'

describe('replacePathIndex', () => {
  it('should is true when path is container /index end path', () => {
    expect(replacePathIndex('./b/index')).toEqual('./b')
    expect(replacePathIndex('./index')).toEqual('.')
  })

  it('should is true when path is container /index.js end path', () => {
    expect(replacePathIndex('./index.js')).toEqual('./index.js')
  })
})

describe('replaceSuffix', () => {
  it('should equal `/index` when input a `/index.js` or `/index` as params', () => {
    expect(replaceSuffix('/index')).toEqual('/index')
    expect(replaceSuffix('/index.js')).toEqual('/index')
  })
})
