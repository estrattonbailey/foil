import React from 'react'
import { route } from 'scouter'
import store from '../state/store.js'
import connect from '../state/connect.js'
import App from '../App.js'

const path = '/posts'

const component = connect(state => ({
  posts: state.posts
}))(
  props => {
    return (
      <App>
        <h1>Posts</h1>

        <ul>
          {props.posts.map(post => (
            <li key={post.slug}>{post.title}</li>
          ))}
        </ul>
      </App>
    )
  }
)

const loader = (props, context) => {
  return store.state.posts ? (
    {
      posts: store.state.posts
    }
  ) : (
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const posts = {
          posts: [
            {
              slug: 'post-one',
              title: 'Post One'
            },
            {
              slug: 'post-two',
              title: 'Post Two'
            }
          ]
        }
        store.hydrate(posts)
        resolve(posts)
      }, 2000)
    })
  )
}

export default route({ path, component, loader })
