import React from 'react'
import store from './store.js'

export default (map = state => state) => Comp => props => (
  <Comp {...Object.assign({}, props, map(store.state))} hydrate={store.hydrate} />
)