import React from 'react'
import Link from './components/Link.js'

export default function App ({ children }) {
  return (
    <main>
      <nav>
        <ul>
          <li><Link href='/'>Home</Link></li>
          <li><Link href='/about'>About</Link></li>
          <li><Link href='/posts'>Posts (async)</Link></li>
          <li><Link href='/posts/post-one'>Post One</Link></li>
        </ul>
      </nav>
      {children}
    </main>
  )
}
