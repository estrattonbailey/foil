# foil
700 byte framework agnostic universal router.

## Features
`foil` is an attempt to take the magic out of routing front-end applications. Specifically, React. It's Not Components™, and hopefully that's a good thing.

1. Data first
2. Async-by-default
3. Nestable
4. Middleware
5. Universal, works in Node

`foil` can be used with most UI building libraries, but the examples below will use React.

## Install
```bash
npm i foil --save
```

## Usage

```javascript
import React from 'react'
import { render } from 'react-dom'
import { router, route, use } from 'foil'

const app = router(
  use(context => {
    window.history.pushState({}, '', context.location)
  }),
  route({
    path: '/',
    component: props => <h1>Home</h1>
  }),
  route({
    path: '*',
    component: props => <h1>404 Not Found</h1>
  })
)

app.resolve('/').then(({ component: Comp }) => {
  render(<Comp />, document.body)
})
```

## Defining routes
Routes accept an object as their only parameter. The route object can contain the following properties:

- `path` - a path representing the route, including named parameters (*required*)
- `component` - a component to be returned when the route is matched (*required*)
- `load` - called when route matches, useful for loading data, can return a `Promise`
  - any returned data will be passed to child-route `load` functions and output from `router.resolve()`
- `options` - an object with extra data and parameters
  - not used internally (at the moment), but can be useful to library users

```javascript
import { route } from 'foil'

const path = '/'

const component = props => (
  <h1>Home page</h1>
)

const load = context => {
  return new Promise((res, rej) => {
    resolve({})
  })
}

const options = {
  pageTitle: 'Home'
}

export default route({ path, component, load, options })
```

## Asynchronous routes
When a `load` handler is defined on a route, `foil` will wait to resolve the route until the routes's `load` function resolves. During this time, the developer can show a loading animation or what-have-you.

Named route parameters are passed to the `load` function on the `context` object.
```javascript
import { route } from 'foil'

const path = '/posts/:slug'

const component = post => (
  <h1>{post.slug}</h1>
)

const load = context => {
  return getPostFromAPI(context.params.slug)
}

export default route({ path, component, load })
```

## Nested routes
Routes can be nested by passing a route to the function returned from the parent route. Nested routes build on the routes of their parents.

This means that certain generic routes can be reused in different locations. The code below results in four separate routes: `/about`, `/about/:slug`, `/posts`, and `/posts/:slug`.
```javascript
import { router, route } from 'foil'

const About = route({
  path: '/about',
  component: About
})

const Posts = route({
  path: '/posts',
  component: Posts
})

const Lightbox = route({
  path: ':slug',
  component: Lightbox
})

export default router(
  About(
    Lightbox
  ),
  Posts(
    Lightbox
  )
)
```

## Nested loading
Nested routes will wait for their parent's `load` functions to resolve *before calling their own*. This is useful for cases where child routes depend on data from their parents.
```javascript
import { router, route } from 'foil'
import store from './my-store.js'

const About = route({
  path: '/about',
  component: props => (
    <div>
      <h1>About page</h1>

      <ul>
        {props.teamMembers.map(person => (
          <li>{person.name}</li>
        ))}
      </ul>
    </div>
  ),
  load: context => {
    store.setState({
      teamMembers: [
        {
          name: 'Person One',
          slug: 'person-one'
        },
        {
          name: 'Person Two',
          slug: 'person-two'
        }
      ]
    })
  }
})

const AboutMember = route({
  path: ':slug',
  component: props => {
    const person = store.getState().teamMembers.filter(person => (
      person.slug === props.params.slug
    ))[0]
    return (
      <h1>{person.name}</h1>
    )
  }
})

const app = router (
  About(
    AboutMember
  )
)

app.resolve('/about/person-two').then(({ component: Comp, data, params }) => {
  render(<Comp params={params} />, document.body) // => <h1>Person Two</h1>
})
```

## Middleware
`foil` implements very simple middleware. Middleware are applied for the route scope in which they are defined, and all nested scopes.

Below, `middleware1` will be called when the `/` route resolves. When the `/posts/:slug` route resolves, both `middleware1` and `middleware2` will be called.
```javascript
const middleware1 = use(context => console.log('Top level!'))
const middleware2 = use(context => console.log('Nested!'))

export default router(
  middleware1,
  Home,
  Posts(
    middleware2,
    Post
  )
)
```

## Using context
You can optionally pass an initial `context` object when calling `router.resolve()`. This is useful when dealing with API keys, authorization tokens, etc.
```javascript
router.resolve('/', { auth_token: 'abcde12345' }).then(props => ...)
```
The `context` object is passed to all `load` functions, as well as any middleware you've defined along the way.
```javascript
const About = route({
  path: '/about',
  component: About,
  load: context => {
    console.log(context.auth_token) // => abcde12345
  }
})
```

## Server Side Rendering
```javascript
const app = require('express')()
const { renderToString } = require('react-dom/server')

app.get('*', (req, res) => {
  router.resolve(req.originalUrl).then(({ component: Comp }) => {
    res.send(`
      <!doctype html>
      <html>
        <head>
        </head>
        <body>
          ${renderToString(<Comp />)}
        </body>
      </html>
    `)
  })
})

app.listen(8080)
```

## Recipes TODO
1. `document.title` using `options.title` utility
2. Incremental rendering using `picostate`
3. Redirect example
4. Protected routes

* * *
Many thanks to [jkuri](https://github.com/jkuri) for the name!

MIT
