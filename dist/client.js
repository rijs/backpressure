(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
module.exports = backpressure;

function backpressure(ripple) {
  log("creating");

  if (client) {
    return (ripple.draw = draw(ripple)(ripple.draw), ripple.render = loaded(ripple)(ripple.render), ripple.deps = deps, start(ripple));
  }values(ripple.types).map(function (type) {
    return type.to = proxy(type.to || identity, limit);
  });
  values(ripple.types).map(function (type) {
    return type.from = proxy(type.from || identity, track(ripple));
  });
  ripple.io.use(function (socket, next) {
    socket.deps = {}, next();
  });
  return ripple;
}

function draw(ripple) {
  var refresh = debounce(10)(function (d) {
    return all(":unresolved").map(ripple.draw);
  });
  return function (d) {
    return function (thing) {
      var everything = !thing && (!this || !this.nodeName && !this.node);
      if (shadows || customs && everything) refresh();
      return d.apply(this, arguments);
    };
  };
}

function start(ripple) {
  ready(ripple.draw);
  if (customs) ready(polytop(ripple));
  return ripple;
}

function polytop(ripple) {
  var muto = new MutationObserver(drawNodes(ripple));
  return function (d) {
    return muto.observe(document.body, { childList: true, subtree: true });
  };
}

function drawNodes(ripple) {
  return function (mutations) {
    return mutations.map(key("addedNodes")).map(to.arr).reduce(flatten, []).filter(by("nodeName", includes("-"))).map(ripple.draw);
  };
}

function track(ripple) {
  return function (_ref) {
    var name = _ref.name;
    var body = _ref.body;

    var exists = (name in this.deps);
    this.deps[name] = 1;
    if (!exists) return (ripple.sync(this)(name), false);
    return true;
  };
}

function untrack(ripple) {
  return function (names) {
    delete this[name];
  };
}

function limit(res) {
  return res.name in this.deps ? res : false;
}

function deps(el) {
  return format([key("nodeName"), attr("data"), attr("css")])(el);
}

function format(arr) {
  return function (el) {
    return arr.map(function (fn) {
      return fn(el);
    }).filter(Boolean).map(lo).map(split(" ")).reduce(flatten, []).reduce(unique, "").filter(Boolean);
  };
}

function loaded(ripple) {
  return function (render) {
    return function (el) {
      var deps = ripple.deps(el);

      deps.filter(not(is["in"](ripple.resources))).map(function (name) {
        return (debug("pulling", name), name);
      }).map(function (name) {
        return ripple(name, { loading: true });
      });

      return deps.map(from(ripple.resources)).every(not(key("body.loading"))) ? render(el) : false;
    };
  };
}

function ready(fn) {
  return document.body ? fn() : document.addEventListener("DOMContentLoaded", function (d) {
    return fn();
  });
}

var identity = _interopRequire(require("utilise/identity"));

var values = _interopRequire(require("utilise/values"));

var client = _interopRequire(require("utilise/client"));

var proxy = _interopRequire(require("utilise/proxy"));

var noop = _interopRequire(require("utilise/noop"));

var not = _interopRequire(require("utilise/not"));

var log = _interopRequire(require("utilise/log"));

var err = _interopRequire(require("utilise/err"));

var is = _interopRequire(require("utilise/is"));

log = log("[ri/backpressure]");
err = err("[ri/backpressure]");
var shadows = client && !!document.head.createShadowRoot,
    customs = client && !!document.registerElement,
    debug = noop;
},{"utilise/client":2,"utilise/err":4,"utilise/identity":6,"utilise/is":7,"utilise/log":10,"utilise/noop":11,"utilise/not":12,"utilise/proxy":14,"utilise/values":18}],2:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],3:[function(require,module,exports){
var sel = require('utilise/sel')

module.exports = function datum(node){
  return sel(node).datum()
}
},{"utilise/sel":15}],4:[function(require,module,exports){
var owner = require('utilise/owner')
  , to = require('utilise/to')

module.exports = function err(prefix){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    var args = to.arr(arguments)
    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"utilise/owner":13,"utilise/to":17}],5:[function(require,module,exports){
var datum = require('utilise/datum')
  , key = require('utilise/key')

module.exports = from
from.parent = fromParent

function from(o){
  return function(k){
    return key(k)(o)
  }
}

function fromParent(k){
  return datum(this.parentNode)[k]
}
},{"utilise/datum":3,"utilise/key":8}],6:[function(require,module,exports){
module.exports = function identity(d) {
  return d
}
},{}],7:[function(require,module,exports){
module.exports = is
is.fn     = isFunction
is.str    = isString
is.num    = isNumber
is.obj    = isObject
is.lit    = isLiteral
is.bol    = isBoolean
is.truthy = isTruthy
is.falsy  = isFalsy
is.arr    = isArray
is.null   = isNull
is.def    = isDef
is.in     = isIn

function is(v){
  return function(d){
    return d == v
  }
}

function isFunction(d) {
  return typeof d == 'function'
}

function isBoolean(d) {
  return typeof d == 'boolean'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isLiteral(d) {
  return typeof d == 'object' 
      && !(d instanceof Array)
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isIn(set) {
  return function(d){
    return !set ? false  
         : set.indexOf ? ~set.indexOf(d)
         : d in set
  }
}
},{}],8:[function(require,module,exports){
var is = require('utilise/is')
  , str = require('utilise/str')

module.exports = function key(k, v){ 
  var set = arguments.length > 1
    , keys = str(k).split('.')
    , root = keys.shift()

  return function deep(o){
    var masked = {}
    return !o ? undefined 
         : !k ? o
         : is.arr(k) ? (k.map(copy), masked)
         : o[k] || !keys.length ? (set ? ((o[k] = is.fn(v) ? v(o[k]) : v), o)
                                       :   o[k])
                                : (set ? (key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {})), o)
                                       : key(keys.join('.'))(o[root]))

    function copy(k){
      var val = key(k)(o)
      ;(val != undefined) && key(k, val)(masked)
    }
  }
}
},{"utilise/is":7,"utilise/str":16}],9:[function(require,module,exports){
module.exports = function keys(o) {
  return Object.keys(o || {})
}
},{}],10:[function(require,module,exports){
var is = require('utilise/is')
  , to = require('utilise/to')
  , owner = require('utilise/owner')

module.exports = function log(prefix){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"utilise/is":7,"utilise/owner":13,"utilise/to":17}],11:[function(require,module,exports){
module.exports = function noop(){}
},{}],12:[function(require,module,exports){
module.exports = function not(fn){
  return function(){
    return !fn.apply(this, arguments)
  }
}
},{}],13:[function(require,module,exports){
(function (global){
module.exports = require('utilise/client') ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"utilise/client":2}],14:[function(require,module,exports){
var is = require('utilise/is')

module.exports = function proxy(fn, ret, ctx){ 
  return function(){
    var result = fn.apply(ctx || this, arguments)
    return is.fn(ret) ? ret.call(ctx || this, result) : ret || result
  }
}
},{"utilise/is":7}],15:[function(require,module,exports){
module.exports = function sel(){
  return d3.select.apply(this, arguments)
}
},{}],16:[function(require,module,exports){
var is = require('utilise/is') 

module.exports = function str(d){
  return d === 0 ? '0'
       : !d ? ''
       : is.fn(d) ? '' + d
       : is.obj(d) ? JSON.stringify(d)
       : String(d)
}
},{"utilise/is":7}],17:[function(require,module,exports){
module.exports = { 
  arr: toArray
, obj: toObject
}

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}

function toObject(d) {
  var by = 'id'
    , o = {}

  return arguments.length == 1 
    ? (by = d, reduce)
    : reduce.apply(this, arguments)

  function reduce(p,v,i){
    if (i === 0) p = {}
    p[v[by]] = v
    return p
  }
}
},{}],18:[function(require,module,exports){
var keys = require('utilise/keys')
  , from = require('utilise/from')

module.exports = function values(o) {
  return !o ? [] : keys(o).map(from(o))
}
},{"utilise/from":5,"utilise/keys":9}]},{},[1]);
