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

var _ready = require('utilise/ready');

var _ready2 = _interopRequireDefault(_ready);

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

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// API: Applies backpressure on the flow of streams
// -------------------------------------------
function backpressure(ripple) {
  log('creating');
  if (!ripple.io) return ripple;
/* istanbul ignore next */
  if (_client2.default) return ripple.render = loaded(ripple)(ripple.render), ripple.draw = draw(ripple)(ripple.draw), ripple.deps = deps, start(ripple);

  ripple.to = limit(ripple.to);
  ripple.from = track(ripple)(ripple.from);
  ripple.io.use(function (socket, next) {
    socket.deps = {}, next();
  });
  return ripple;
}

/* istanbul ignore next */
var draw = function draw(ripple) {
  var refresh = function refresh(d) {
    return (0, _all2.default)(':unresolved').filter((0, _not2.default)((0, _key2.default)('requested'))).map((0, _key2.default)('requested', true)).map(ripple.draw);
  };

  return function (next) {
    return function (thing) {
      var everything = !thing && (!this || !this.nodeName && !this.node),
          ret = next.apply(this, thing instanceof Event ? [] : arguments);
      if (shadows || customs && everything) raf(refresh);
      return ret;
    };
  };
};

/* istanbul ignore next */
var start = function start(ripple) {
  load(ripple);
  (0, _ready2.default)(ripple.draw);
  if (customs) (0, _ready2.default)(polytop(ripple));else (0, _ready2.default)(function (d) {
    return (0, _all2.default)('*').filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).map(ripple.draw);
  });
  return ripple;
};

/* istanbul ignore next */
var polytop = function polytop(ripple) {
  var muto = new MutationObserver(drawNodes(ripple));
  return function (d) {
    return muto.observe(document.body, { childList: true, subtree: true });
  };
};

/* istanbul ignore next */
var drawNodes = function drawNodes(ripple) {
  return function (mutations) {
    return mutations.map((0, _key2.default)('addedNodes')).map(_to2.default.arr).reduce(_flatten2.default, []).filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).map(ripple.draw);
  };
};

var track = function track(ripple) {
  return function (next) {
    return function (res, _ref) {
      var name = _ref.name;
      var headers = _ref.headers;

      var exists = name in this.deps;

      if (!headers || !headers.pull) return next ? next.apply(this, arguments) : true;
      return this.deps[name] = 1, ripple.stream(this)(name), false;
    };
  };
};

/* istanbul ignore next */
var load = function load(ripple) {
  return (0, _group2.default)('pulling cache', function (fn) {
    return ((0, _parse2.default)(localStorage.ripple) || []).map(function (_ref2) {
      var name = _ref2.name;
      return log(name);
    }).map(function (name) {
      return ripple.io.emit('change', [name, { name: name, headers: headers }]);
    });
  });
};

var limit = function limit(next) {
  return function (res) {
    return res.name in this.deps ? next ? next.apply(this, arguments) : res : false;
  };
};

/* istanbul ignore next */
var deps = function deps(el) {
  return format([(0, _key2.default)('nodeName'), (0, _attr2.default)('data'), (0, _attr2.default)('css')])(el);
};

/* istanbul ignore next */
var format = function format(arr) {
  return function (el) {
    return arr.map(function (extract) {
      return extract(el);
    }).filter(Boolean).map(_lo2.default).map((0, _split2.default)(' ')).reduce(_flatten2.default, []).filter(_unique2.default);
  };
};

/* istanbul ignore next */
var loaded = function loaded(ripple) {
  return function (render) {
    return function (el) {
      return ripple.deps(el).filter((0, _not2.default)(_is2.default.in(ripple.resources))).map(function (name) {
        return debug('pulling', name), name;
      }).map(function (name) {
        return ripple.io.emit('change', [name, { headers: headers }]);
      }).length ? false : render(el);
    };
  };
};

/* istanbul ignore next */
var log = require('utilise/log')('[ri/backpressure]'),
    err = require('utilise/err')('[ri/backpressure]'),
    shadows = _client2.default && !!document.head.createShadowRoot,
    customs = _client2.default && !!document.registerElement,
    raf = _client2.default && requestAnimationFrame,
    headers = { pull: true },
    debug = _noop2.default;