'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = backpressure;

var _from = require('utilise/from');

var _from2 = _interopRequireDefault(_from);

var _includes = require('utilise/includes');

var _includes2 = _interopRequireDefault(_includes);

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

var _group = require('utilise/group');

var _group2 = _interopRequireDefault(_group);

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
  if (_client2.default) return ripple.render = loaded(ripple)(ripple.render), ripple.pull = pull(ripple), ripple.deps = deps, ripple.requested = {}, (0, _ready2.default)(start(ripple)), ripple.io.on('connect', refresh(ripple)), ripple.io.on('reconnect', reconnect(ripple)), ripple;

  ripple.to = limit(ripple.to);
  ripple.from = track(ripple)(ripple.from);
  ripple.io.use(function (socket, next) {
    socket.deps = {}, next();
  });
  return ripple;
}

var start = function start(ripple) {
  return function (d) {
    return ripple.pull(document.body);
  };
};

var pull = function pull(ripple) {
  return function (el) {
    return !el ? undefined : ((0, _all2.default)('*', el).filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).filter((0, _by2.default)('nodeName', function (d) {
      return !_is2.default.in(ripple.requested)((0, _lo2.default)(d));
    })).map(ripple.draw), el);
  };
};

var track = function track(ripple) {
  return function (next) {
    return function (_ref) {
      var name = _ref.name;
      var headers = _ref.headers;

      var exists = name in this.deps;
      if (!headers || !headers.pull) return next ? next.apply(this, arguments) : true;
      this.deps[name] = 1;
      ripple.stream(this)(name);
      return false;
    };
  };
};

var reconnect = function reconnect(_ref2) {
  var io = _ref2.io;
  return function (d) {
    return io.io.disconnect(), io.io.connect();
  };
};

var refresh = function refresh(ripple) {
  return function (d) {
    return (0, _group2.default)('refreshing', function (d) {
      return (0, _values2.default)(ripple.resources).map(function (_ref3) {
        var name = _ref3.name;
        return emit(ripple)(name);
      });
    });
  };
};

var emit = function emit(ripple) {
  return function (name) {
    log('pulling', name);
    ripple.io.emit('change', [name, false, { name: name, headers: headers }]);
    ripple.requested[name] = 1;
    return name;
  };
};

var limit = function limit(next) {
  return function (res) {
    return !(res.name in this.deps) ? false : !next ? true : next.apply(this, arguments);
  };
};

var deps = function deps(el) {
  return format([(0, _key2.default)('nodeName'), (0, _attr2.default)('data'), (0, _attr2.default)('css')])(el);
};

var format = function format(arr) {
  return function (el) {
    return arr.map(function (extract) {
      return extract(el);
    }).filter(Boolean).map(_lo2.default).map((0, _split2.default)(' ')).reduce(_flatten2.default, []).filter(_unique2.default);
  };
};

var loaded = function loaded(ripple) {
  return function (render) {
    return function (el) {
      return ripple.deps(el)
      // .filter(not(is.in(ripple.resources)))
      .filter((0, _not2.default)(_is2.default.in(ripple.requested))).map(emit(ripple)).length ? false : ripple.pull(render(el));
    };
  };
};

var log = require('utilise/log')('[ri/back]'),
    err = require('utilise/err')('[ri/back]'),
    headers = { pull: true };