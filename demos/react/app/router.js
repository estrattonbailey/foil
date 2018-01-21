import { router } from 'scouter'
import store from './state/store.js'

import Home from './routes/Home.js'
import About from './routes/About.js'
import Posts from './routes/Posts.js'
import Post from './routes/Post.js'

export default router(
  Home,
  About,
  Posts(
    Post
  )
)
