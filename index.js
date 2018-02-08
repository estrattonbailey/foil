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

export function route (r) {
  return function child (...rs) {
    r.routes = rs || []
    r.options = r.options || {}
    return r
  }
}

export function use (fn) {
  function middleware (props, ctx) {
    return fn(props, ctx)
  }
  middleware.__middleware = true
  return middleware
}

export function router (...defs) {
  const routes = []; // need semi

  (function walk (rs, parent, middleware) {
    for (let def of rs) {
      if (def.__middleware) {
        middleware.push(def)

        // attach to parent and overwrite existing
        if (parent.routes && parent.routes.indexOf(def) > -1) {
          parent.middleware = parent.middleware.concat(def)
        }
        continue
      }

      const route = typeof def === 'function' ? def() : def
      route.middleware = middleware
      route.path = [parent.path, route.path].join('/').replace('//', '/')
      route.parts = getParts(route.path)

      routes.push(route)

      walk(route.routes, route, middleware.slice(0, middleware.length)) // clone array
    }
  })(defs, { path: '' }, [])

  function go (location, redirect = {}) {
    const { path, params, middleware, payload } = getRoute(location, routes)

    let to = null

    const context = {
      params,
      location
    }

    for (let fn of middleware) {
      fn(Object.assign(context, {
        redirect (loc) {
          to = loc
        }
      }))
    }

    if (to) {
      return go(to, {
        from: location,
        to
      })
    }

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
