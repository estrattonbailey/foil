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
  return function child (...rs) {
    r.routes = rs || []
    r.options = r.options || {}
    return r
  }
}

export function use (fn) {
  return function middleware (props, ctx) {
    return fn(props, ctx)
  }
}

export function router (...defs) {
  const routes = []; // need semi

  (function walk (rs, parent, middleware) {
    for (let def of rs) {
      if (def.name === 'middleware') {
        middleware.push(def)

        // attach to parent and overwrite existing
        if (parent.routes && parent.routes.indexOf(def) > -1) {
          parent.middleware = parent.middleware.concat(def)
        }
        continue
      }

      const route = typeof def === 'function' ? def() : def
      route.middleware = middleware
      route.path = joinRoute(parent.path, route.path)
      route.parts = getParts(route.path)

      if (parent.load) {
        const load = route.load
        route.load = (ctx, props) => {
          return Promise.resolve(parent.load(ctx, props)).then(props => load ? load(ctx, props) : props)
        }
      }

      routes.push(route)

      walk(route.routes, route, middleware.slice(0, middleware.length)) // clone array
    }
  })(defs, { path: '' }, [])

  function go (location, redirect = {}) {
    const { path, params, middleware, payload } = getRoute(location, routes)

    let to = null

    const context = {
      params,
      location,
      redirect (loc) {
        to = loc
      }
    }

    for (let fn of middleware) fn(context)

    if (to) return go(to, {
      from: location,
      to
    })

    return {
      payload,
      context,
      redirect
    }
  }

  return {
    resolve (location, cb) {
      cb(go(location))
    }
  }
}
