# scouter
700 byte framework agnostic router.

## Install
```bash
npm i scouter --save
```

## Usage
Define route(s):
```javascript
// home.js
import { route } from 'scouter'

const path = '/'

const component = props => h`
  <h1>Home page</h1>
`

export default route({ path, component })
```
```javascript
// about.js
import { route } from 'scouter'

const path = '/about'

const component = props => h`
  <h1>About page</h1>
`

export default route({ path, component })
```
Create router:
```javascript
// router.js
import { router } from 'scouter'
import home from './home.js'
import about from './about.js'

export default router(
  home(),
  about()
)
```
Render route:
```javascript
// index.js
import router from './router.js'

router.resolve('/').then(({ component }) => {
  document.body.appendChild(component) // => <h1>Home page</h1>
})
```

## Asynchronous Routes
Define a `loader` and the route will resolve it before returning the component:
```javascript
// post.js
const path = '/posts/:slug'

const component = post => h`
  <h1>${post.slug}</h1>
`

const loader = ({ slug }, context) => {
  return getPostFromAPI(slug)
}

export default route({ path, component, loader })

// router.js
export default router(
  home(),
  about(),
  post()
)

// index.js
const context = { apiKey: 'abcde' }
router.resolve('/posts/my-post', context).then(({ component }) => {
  document.body.appendChild(component) // => <h1>my-post</h1>
})
```

## Nested Routes
Routes can be nested by passing a route definition to the function returned from the parent route. Nested routes build on the routes of their parents.

This means that certain generic routes can be reused in different locations. The code below results in four separate routes: `/about`, `/about/:slug`, `/posts`, and `/posts/:slug`.
```javascript
const about = route({
  path: '/about',
  component: AboutPage
})
const posts = route({
  path: '/posts',
  component: PostsPage
})

const bySlug = route({
  path: ':slug',
  component: Lightbox
})

export default router(
  about(
    bySlug()
  ),
  posts(
    bySlug()
  )
)
```

**Additionally,** nested routes will wait for their parent's `loader` functions to resolve *before calling their own*. This is useful for cases where child routes depend on data from their parents.
```javascript
// about.js
const path = '/about'

const component = props => h`
  <div>
    <h1>About page</h1>

    <ul>
      ${props.teamMembers.map(person => h`
        <li>${person.name}</li>
      `)}
    </ul>
  </div>
`

const loader = (props, context) => {
  return {
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
  }
}
```
```javascript
// team-member.js
const path = ':slug'

const component = props => h`
  <h1>${props.name}</h1>
`

const loader = ({ teamMembers }, { params }) => {
  const { slug } = params
  return teamMembers.filter(member => member.slug === slug)[0]
}
```
```javascript
// router.js
import about from './about.js'
import member from './team-member.js'
export default router (
  about(
    member()
  )
)
```
```javascript
// index.js
import router from './router.js'

router.resolve('/about/person-two').then(({ component }) => {
  document.body.appendChild(component) // => <h1>Person Two</h1>
})
```

## Server Side Rendering
```javascript
const app = require('express')()

app.get('*', (req, res) => {
  router.resolve(req.originalUrl).then(({ component }) => {
    res.send(`
      <!doctype html>
      <html>
        <head>
        </head>
        <body>
          ${component}
        </body>
      </html>
    `)
  })
})

app.listen(8080)
```

## Usage with React
```javascript
import React from 'react'
import { render } from 'react-dom'
import { router, route } from 'scouter'

const app = router(
  route({
    path: '/',
    component: props => (
      <h1>Home</h1>
    )
  })(),
  route({
    path: '/about',
    component: props => (
      <h1>About</h1>
    )
  })()
)

app.resolve('/').then(({ component: Comp }) => {
  render(<Comp />, document.body) // => <h1>Home</h1>
})
```

MIT
