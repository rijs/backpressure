// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
export default function backpressure(ripple){
  log('creating')

  if (client) return (ripple.draw = draw(ripple)(ripple.draw))
                   , (ripple.render = loaded(ripple)(ripple.render))
                   , (ripple.deps = deps)
                   , (start(ripple))

  values(ripple.types).map(type => type.to = proxy(type.to || identity, limit))
  values(ripple.types).map(type => type.from = proxy(type.from || identity, track(ripple)))
  ripple.io.use((socket, next) => { socket.deps = {}, next() })
  return ripple
}

function draw(ripple){
  var refresh = debounce(10)(d => all(':unresolved').map(ripple.draw))
  return d => {
    return function(thing) {
      var everything = !thing && (!this || (!this.nodeName && !this.node))
      if (shadows || (customs && everything)) refresh()
      return d.apply(this, arguments)
    }
  }
}

function start(ripple){
  ready(ripple.draw)
  if (customs) ready(polytop(ripple))
  return ripple
}

function polytop(ripple){
  var muto = new MutationObserver(drawNodes(ripple))
  return d => muto.observe(document.body, { childList: true, subtree: true })
}

function drawNodes(ripple) {
  return mutations => mutations
    .map(key('addedNodes'))
    .map(to.arr)
    .reduce(flatten, [])
    .filter(by('nodeName', includes('-')))
    .map(ripple.draw)
}

function track(ripple){ 
  return function({ name, body }) { 
    var exists = name in this.deps
    this.deps[name] = 1
    if (!exists) ripple.sync(this)(name)
    if (body.loading) return false
    return true
  }
}

function untrack(ripple){
  return function(names) {
    delete this[name]
  }
}

function limit(res){ 
  return res.name in this.deps
       ? res 
       : false
}

function deps(el){
  return format([ 
    key('nodeName')
  , attr('data')
  , attr('css')
  ])(el)
}

function format(arr){
  return el => arr
    .map(fn => fn(el))
    .filter(Boolean)
    .map(lo)
    .map(split(' '))
    .reduce(flatten, [])
    .reduce(unique, '')
    .filter(Boolean)
}

function loaded(ripple){
  return render => {
    return el => {
      var deps = ripple.deps(el)

      deps
        .filter(not(is.in(ripple.resources)))
        .map(name => (debug('pulling', name), name))
        .map(name => ripple(name, { loading: true }))

      return deps
        .map(from(ripple.resources))
        .every(not(key('body.loading')))
          ? render(el) : false
    }
  }
}

function ready(fn){
  return document.body ? fn() : document.addEventListener('DOMContentLoaded', d => fn())
}

import identity from 'utilise/identity'
import values from 'utilise/values'
import client from 'utilise/client'
import proxy from 'utilise/proxy'
import noop from 'utilise/noop'
import not from 'utilise/not'
import log from 'utilise/log'
import err from 'utilise/err'
import is from 'utilise/is'
log = log('[ri/backpressure]')
err = err('[ri/backpressure]')
var shadows = client && !!document.head.createShadowRoot
  , customs = client && !!document.registerElement
  , debug = noop