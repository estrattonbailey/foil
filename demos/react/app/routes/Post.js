import React from 'react'
import { route } from 'scouter'
import connect from '../state/connect.js'
import App from '../App.js'

const path = ':slug'

const component = connect(state => ({
  posts: state.posts
}))(
  props => {
    const post = props.posts.filter(p => p.slug === props.params.slug)[0]
    return (
      <App>
        <h1>{post.title}</h1>
      </App>
    )
  }
)

export default route({ path, component })
