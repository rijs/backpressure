'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = backpressure;

var _from = require('utilise/from');

var _from2 = _interopRequireDefault(_from);

var _includes = require('utilise/includes');

var _includes2 = _interopRequireDefault(_includes);

var _debounce = require('utilise/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _flatten = require('utilise/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _unique = require('utilise/unique');

var _unique2 = _interopRequireDefault(_unique);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _proxy = require('utilise/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _group = require('utilise/group');

var _group2 = _interopRequireDefault(_group);

var _parse = require('utilise/parse');

var _parse2 = _interopRequireDefault(_parse);

var _split = require('utilise/split');

var _split2 = _interopRequireDefault(_split);

var _attr = require('utilise/attr');

var _attr2 = _interopRequireDefault(_attr);

var _noop = require('utilise/noop');

var _noop2 = _interopRequireDefault(_noop);

var _not = require('utilise/not');

var _not2 = _interopRequireDefault(_not);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _by = require('utilise/by');

var _by2 = _interopRequireDefault(_by);

var _to = require('utilise/to');

var _to2 = _interopRequireDefault(_to);

var _lo = require('utilise/lo');

var _lo2 = _interopRequireDefault(_lo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
function backpressure(ripple) {
  log('creating');

  if (!ripple.io) return ripple;
  if (_client2.default) return ripple.draw = draw(ripple)(ripple.draw), ripple.render = loaded(ripple)(ripple.render), ripple.deps = deps, start(ripple);

  (0, _values2.default)(ripple.types).map(function (type) {
    return type.to = (0, _proxy2.default)(type.to, limit);
  });
  (0, _values2.default)(ripple.types).map(function (type) {
    return type.from = (0, _proxy2.default)(type.from, track(ripple));
  });
  ripple.io.use(function (socket, next) {
    socket.deps = {}, next();
  });
  return ripple;
}

function draw(ripple) {
  var refresh = (0, _debounce2.default)(10)(function (d) {
    return (0, _all2.default)(':unresolved').map(ripple.draw);
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
  load(ripple);
  ready(ripple.draw);
  if (customs) ready(polytop(ripple));else ready(function (d) {
    return (0, _all2.default)('*').filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).map(ripple.draw);
  });
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
    return mutations.map((0, _key2.default)('addedNodes')).map(_to2.default.arr).reduce(_flatten2.default, []).filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).map(ripple.draw);
  };
}

function track(ripple) {
  return function (_ref) {
    var name = _ref.name;
    var body = _ref.body;

    var exists = name in this.deps;
    this.deps[name] = 1;
    if (!exists) ripple.sync(this)(name);
    if (body.loading) return false;
    return true;
  };
}

function load(ripple) {
  (0, _group2.default)('pulling cache', function (fn) {
    return ((0, _parse2.default)(localStorage.ripple) || []).map(function (_ref2) {
      var name = _ref2.name;
      return ripple(name, { loading: loading });
    });
  });
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
  return format([(0, _key2.default)('nodeName'), (0, _attr2.default)('data'), (0, _attr2.default)('css')])(el);
}

function format(arr) {
  return function (el) {
    return arr.map(function (fn) {
      return fn(el);
    }).filter(Boolean).map(_lo2.default).map((0, _split2.default)(' ')).reduce(_flatten2.default, []).filter(_unique2.default);
  };
}

function loaded(ripple) {
  return function (render) {
    return function (el) {
      var deps = ripple.deps(el);

      deps.filter((0, _not2.default)(_is2.default.in(ripple.resources))).map(function (name) {
        return debug('pulling', name), name;
      }).map(function (name) {
        return ripple(name, { loading: loading });
      });

      return deps.map((0, _from2.default)(ripple.resources)).every((0, _not2.default)((0, _key2.default)('body.loading'))) ? render(el) : false;
    };
  };
}

function ready(fn) {
  return document.body ? fn() : document.addEventListener('DOMContentLoaded', function (d) {
    return fn();
  });
}

var log = require('utilise/log')('[ri/backpressure]'),
    err = require('utilise/err')('[ri/backpressure]'),
    shadows = _client2.default && !!document.head.createShadowRoot,
    customs = _client2.default && !!document.registerElement,
    loading = true,
    debug = _noop2.default;