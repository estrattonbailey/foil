import React from 'react'
import { route } from 'scouter'
import App from '../App.js'

const path = '/'

const component = props => (
  <App>
    <h1>Home</h1>
  </App>
)

export default route({ path, component })