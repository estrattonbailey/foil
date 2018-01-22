import assert from 'nanoassert'

function getParts (url) {
  const parts = url.split('/')
  return parts.slice(parts[0] !== '' ? 0 : 1)
}

function getRoute (path, routes) {
  const urls = getParts(path)
  const params = {}
  outer: for (let route of routes) {
    if (urls.length === route.parts.length) {
      inner: for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i][0] === ':') {
          params[route.parts[i].slice(1)] = urls[i]
          continue inner
        } else if (route.parts[i] === urls[i]) {
          continue inner
        } else if (route.parts[i] === '*') {
          break
        }
        continue outer
      }
      route.params = params
      return route
    } else if (route.parts[0] == '*') {
      route.params = params
      return route
    }
  }
}

function joinRoute (a, b) {
  return [a, b].join('/').replace('//', '/')
}

export function route (r) {
  assert(r.path && r.component, 'routes require both path and component properties')
  assert(typeof r.path === 'string', 'route.path should be a string')
  assert(typeof r.component === 'function', 'route.component should be a function')

  return function child (...rs) {
    r.routes = rs || []
    r.options = r.options || {}
    return r
  }
}

export function use (fn) {
  assert(typeof fn === 'function', 'middleware should be a function')

  return function middleware (props, ctx) {
    return fn(props, ctx)
  }
}

export function router (...defs) {
  const routes = []; // need semi

  (function walk (rs, parent, middleware) {
    while (rs.length) {
      const def = rs.shift()

      if (def.name === 'middleware') {
        middleware.push(def)
        continue
      }

      const route = typeof def === 'function' ? def() : def
      route.middleware = middleware
      route.path = joinRoute(parent.path, route.path)
      route.parts = getParts(route.path)
      if (parent.load) {
        const load = route.load
        route.load = (props, ctx) => {
          return Promise.resolve(parent.load(props, ctx)).then(props => load ? load(props, ctx) : props)
        }
      }

      routes.push(route)

      walk(route.routes, route, middleware.slice(0, middleware.length)) // clone array
    }
  })(defs, { path: '' }, [])

  return {
    resolve (location, context) {
      return Promise.resolve(getRoute(location, routes))
        .then(({ component, load, params, middleware, path, options }) => {
          const ctx = Object.assign(context || {}, { params, location })

          for (let fn of middleware) fn(ctx)

          if (typeof load === 'function') {
            return Promise.resolve(load({}, ctx))
              .then(data => {
                return {
                  data: data || {},
                  component,
                  params,
                  options
                }
              })
          } else {
            return {
              data: {},
              component,
              params,
              options
            }
          }
        })
    }
  }
}
