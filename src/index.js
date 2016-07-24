// -------------------------------------------
// Applies backpressure on the flow of streams
// -------------------------------------------
export default function backpressure(ripple){
  log('creating')
  if (!ripple.io) return ripple
  if (client) return (ripple.render    = loaded(ripple)(ripple.render))
                   , (ripple.pull      = emit(ripple))
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

const start = ripple => d => scan(ripple)(document.body)

const scan = ripple => el => !el ? undefined : (all('*', el)
  .filter(by('nodeName', includes('-')))
  .filter(by('nodeName', d => !is.in(ripple.requested)(lo(d))))
  .map(ripple.draw), el)

const track = ripple => next => (req, res) => { 
  const { name, type, socket } = req
      , { send } = ripple
      , exists = name in socket.deps

  if (!(name in ripple.resources)) return
  if (type !== 'pull') return (next || identity)(req, res)
  socket.deps[name] = 1
  send(socket)(name)
  return false
}

const reconnect = ({ io }) => d => (io.io.disconnect(), io.io.connect())

const refresh = ripple => d => group('refreshing', d =>
  values(ripple.resources)
    .map(({ name }) => emit(ripple)(name)))

const emit = ripple => name => { 
  log('pulling', name)
  ripple.io.emit('change', { name, type: 'pull' }) 
  ripple.requested[name] = 1
  return name 
}

const limit = next => req => 
    req.name in req.socket.deps
  ? (next || identity)(req)
  : false

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

const loaded = ripple => next => el => ripple.deps(el)
  .filter(not(is.in(ripple.requested)))
  .map(emit(ripple))
  .length ? false : scan(ripple)(next(el))

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