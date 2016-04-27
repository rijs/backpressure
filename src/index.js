// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
export default function backpressure(ripple){
  log('creating')
  if (!ripple.io) return ripple
  if (client) return (ripple.render    = loaded(ripple)(ripple.render))
                   , (ripple.pull      = pull(ripple))
                   , (ripple.deps      = deps)
                   , (ripple.requested = {})
                   , ready(start(ripple))
                   , ripple.io.on('connect', refresh(ripple))
                   , ripple.io.on('reconnect', reconnect(ripple))
                   , ripple

  ripple.to = limit(ripple.to)
  ripple.from = track(ripple)(ripple.from)
  ripple.io.use((socket, next) => { socket.deps = {}, next() })
  return ripple
}

const start = ripple => d => ripple.pull(document.body)

const pull = ripple => el => !el ? undefined : (all('*', el)
  .filter(by('nodeName', includes('-')))
  .filter(by('nodeName', d => !is.in(ripple.requested)(lo(d))))
  .map(ripple.draw), el)

const track = ripple => next => function({ name, headers }){ 
  const exists = name in this.deps
  if (!headers || !headers.pull) return next ? next.apply(this, arguments) : true
  this.deps[name] = 1
  ripple.stream(this)(name)
  return false
}

const reconnect = ({ io }) => d => (io.io.disconnect(), io.io.connect())

const refresh = ripple => d => group('refreshing', d =>
  values(ripple.resources)
    .map(({ name }) => emit(ripple)(name)))

const emit = ripple => name => { 
  log('pulling', name)
  ripple.io.emit('change', [ name, false, { name, headers } ])
  ripple.requested[name] = 1
  return name 
}

const limit = next => function(res){
  return !(res.name in this.deps) ? false
       : !next                    ? true
       :  next.apply(this, arguments)
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
  .filter(not(is.in(ripple.requested)))
  .map(emit(ripple))
  .length ? false : ripple.pull(render(el))

import { default as from } from 'utilise/from'
import includes from 'utilise/includes'
import flatten from 'utilise/flatten'
import unique from 'utilise/unique'
import values from 'utilise/values'
import client from 'utilise/client'
import ready from 'utilise/ready'
import group from 'utilise/group'
import split from 'utilise/split'
import attr from 'utilise/attr'
import noop from 'utilise/noop'
import not from 'utilise/not'
import all from 'utilise/all'
import key from 'utilise/key'
import is from 'utilise/is'
import by from 'utilise/by'
import lo from 'utilise/lo'
const log = require('utilise/log')('[ri/back]')
    , err = require('utilise/err')('[ri/back]')
    , headers = { pull: true }