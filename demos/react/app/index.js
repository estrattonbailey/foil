import React from 'react'
import { render } from 'react-dom'
import router from './router.js'
import store from './state/store.js'

function update (path) {
  router.resolve(path || window.location.pathname)
    .then(({ component: Comp, params }) => {
      render(<Comp params={params} />, document.getElementById('root'))
    })
}

store.listen(state => {
  history.pushState({}, '', state.location)
  update(state.location)
})

update()