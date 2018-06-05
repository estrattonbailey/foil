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
        const cleanPart = urls[i].split('?')[0]
        if (route.parts[i][0] === ':') {
          params[route.parts[i].slice(1)] = cleanPart
          continue inner
        } else if (route.parts[i] === cleanPart) {
          continue inner
        } else if (route.parts[i] === '*') {
          break;
        }
        continue outer
      }
      return {
        route,
        params
      }
    } else if (route.parts[0] == '*') {
      return {
        route,
        params
      }
    }
  }
}

export function route (r) {
  return function child (...rs) {
    r.routes = rs || []
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

export function router (defs = [], userContext = {}) {
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
      route.path = [parent.path, route.path.replace(parent.path, '')].join('/').replace('//', '/')
      route.parts = getParts(route.path)

      routes.push(route)

      walk(route.routes, route, middleware.slice(0, middleware.length)) // clone array
    }
  })(defs, { path: '' }, [])

  function go (location, redirect = {}) {
    const match = getRoute(location, routes)

    let context = Object.assign({}, userContext, {
      state: {
        params: {},
        location
      }
    })

    if (!match) {
      console.error(
        'foil: no match for',
        location
      )

      return {
        payload: null,
        context,
        redirect
      }
    }

    const { route, params } = match
    const { middleware, payload } = route

    context = Object.assign(context, {
      state: {
        params,
        location
      }
    })

    let to = null

    for (let fn of middleware) {
      fn(context, function redirect (loc) {
        to = loc
      })
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
