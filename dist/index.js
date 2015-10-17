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
    if (!exists) ripple.sync(this)(name);
    if (body.loading) return false;
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