import React from 'react'
import { route } from 'scouter'
import App from '../App.js'

const path = '/about'

const component = props => (
  <App>
    <h1>About</h1>
  </App>
)

export default route({ path, component })