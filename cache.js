import assert from 'nanoassert'

const _cache = {}

function handler (path, fn, cache) {
  if (cache[path]) return cache[path]
  cache[path] = fn
  return cache[path]
}

export default function createCache (handler = handler) {
  assert(typeof handler === 'function', `cache handler should be a function`)

  return {
    load (path, fn) {
      return handler(path, fn, _cache)
    }
  }
}
