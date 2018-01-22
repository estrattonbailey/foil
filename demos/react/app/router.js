import { router, use } from 'scouter'
import store from './state/store.js'

import Home from './routes/Home.js'
import About from './routes/About.js'
import Posts from './routes/Posts.js'
import Post from './routes/Post.js'

export default router(
  use((props, ctx) => {
    console.log('top', props, ctx)
  }),
  Home,
  About,
  Posts(
    use((props, ctx) => {
      console.log('nested', props, ctx)
    }),
    Post
  )
)
