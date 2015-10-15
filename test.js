var expect       = require('chai').expect
  , debounce     = require('utilise/debounce')
  , time         = require('utilise/time')
  , components   = require('rijs.components')
  , core         = require('rijs.core')
  , data         = require('rijs.data')
  , css          = require('rijs.css')
  , fn           = require('rijs.fn')
  , sync         = require('rijs.sync')
  , shadow       = require('rijs.shadow')
  , backpressure = require('./')
  , ripple       = backpressure(sync(components(css(fn(data(core()))))))
  , container    = document.createElement('div')
  , temp

window.ripple = ripple  

describe('Backpressure', function(){

  before(function(){
    document.body.appendChild(container)
  })

  beforeEach(function(done){ 
    container.innerHTML = ''
    ripple.io.emit('beforeEach')
    ripple.io.once('done', debounce(done))
  })

  afterEach(function(){
    temp && ripple.io.off('change', temp)
    keys(ripple.resources)
      .map(function(name){ delete ripple.resources[name] })
  })

  after(function(){
    document.body.removeChild(container)
  })

  it('should not load any resources by default', function(){  
    expect(keys(ripple.resources)).to.eql([])
  })

  it('should load only used resources', function(done){  
    ripple.io.on('change', temp = debounce()(function(){
      expect(keys(ripple.resources).sort()).to.eql(['array', 'my-component', 'some.css'])
      expect(ripple('array')).to.be.a('array')
      expect(ripple('my-component')).to.be.a('function')
      expect(ripple('some.css')).to.be.a('string')
      done()
    }))

    expect(keys(ripple.resources)).to.eql([])
    container.innerHTML = '<my-component data="array" css="some.css"></my-component>'
  })

  it('should work with deeply nested elements', function(done){  
    ripple.io.on('change', temp = debounce()(function(){
      expect(keys(ripple.resources).sort()).to.eql(['array', 'dynamic-el', 'my-component', 'some.css'])
      done()
    }))

    expect(keys(ripple.resources)).to.eql([])
    ripple('dynamic-el', function(d){ this.innerHTML = '<my-component data="array" css="some.css"></my-component>' })
    container.innerHTML = '<dynamic-el></dynamic-el>'
  })

  it('should work with shadow boundaries', function(done){  
    shadow(ripple)

    time(250, function(){ 
      expect(keys(ripple.resources).sort()).to.eql(['array', 'my-component', 'shadow-el', 'some.css'])
      expect(container.firstChild.shadowRoot.firstChild.nodeName).to.eql('MY-COMPONENT')
      done()
    })

    expect(keys(ripple.resources)).to.eql([])
    container.innerHTML = '<shadow-el></shadow-el>'
  })

})