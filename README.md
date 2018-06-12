# foil
700 byte framework agnostic universal router.

## Features
1. Simple
2. Nestable
3. Middleware
4. Universal

## Install
```bash
npm i foil --save
```

# Usage
```javascript
import { router, route } from 'foil'

const app = router([
  route({
    path: '/',
    payload: {
      // ...
    }
  }),
  route({
    path: '*',
    payload: {
      // 404
    }
  })
])

app.resolve('/', ({ payload, context, redirect }) => {
  // rendering logic
})
```

## Defining routes
Routes should be defined with both `path` and `payload` properties.
- `path` - a path representing the route, including named parameters
- `payload` - an object to be returned when the route is matched

```javascript
import { route } from 'foil'

const path = '/'

const payload = {
  // ...
}

export default route({
  path,
  payload
})
```

### Parameters
Routes can be defined with simple parameters. When matched, these params will be
returned on the `context` object. Only named parameters (`:slug`) and wildcards
(`*`) are supported at this time.
```javascript
import { router, route } from 'foil'

const app = router([
  route({
    path: '/:slug',
    payload: {
      // ...
    }
  })
])

app.resolve('/hello', ({ payload, context }) => {
  console.log(context.state.params) // => { slug: 'hello' }
})
```

### Context
`context` is created when a route is matched. It looks like this:

```javascript
{
  state: {
    params: {},
    pathname: '',
    search: '',
    location: ''
  }
}
```

#### Custom Context
You can add your own properties to `context` when you create a router instance.
It will then be available to every resolved route.

```javascript
const app = router(routes, {
  foo: true
})

app.resolve('/', ({ payload, context, redirect }) => {
  console.log(context) // => { state: { ... }, foo: true }
})
```

### Nested routes
Routes can be nested by passing a route to the function returned from the parent
route. Nested routes build on the paths of their parents.

This means that certain generic routes can be reused in different locations. The
code below results in four separate routes: `/about`, `/about/:slug`, `/posts`,
and `/posts/:slug`.

```javascript
import { router, route } from 'foil'

const About = route({
  path: '/about',
  payload: {}
})

const Posts = route({
  path: '/posts',
  payload: {}
})

const Lightbox = route({
  path: ':slug',
  payload: {}
})

export default router([
  About(
    Lightbox
  ),
  Posts(
    Lightbox
  )
])
```

## Middleware
`foil` implements very simple "middleware". Middleware functions are defined
with the `use` export from `foil`.

Middleware are passed the complete `context` of the route matched, *plus* a
handy `redirect` method.

They are executed on each route transition for the route scope in which they are
defined, and all nested scopes.

Below, the `root` middleware will be called when the `Home` or `Posts` routes
are matched.  When either `Home`, `Posts` or `Post` are matched, *both* `root` and
`nested` will fire.

```javascript
const root = use(context => // ...)
const nested = use(context => // ...)

export default router([
  root,
  Home,
  Posts(
    nested,
    Post
  )
])
```

## Redirects
Redirects are creating using middleware.

```javascript
import { router, route, use } from 'foil'

const redirectMiddleware = use((context, redirect) => {
  const { pathname } = context.state

  if (pathname === '/some-path') {
    return redirect('/some-other-path')
  }
})

const app = router(
  redirectMiddleware,
  // ... routes
)
```

If a redirect is issued via `redirect()`, the `redirect` prop passed to
your `app.resolve()` callback will contain `to` and `from` properties that tell
you where the redirect occurred:

```javascript
app.resolve('/some-path', ({ payload, context, redirect }) => {
  console.log(redirect) // { to: '/some-other-path', from: '/some-path' }
})
```

### Protected Routes
A route or a group of routes can also easily be protected using this same
pattern.

```javascript
import { router, route, use } from 'foil'
import store from './store.js' // whatever you want to use

const app = router(
  route({
    path: '/'
    payload: {}
  }),
  route({
    path: '/login',
    payload: {}
  })
  route({
    path: '/account',
    payload: {}
  })(
    use((context, redirect) => {
      if (!store.state.user) {
        return redirect('/login')
      }
    }),
    route({
      path: '/:order',
      payload: {}
    })
  )
)
```

## Server Side Rendering
Create a new `foil` instance on each request.

```javascript
import express from 'express'
import { router } from 'foil'
import routes from './routes.js'

const server = express()

server.get('*', (req, res) => {
  const app = router(routes, {
    serverToken: ''
  })

  app.resolve(req.originalUrl, ({ payload, context, redirect }) => {
    if (redirect.to) {
      res.redirect(redirect.to)
    } else {
      res.send(// render logic)
    }
  })
})

server.listen(8080)
```

# Usage with Other UI Libraries
- React - [@foil/react](https://github.com/estrattonbailey/foil-react)

# About the Name
I like the word *foil* as a figurative term, as in *to set off by contrast*. In
the context of routing in React (which is my main motivation behind this
library, see [@foil/react](https://github.com/estrattonbailey/foil-react)),
`foil` is a bit of a departure from many of the more well established patterns.

Many thanks to [jkuri](https://github.com/jkuri) for letting me use the npm
package name! Very kind of him :)

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)
