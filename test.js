var core     = require('rijs.core').default
  , data     = require('rijs.data').default
  , sync     = require('rijs.sync').default
  , back     = require('./').default
  , includes = require('utilise/includes')
  , update   = require('utilise/update')
  , remove   = require('utilise/remove')
  , clone    = require('utilise/clone')
  , falsy    = require('utilise/falsy')
  , push     = require('utilise/push')
  , noop     = require('utilise/noop')
  , key      = require('utilise/key')
  , pop      = require('utilise/pop')
  , str      = require('utilise/str')
  , not      = require('utilise/not')
  , expect   = require('chai').expect
  , mockery  = require('mockery')
  , request  = { headers: { 'x-forwarded-for': 10 }}
  , socket   = { emit: function(type, data){ return socket.emitted = emitted = [type, data]}, request: request}
  , other    = { emit: function(type, data){ return other.emitted = [type, data]}, request: request }
  , sockets, opts, emitted, connection, receive

describe('Sync', function(){

  before(function(){ 
    mockery.enable()
    mockery.registerMock('socket.io', sio)
  })

  beforeEach(function(){
    opts = emitted = socket.emitted = other.emitted = null
    sockets = [socket, other]
  })

  after(function(){ 
    mockery.disable()
  })

  it('should initialise correctly', function(){  
    var ripple = back(data(core()))
    expect(ripple.io).to.be.not.ok
    expect(ripple.to).to.be.not.ok
    expect(ripple.from).to.be.not.ok
  
    var ripple = back(sync(data(core()), { server: { foo: 'bar' }}))
    expect(ripple.io).to.be.ok
    expect(ripple.to).to.be.a('function')
    expect(ripple.from).to.be.a('function')
  })

  it('should stream new resource', function(){  
    var ripple = back(sync(data(core()), { server: { foo: 'bar' }}))
    expect(socket.deps).to.be.eql({})
    expect(other.deps).to.be.eql({})
    ripple('foo', { foo: 'bar' }) 
    expect(other.emitted).to.be.not.ok
    expect(socket.emitted).to.be.not.ok
  })

 it('should ripple(!) changes - efficiently', function(){  
    var ripple = back(sync(data(core()), { server: { foo: 'bar' }}))

    receive.call(socket, ['foo', false, { name: 'foo', headers: { pull: true }}]) 
    expect(socket.deps).to.be.eql({ foo: 1 })
    expect(other.deps).to.be.eql({})
    
    // should not oversend
    ripple('foo', { foo: 'bar' }) 
    expect(socket.emitted).to.be.eql(['change', ['foo', { type: 'update', value: { foo: 'bar' }}]])
    expect(other.emitted).to.be.not.ok
    socket.emitted = other.emitted = null

    // subsequent changes should ripple
    receive.call({ deps: {}}, ['foo', { type: 'update', value: { foo: 'baz' }}]) 
    expect(ripple.resources.foo.body).to.be.eql({ foo: 'baz' })
    expect(socket.emitted).to.be.eql(['change', ['foo', { type: 'update', value: { foo: 'baz' }}]])
    expect(other.emitted).to.be.not.ok
  })

  it('should always send if pull request', function(){  
    var ripple = back(sync(data(core()), { server: { foo: 'bar' }}))
    other.deps = { foo: 1 }

    ripple('foo', { foo: 'bar' }) 
    receive.call(other, ['foo', false, { name: 'foo', headers: { pull: true }}]) 
    expect(other.emitted).to.be.eql(['change', ['foo', false, { name: 'foo', body: { foo: 'bar' }, headers: { 'content-type': 'application/data' }}]])
    expect(socket.emitted).to.be.not.ok
  })

  it('should respect existing transforms (outgoing - block)', function(){  
    var ripple = sync(data(core()), { server: { foo: 'bar' }})
    ripple.to = falsy
    ripple = back(ripple)

    receive.call(socket, ['foo', false, { name: 'foo', headers: { pull: true }}]) 
    expect(socket.deps).to.be.eql({ foo: 1 })
    expect(other.deps).to.be.eql({})
    
    ripple('foo', { foo: 'bar' }) 
    expect(socket.emitted).to.be.not.ok
    expect(other.emitted).to.be.not.ok
    socket.emitted = other.emitted = null
  })
  
  it('should respect existing transforms (outgoing - pass through)', function(){  
    var ripple = sync(data(core()), { server: { foo: 'bar' }})
    ripple.to = not(falsy)
    ripple = back(ripple)

    receive.call(socket, ['foo', false, { name: 'foo', headers: { pull: true }}]) 
    expect(socket.deps).to.be.eql({ foo: 1 })
    expect(other.deps).to.be.eql({})
    
    ripple('foo', { foo: 'bar' }) 
    expect(socket.emitted).to.be.eql(['change', ['foo', { type: 'update', value: { foo: 'bar' }}]])
    expect(other.emitted).to.be.not.ok
    socket.emitted = other.emitted = null
  })

  it('should respect existing transforms (incoming - block)', function(){  
    var ripple = sync(data(core()), { server: { foo: 'bar' }})
    ripple.from = falsy
    ripple = back(ripple)

    receive.call({ deps: {}}, ['foo', { type: 'update', value: { foo: 'baz' }}]) 
    expect(ripple.resources.foo).to.be.not.ok
    expect(socket.emitted).to.be.not.ok
    expect(other.emitted).to.be.not.ok
  })
  
  it('should respect existing transforms (incoming - pass through)', function(){  
    var ripple = sync(data(core()), { server: { foo: 'bar' }})
    ripple.from = not(falsy)
    ripple = back(ripple)

    receive.call({ deps: {}}, ['foo', { type: 'update', value: { foo: 'baz' }}]) 
    expect(ripple.resources.foo.body).to.be.eql({ foo: 'baz' })
    expect(socket.emitted).to.be.not.ok
    expect(other.emitted).to.be.not.ok
  })

})

function sio(o){
  opts = o
  return {
    use: function(fn){
      sockets.map(function(s){ fn(s, noop) })
    }
  , on: function(type, fn){
      if (type === 'change') receive = fn
      if (type === 'connection' && includes('change')(str(fn))) fn({ on: noop })
      if (type === 'connection') connection = fn
  }
  , of: function(){ return { sockets: sockets } }
  }
}