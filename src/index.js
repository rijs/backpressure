// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
export default function backpressure(ripple){
  log('creating')
  if (!ripple.io) return ripple
  if (client) return (ripple.render = loaded(ripple)(ripple.render))
                   , (ripple.draw = draw(ripple)(ripple.draw))
                   , (ripple.deps = deps)
                   , (start(ripple))

  ripple.to = limit(ripple.to)
  ripple.from = track(ripple)(ripple.from)
  ripple.io.use((socket, next) => { socket.deps = {}, next() })
  return ripple
}

const draw = ripple => {
  const refresh = d => all(':unresolved')
    .filter(not(key('requested')))
    .map(key('requested', true))
    .map(ripple.draw)

  return next => function(thing) {
    const everything = !thing && (!this || (!this.nodeName && !this.node))
        , ret = next.apply(this, thing instanceof Event ? [] : arguments)
    if (shadows || (customs && everything)) raf(refresh)
    return ret
  }
}

const start = ripple => {
  load(ripple)
  ready(ripple.draw)
  if (customs) ready(polytop(ripple))
  else ready(d => all('*').filter(by('nodeName', includes('-'))).map(ripple.draw))
  return ripple
}

const polytop = ripple => {
  var muto = new MutationObserver(drawNodes(ripple))
  return d => muto.observe(document.body, { childList: true, subtree: true })
}

const drawNodes = ripple => mutations => mutations
  .map(key('addedNodes'))
  .map(to.arr)
  .reduce(flatten, [])
  .filter(by('nodeName', includes('-')))
  .map(ripple.draw)

const track = ripple => next => function(res, { name, headers }){ 
  const exists = name in this.deps

  if (!headers || !headers.pull) return next ? next.apply(this, arguments) : true
  return this.deps[name] = 1
       , ripple.stream(this)(name)
       , false
}

const load = ripple => group('pulling cache', fn =>
  (parse(localStorage.ripple) || [])
    .map(({ name }) => log(name))
    .map(name => ripple.io.emit('change', [name, { name, headers }])))

const limit = next => function(res){
  return res.name in this.deps 
       ? (next ? next.apply(this, arguments) : res)
       : false
}

const deps = el => format([ 
    key('nodeName')
  , attr('data')
  , attr('css')
  ])(el)

const format = arr => el => arr
  .map(extract => extract(el))
  .filter(Boolean)
  .map(lo)
  .map(split(' '))
  .reduce(flatten, [])
  .filter(unique)

const loaded = ripple => render => el => ripple.deps(el)
  .filter(not(is.in(ripple.resources)))
  .map(name => (debug('pulling', name), name))
  .map(name => ripple.io.emit('change', [name, { headers }]))
  .length ? false : render(el)

import { default as from } from 'utilise/from'
import includes from 'utilise/includes'
import debounce from 'utilise/debounce'
import flatten from 'utilise/flatten'
import unique from 'utilise/unique'
import values from 'utilise/values'
import client from 'utilise/client'
import ready from 'utilise/ready'
import proxy from 'utilise/proxy'
import group from 'utilise/group'
import parse from 'utilise/parse'
import split from 'utilise/split'
import attr from 'utilise/attr'
import noop from 'utilise/noop'
import not from 'utilise/not'
import all from 'utilise/all'
import key from 'utilise/key'
import is from 'utilise/is'
import by from 'utilise/by'
import to from 'utilise/to'
import lo from 'utilise/lo'
const log = require('utilise/log')('[ri/backpressure]')
    , err = require('utilise/err')('[ri/backpressure]')
    , shadows = client && !!document.head.createShadowRoot
    , customs = client && !!document.registerElement
    , raf = client && requestAnimationFrame
    , headers = { pull: true }
    , debug = noop