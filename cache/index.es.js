import assert from 'nanoassert';

var _cache = {};
function mechanism(path, fn, cache) {
    if (cache[path]) 
        { return cache[path]; }
    cache[path] = fn;
    return cache[path];
}

function createCache(handler) {
    if ( handler === void 0 ) handler = mechanism;

    assert(typeof handler === 'function', "cache handler should be a function");
    return {
        load: function load(path, fn) {
            return handler(path, fn, _cache);
        }
    };
}

export default createCache;
//# sourceMappingURL=index.es.js.map
