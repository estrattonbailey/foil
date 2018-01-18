export default function createHistory () {
  const state = window.location.pathname
  let handlers = []
  return {
    push (pathname) {
      history.pushState({}, '', pathname)
      for (let fn of handlers) fn(pathname)
    },
    update (fn) {
      handlers.push(fn)
    }
  }
}
