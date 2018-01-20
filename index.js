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
    r.routes = rs && rs.length > 0 ? (
      (function walk (routes) {
        return routes.map(route => {
          route.path = joinRoute(r.path, route.path)
          if (route.loader && r.loader) {
            const loader = route.loader
            route.loader = (props, ctx) => {
              return Promise.resolve(r.loader(props, ctx)).then(props => loader(props, ctx))
            }
          }
          walk(r.routes || [])
          return route
        })
      })(rs)
    ) : []

    return r
  }
}

export function router (...defs) {
  const routes = [];

  (function walk (rs) {
    while (rs.length) {
      const route = rs.pop()
      routes.push({
        parts: getParts(route.path),
        component: route.component,
        loader: route.loader
      })
      walk(route.routes)
    }
  })(defs)

  return {
    resolve (pathname, context) {
      return Promise.resolve(getRoute(pathname, routes))
        .then(({ component, loader, params }) => {
          const ctx = Object.assign(context || {}, { params })

          if (typeof loader === 'function') {
            return Promise.resolve(loader(null, ctx))
              .then(data => ({
                component,
                data,
                params
              }))
          } else {
            return {
              component,
              data: {},
              params
            }
          }
        })
    }
  }
}
