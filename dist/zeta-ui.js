(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("zeta-dom"), require("waterpipe"), require("jQuery"), (function webpackLoadOptionalExternalModule() { try { return require("zeta-editor"); } catch(e) {} }()), require("promise-polyfill"));
	else if(typeof define === 'function' && define.amd)
		define(["zeta-dom", "waterpipe", "jQuery", "zeta-editor", "promise-polyfill"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("zeta-dom"), require("waterpipe"), require("jQuery"), (function webpackLoadOptionalExternalModule() { try { return require("zeta-editor"); } catch(e) {} }()), require("promise-polyfill")) : factory(root["zeta"], root["waterpipe"], root["jQuery"], root["zeta"]["Editor"], root["promise-polyfill"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function(__WEBPACK_EXTERNAL_MODULE__163__, __WEBPACK_EXTERNAL_MODULE__160__, __WEBPACK_EXTERNAL_MODULE__609__, __WEBPACK_EXTERNAL_MODULE__47__, __WEBPACK_EXTERNAL_MODULE__804__) {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 935:
/***/ (function(module) {

"use strict";
module.exports = JSON.parse("{\"setToday\":\"Today\",\"prevMonth\":\"Previous month\",\"nextMonth\":\"Next month\",\"timeSeperator\":\":\",\"am\":\"AM\",\"pm\":\"PM\",\"done\":\"Done\"}");

/***/ }),

/***/ 3:
/***/ (function(module) {

"use strict";
module.exports = JSON.parse("{\"newValue\":\"Enter new value\",\"done\":\"Done\",\"cancel\":\"Cancel\"}");

/***/ }),

/***/ 839:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var map = {
	"./en.js": 24,
	"./en/zeta.ui.datepicker.json": 935,
	"./en/zeta.ui.keyword.json": 3
};
var fakeMap = {
	"3": 1,
	"24": 9,
	"935": 1
};

function webpackAsyncContext(req) {
	return webpackAsyncContextResolve(req).then(function(id) {
		return __webpack_require__.t(id, fakeMap[id])
	});
}
function webpackAsyncContextResolve(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		if(!__webpack_require__.o(map, req)) {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		}
		return map[req];
	});
}
webpackAsyncContext.keys = function() { return Object.keys(map); };
webpackAsyncContext.resolve = webpackAsyncContextResolve;
webpackAsyncContext.id = 839;
module.exports = webpackAsyncContext;

/***/ }),

/***/ 602:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(765);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



function ArgumentIterator(args) {
  this.value = null;
  this.args = args;
  this.done = !args.length;
}

(0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .definePrototype */ .r9)(ArgumentIterator, {
  next: function next(type) {
    // @ts-ignore: type inference issue
    var arr = this.args;

    if (type === 'object' ? (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .isPlainObject */ .PO)(arr[0]) : typeof type === 'string' ? _typeof(arr[0]) === type : (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__.is)(arr[0], type)) {
      this.value = arr.shift();
      this.done = !arr.length;
      return true;
    }
  },
  nextAll: function nextAll(type) {
    var arr = [];

    while (this.next(type) && arr.push(this.value)) {
      ;
    }

    return arr;
  },
  fn: function fn() {
    // @ts-ignore: type inference issue
    return this.next('function') && this.value;
  },
  string: function string() {
    // @ts-ignore: type inference issue
    return this.next('string') && this.value;
  }
});
/* harmony default export */ __webpack_exports__["Z"] = (ArgumentIterator);

/***/ }),

/***/ 259:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "kr": function() { return /* binding */ createContext; },
  "ZP": function() { return /* binding */ core_UIControl; },
  "nj": function() { return /* binding */ emitPropertyChange; },
  "F2": function() { return /* binding */ emitStateChange; },
  "AO": function() { return /* binding */ exportControls; },
  "W2": function() { return /* binding */ foreachControl; },
  "nu": function() { return /* binding */ hasRole; },
  "Yi": function() { return /* binding */ setEventHandlers; }
});

// UNUSED EXPORTS: defineInheritedProperty, emitEvent

// EXTERNAL MODULE: ./build/include/zeta-dom/dom.js
var dom = __webpack_require__(358);
// EXTERNAL MODULE: ./build/include/external/jquery.js
var jquery = __webpack_require__(571);
// EXTERNAL MODULE: ./build/include/zeta-dom/domLock.js
var domLock = __webpack_require__(605);
// EXTERNAL MODULE: ./build/include/zeta-dom/domUtil.js
var domUtil = __webpack_require__(501);
// EXTERNAL MODULE: external {"commonjs":"zeta-dom","commonjs2":"zeta-dom","amd":"zeta-dom","root":"zeta"}
var external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_ = __webpack_require__(163);
;// CONCATENATED MODULE: ./build/include/zeta-dom/events.js

var ZetaEventContainer = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.EventContainer;

// EXTERNAL MODULE: ./build/include/zeta-dom/util.js
var util = __webpack_require__(765);
// EXTERNAL MODULE: ./build/util/common.js
var common = __webpack_require__(400);
// EXTERNAL MODULE: ./build/core/flags.js
var flags = __webpack_require__(927);
// EXTERNAL MODULE: ./build/include/external/waterpipe.js
var waterpipe = __webpack_require__(551);
;// CONCATENATED MODULE: ./build/core/DisplayValue.js



/**
 * @param {DisplayValue} self
 * @param {ZetaUI.UIControl} control
 * @param {string} prop
 * @param {boolean=} fireEvent
 */

function _getValue(self, control, prop, fireEvent) {
  if (self.needEvaluate) {
    var value = waterpipe(self.displayValue, control.getTemplateContext(true));

    if (fireEvent !== false && value !== self.lastValue) {
      emitPropertyChange(control, prop, self.lastValue, value);
    }

    self.lastValue = value;
    return value;
  }

  return self.displayValue;
}
/**
 * @param {ZetaUI.UIControl} control
 * @param {string} prop
 * @param {any} rawValue
 * @param {any} displayValue
 * @param {boolean=} needEvaluate
 * @param {boolean=} fireEvent
 */


function DisplayValue(control, prop, rawValue, displayValue, needEvaluate, fireEvent) {
  var self = this;
  self.rawValue = rawValue;
  self.displayValue = displayValue;
  self.lastValue = displayValue;
  self.needEvaluate = needEvaluate;

  _getValue(self, control, prop, fireEvent);
}

(0,util/* definePrototype */.r9)(DisplayValue, {
  getValue: function getValue(control, prop, fireEvent) {
    // @ts-ignore: type inference issue
    return _getValue(this, control, prop, fireEvent);
  }
});
/* harmony default export */ var core_DisplayValue = (DisplayValue);
;// CONCATENATED MODULE: ./build/core/UIContext.js



/** @type {Zeta.PrivateStore<UIContext, (a: UIContext) => Internal.UIEventContainer>} */

var _ = (0,util/* createPrivateStore */.D8)();
/** @class */


function UIContext(getContainer, values) {
  (0,util/* extend */.l7)(this, values);

  _(this, getContainer);
}

(0,util/* definePrototype */.r9)(UIContext, {
  toJSON: function toJSON() {
    return (0,util/* extend */.l7)({}, this);
  },
  update: function update(values) {
    var container = _(this)(this);

    (0,util/* extend */.l7)(this, values);
    (0,util/* each */.S6)(container.toolsetStates, function (i, v) {
      (0,flags/* clearFlag */.R0)(v, flags/* FLAG_ENABLED */.Hc);
      container.emitAsync('contextChange', v);
    });
    foreachControl(container.control, function (v) {
      (0,flags/* clearFlag */.R0)(v, flags/* FLAG_ENABLED */.Hc | flags/* FLAG_ACTIVE */.By | flags/* FLAG_VISIBLE */.nM);

      if (!(0,flags/* isDisabledByToolset */.j1)(v)) {
        container.emitAsync('contextChange', v);
      }
    });
    container.flushEvents();
  },
  validate: function validate() {
    return _(this)(this).control.validate();
  },
  reset: function reset() {
    _(this)(this).control.reset();
  }
});
/* harmony default export */ var core_UIContext = (UIContext);
;// CONCATENATED MODULE: ./build/core/UIToolsetState.js



var UIToolsetState_ = (0,util/* createPrivateStore */.D8)();
/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIToolsetState>) => void} */


function UIToolsetState(container, toolset, context) {
  var self = this;

  var state = UIToolsetState_(self, {
    container: container,
    options: toolset.options
  });

  (0,flags/* initFlagState */.n2)(self, state);
  self.name = toolset.name;
  self.context = context;
  self.all = {}; // @ts-ignore: type inference issue

  container.add(self, (0,util/* pick */.ei)(toolset.options, util/* isFunction */.mf));
  container.emitAsync('contextChange', self);
}

(0,util/* definePrototype */.r9)(UIToolsetState, {
  get enabled() {
    return (0,flags/* isEnabled */._k)(this);
  },

  set enabled(value) {
    (0,flags/* setFlag */.mB)(this, flags/* FLAG_ENABLED */.Hc, value);
  },

  on: function on(event, handler) {
    return UIToolsetState_(this).container.add(this, event, handler);
  }
});
/* harmony default export */ var core_UIToolsetState = (UIToolsetState);
// EXTERNAL MODULE: ./build/globalContext.js
var globalContext = __webpack_require__(451);
;// CONCATENATED MODULE: ./build/core/UIControl.js












var CONST_PROPS = 'element name type parent all controls context previousSibling nextSibling';
var RE_PIPE = /\{\{((?:[^\}]|\}(?!\}))+)\}\}/;
var speciesMap = new WeakMap();
var executingControls = new Set();
var importedControls = new Map();
var exportedControls = {};
var inheritedValues = {};
var eventHandlers = {};
var unhandlaebleOption = Object.freeze({
  handleable: false
});
/** @type {Zeta.PrivateStore<ZetaUI.UIControl, Internal.UIControlState> & Zeta.PrivateStore<UIContext, Internal.UIEventContainer>} */
// @ts-ignore: type inference issue

var UIControl_ = (0,util/* createPrivateStore */.D8)();

var invalidElements;
/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function getUniqueName(all, name) {
  for (var i = 0; all[name + (i || '')]; i++) {
    ;
  }

  return name + (i || '');
}
/**
 * @param {string} type
 * @param {string | object} event
 * @param {Zeta.AnyFunction=} handler
 */


function setEventHandlers(type, event, handler) {
  eventHandlers[type] = (0,util/* isPlainObject */.PO)(event) || (0,util.kv)(event, handler);
}
/**
 * @param {Element} element
 * @param {UIContext} context
 * @returns {Internal.UIEventContainer}
 */


function createEventContainer(element, context) {
  /** @type {Internal.UIEventContainer} */
  // @ts-ignore: type inference issue
  var container = new ZetaEventContainer(element, context, {
    captureDOMEvents: true,
    normalizeTouchEvents: true
  });
  container.tap(function (e) {
    var control; // @ts-ignore: type inference issue

    for (var cur = e.target; !control && cur && cur !== element; cur = cur.parentNode) {
      control = container.getContexts(cur)[0];
    }

    if (control && (0,flags/* isEnabled */._k)(control)) {
      container.emit(e, e.target === element ? control.element : undefined);

      if ((0,util/* matchWord */.fg)(e.type, 'focusin focusout')) {
        // @ts-ignore: internal update read-only property
        control.focusedBy = e.source;
        emitStateChange(control);
      } else if ((0,util/* matchWord */.fg)(e.type, 'asyncStart asyncEnd')) {
        foreachControl(control, function (v) {
          emitStateChange(v);
        });
      }
    }
  });
  return container;
}
/**
 * @param {Zeta.PrivateStore<ZetaUI.UIControlSpecies, Internal.UIControlSpeciesSpec>} getSpeciesSpec
 * @param {ZetaUI.UIControlSpecies} species
 * @param {ZetaUI.UIControlRenderer} renderer,
 * @param {HTMLElement} element
 * @param {*} values
 */


function createContext(getSpeciesSpec, species, renderer, element, values) {
  var context = new core_UIContext(UIControl_, values);
  var parentContext = dom/* default.context */.ZP.context;
  var parentElement = null;
  var parentControl = (0,util/* any */.Yj)(executingControls, function (v) {
    return dom/* default.focused */.ZP.focused(v.element);
  });

  if (parentControl) {
    parentContext = parentControl.context;
    parentElement = parentControl.element;
  } else if ((0,util.is)(parentContext, core_UIContext)) {
    var parentContainer = UIControl_(parentContext); // @ts-ignore: type inference issue


    parentElement = parentContainer.event && parentContainer.event.context.element;
  }

  jquery(element).addClass('zui-root');
  var container = createEventContainer(element, context);
  (0,util/* extend */.l7)(container, {
    toolset: getSpeciesSpec(species).toolset,
    toolsetStates: new Map(),
    parentContext: parentContext,
    parentElement: parentElement,
    getSpeciesSpec: getSpeciesSpec,
    renderer: renderer
  });

  UIControl_(context, container);

  appendControls(container, null, [species], true);
  container.flushEvents();
  return container.context;
}
/**
 * @param {ZetaUI.UIControl} control
 */


function createInnerContext(control) {
  var state = UIControl_(control);

  if (!(0,util.is)(state.childContext, core_UIContext)) {
    var context = new core_UIContext(UIControl_);

    if (!('value' in state.options)) {
      state.value = context;
      (0,util/* defineGetterProperty */.Hl)(control.context, control.name, function () {
        return context;
      }, function (value) {
        var oldValue = (0,util/* extend */.l7)({}, context);
        emitPropertyChange(control, 'value', oldValue, (0,util/* extend */.l7)(context, value));
      });
    }

    state.childContext = context;
  }

  return state.childContext;
}
/**
 * @param {Internal.UIEventContainer} container
 * @param {ZetaUI.UIControl | null} parent
 * @param {ZetaUI.UIControlSpecies[]} species
 * @param {boolean=} allowExport
 * @param {any=} options
 */


function appendControls(container, parent, species, allowExport, options) {
  (0,util/* each */.S6)(species, function (i, v) {
    var spec = container.getSpeciesSpec(v);

    if (spec.type === 'import') {
      (0,util/* mapGet */.LX)(importedControls, parent, Object)[spec.name] = true;
      appendControls(container, parent, exportedControls[spec.name] || [], true, spec.options);
    } else {
      var control = new spec.ctor(container, v, parent, allowExport, options);
      container.renderer.append(control, parent || container, true);
      appendControls(container, control, (0,util/* makeArray */.VL)(spec.options.controls));
      emitStateChange(control);

      if (!parent) {
        // @ts-ignore: internal update read-only property
        container.control = control;
      }
    }
  });

  if (parent && species[0]) {
    if (parent.controls[1]) {
      var defaultOrder = new Map();
      (0,util/* each */.S6)(parent.controls, function (i, v) {
        defaultOrder.set(v, i);
      });
      parent.controls.sort(function (a, b) {
        function m(a, b, prop, mult) {
          return !a[prop] ? 0 : a[prop] === '*' || (0,util/* matchWord */.fg)(b.name, a[prop]) ? mult : -mult;
        }

        var a1 = m(a, b, 'after', 1);
        var a2 = m(a, b, 'before', -1);
        var b1 = m(b, a, 'after', -1);
        var b2 = m(b, a, 'before', 1);

        if ((0,util/* either */.wE)(!a1 && !a2, !b1 && !b2)) {
          return a1 || a2 || b1 || b2;
        }

        return a1 + a2 + b1 + b2 || defaultOrder.get(a) - defaultOrder.get(b);
      });
    }

    emitStateChange(parent);
  }
}

function foreachControl(control, callback, enabledOnly) {
  if (!enabledOnly || (0,flags/* isEnabled */._k)(control)) {
    callback(control);
    (0,util/* each */.S6)(control.controls, function (i, v) {
      foreachControl(v, callback, enabledOnly);
    });
  }
}
/**
 * @param {ZetaUI.UIControl} control
 */


function setInitial(control) {
  var state = UIControl_(control);

  var values = state.initialValues;
  (0,util/* each */.S6)(Object.getOwnPropertyNames(control), function (i, v) {
    if (!(0,util/* matchWord */.fg)(v, CONST_PROPS)) {
      values[v] = control[v];
    }
  });
  (0,common/* copy */.JG)(values, state.values);
  (0,util/* defineHiddenProperty */.c)(values, 'value', state.value);
}
/**
 * @param {ZetaUI.UIControl} control
 * @param {*} newValue
 * @param {boolean=} suppressEvent
 */


function _setValue(control, newValue, suppressEvent) {
  var state = UIControl_(control);

  if (!state.inited) {
    state.value = newValue;
    return true;
  }

  if (!state.inited2) {
    emitEvent(control, 'init', null, unhandlaebleOption);
  }

  var oldValue = state.value;

  if (oldValue === newValue) {
    return false;
  }

  var currentEvent = state.container.event;
  var promise = (!currentEvent || currentEvent.type !== 'setValue' || currentEvent.context !== control) && emitEvent(control, 'setValue', {
    oldValue: oldValue,
    newValue: newValue
  });

  if (promise) {
    return state.value !== oldValue;
  }

  state.value = newValue;

  if (!suppressEvent) {
    emitPropertyChange(control, 'value', oldValue, newValue);

    if (control.errors || control.validateOnSetValue) {
      validate(control);
    }
  }

  return true;
}
/**
 * @param {ZetaUI.UIControl} control
 */


function validate(control) {
  var result;

  if ((0,flags/* isEnabled */._k)(control)) {
    if (control.required && !control.value) {
      result = (0,util/* reject */.d1)('required');
    } else {
      result = emitEvent(control, 'validate');
    }
  }

  if (result) {
    result.then(function () {
      control.errors = null;
    }, function (errors) {
      if ((0,util/* isPlainObject */.PO)(errors)) {
        control.errors = errors;
      } else {
        var obj = {};
        (0,util/* each */.S6)((0,util/* makeArray */.VL)(errors), function (i, v) {
          obj[v] = v;
        });
        control.errors = obj;
      }
    });
    return result;
  }

  control.errors = null;
}
/**
 * @param {ZetaUI.UIControl} control
 */


function validateAll(control) {
  var focusOnFailed = !invalidElements && !(0,util/* matchWord */.fg)(dom/* default.getEventSource */.ZP.getEventSource(control.element), 'script touch');
  var failed = invalidElements || focusOnFailed && (invalidElements = []);
  var promises = [];

  UIControl_(control).container.flushEvents();

  foreachControl(control, function (v) {
    var promise = validate(v);

    if (promise) {
      promise.catch(function () {
        if (failed && !(0,util/* any */.Yj)(failed, function (w) {
          return (0,domUtil/* containsOrEquals */.BZ)(v.element, w);
        })) {
          failed.push(v.element);
        }
      });
      promises.push(promise);
    }
  }, true);

  if (focusOnFailed) {
    invalidElements = null;
  }

  if (promises[0]) {
    var promise = (0,util/* resolveAll */.CL)(promises);
    promise.catch(function () {
      if (focusOnFailed && !(0,util/* any */.Yj)(failed, function (v) {
        return dom/* default.focused */.ZP.focused(v);
      })) {
        failed.sort(domUtil/* comparePosition */.p5);
        dom/* default.focus */.ZP.focus(failed[0]);
      }
    });
    return promise;
  }
}
/**
 * @param {ZetaUI.UIControl} control
 */


function _reset(control) {
  var state = UIControl_(control);

  var initialValues = state.initialValues;
  control.errors = null;
  (0,flags/* clearFlag */.R0)(control);

  if (initialValues) {
    // use each() instead of extend()
    // to ensure all values copied even if the value is undefined
    (0,util/* each */.S6)(initialValues, function (i, v) {
      (i in state.values ? state.values : control)[i] = v;
    });

    _setValue(control, initialValues.value, true);
  }

  emitEvent(control, 'reset', null, unhandlaebleOption);
  emitStateChange(control);
}

function getLabel(source, name) {
  var labels = source.toolset.labels;

  if (name in labels) {
    getLabel.value = String(labels[name][globalContext/* default.language */.Z.language] || labels[name].default || '');
    return true;
  }
}

getLabel.value = '';
/**
 * @param {ZetaUI.UIControl} control
 * @param {string} prop
 * @param {string} value
 * @param {boolean=} fireEvent
 */

function wrapValue(control, prop, value, fireEvent) {
  if (typeof value === 'string') {
    var state = UIControl_(control);

    var displayValue = prop !== 'icon' && (getLabel(state.container, value) || getLabel(state, value)) ? getLabel.value : value;
    var needEvaluate = RE_PIPE.test(displayValue);

    if (displayValue !== value || needEvaluate) {
      return new core_DisplayValue(control, prop, value, displayValue, needEvaluate, fireEvent);
    }
  }

  return value;
}
/**
 * @param {string | object} name
 * @param {any=} defaultValue
 */


function defineInheritedProperty(name, defaultValue) {
  (0,util/* each */.S6)((0,util/* isPlainObject */.PO)(name) || (0,util.kv)(name, defaultValue), function (i, v) {
    inheritedValues[i] = v;
    listenProperty(UIControl.prototype, i);
  });
}
/**
 * @param {ZetaUI.UIControl | null} control
 */


function getInheritProperty(control, name) {
  for (; control; control = control.parent) {
    var dict = UIControl_(control).values;

    if (name in dict) {
      return dict[name];
    }
  }

  return inheritedValues[name];
}
/**
 * @param {object} proto
 * @param {string} prop
 */


function listenProperty(proto, prop) {
  if (!(prop in proto) && !(0,util/* matchWord */.fg)(prop, CONST_PROPS)) {
    (0,util/* defineGetterProperty */.Hl)(proto, prop, function () {
      var self = this;
      var value = (0,util/* hasOwnProperty */.nr)(inheritedValues, prop) ? getInheritProperty(self, prop) : UIControl_(self).values[prop];
      return (0,util.is)(value, core_DisplayValue) ? value.lastValue : value;
    }, function (value) {
      var self = this;

      var dict = UIControl_(self).values;

      var dv = (0,util.is)(dict[prop], core_DisplayValue);

      if (value !== dict[prop] && (!dv || value !== dv.rawValue)) {
        var isInherited = (0,util/* hasOwnProperty */.nr)(inheritedValues, prop);
        var oldValue = dv ? dv.lastValue : dict[prop];

        if (isInherited && (value === null || value === undefined)) {
          delete dict[prop];
        } else {
          dict[prop] = wrapValue(self, prop, value);
        }

        var newValue = self[prop];

        if (UIControl_(self).inited) {
          emitPropertyChange(self, prop, oldValue, newValue);

          if (isInherited) {
            var notifyChildren = function notifyChildren(cur) {
              (0,util/* each */.S6)(cur.controls, function (i, v) {
                if (!(prop in UIControl_(v).values)) {
                  emitPropertyChange(v, prop, oldValue, newValue);
                  notifyChildren(v);
                }
              });
            };

            notifyChildren(self);
          }
        }
      }
    });
    (0,util/* each */.S6)((0,util/* mapGet */.LX)(speciesMap, proto), function (i, v) {
      UIControl_(v).values[prop] = wrapValue(v, prop, v[prop]);
      delete v[prop]; // need to also wrap value of initial values
      // so that it will be properly displayed after reset

      var initialValues = UIControl_(v).initialValues;

      initialValues[prop] = prop in initialValues ? wrapValue(v, prop, initialValues[prop], false) : undefined;
    });
  }
}
/**
 * @param {ZetaUI.UIControl} control
 * @param {ZetaUI.UIContext} context
 * @param {string} prop
 * @param {boolean=} isDefault
 */


function exportProperty(control, context, prop, isDefault) {
  var name = control.name + (isDefault ? '' : (0,util/* ucfirst */.Ps)(prop));

  if ((0,util/* isFunction */.mf)(control[prop])) {
    (0,util/* defineHiddenProperty */.c)(context, name, control[prop].bind(control));
  } else {
    if ((0,util/* hasOwnProperty */.nr)(context, name)) {
      control[prop] = context[name];
    }

    (0,util/* defineAliasProperty */.w$)(context, name, control, prop);
  }

  UIControl_(control).exports.push(name);
}
/**
 * @param {string} id
 */


function exportControls(id) {
  var arr = exportedControls[id] || (exportedControls[id] = []);
  var prev = arr.length;

  for (var i = 1, len = arguments.length; i < len; i++) {
    arr[arr.length] = arguments[i];
  }

  var newControls = arr.slice(prev);
  (0,util/* each */.S6)(importedControls, function (i, v) {
    if (v[id]) {
      appendControls(UIControl_(i).container, i, newControls, true, {});
    }
  });
}
/**
 * @param {Element} element
 * @param {string} role
 */


function hasRole(element, role) {
  var context = (0,util.is)(dom/* default.getEventContext */.ZP.getEventContext(element).context, core_UIContext);

  var control = context && UIControl_(context).getContexts(element)[0];

  return control && (0,util/* single */.Zr)(role, function (v) {
    // @ts-ignore
    return control.hasRole(v);
  });
}
/* --------------------------------------
 * Events
 * -------------------------------------- */


function emitEvent(control, event, data, bubble) {
  return UIControl_(control).container.emit(event, control, data, bubble);
}

function emitAsyncEvent(control, event, data, bubble, callback) {
  return UIControl_(control).container.emitAsync(event, control, data, bubble, callback);
}

function emitStateChange(control, recursive) {
  emitAsyncEvent(control, 'stateChange', null, unhandlaebleOption);

  if (recursive) {
    for (var cur = control.parent; cur && cur.requireChildControls; cur = cur.parent) {
      (0,flags/* clearFlag */.R0)(cur);
      emitAsyncEvent(cur, 'stateChange', null, unhandlaebleOption);
    }
  }
}

function emitPropertyChange(control, property, oldValue, newValue) {
  emitAsyncEvent(control, 'propertyChange', {
    oldValues: (0,util.kv)(property, oldValue),
    newValues: (0,util.kv)(property, newValue)
  }, false, function (v, a) {
    a.oldValues = (0,common/* copy */.JG)(a.oldValues, v.oldValues);
    a.newValues = (0,common/* copy */.JG)(v.newValues, a.newValues);
    return a;
  });

  var state = UIControl_(control);

  (0,util/* each */.S6)(state.values, function (i, v) {
    if (i !== property && (0,util.is)(v, core_DisplayValue) && v.needEvaluate) {
      v.getValue(control, i, true);
    }
  });
  (0,flags/* clearFlag */.R0)(control);
  emitStateChange(control, true);
}
/**
 * @param {ZetaUI.UIControl} control
 * @param {Partial<ZetaUI.UIControl>} oldValues
 * @param {Partial<ZetaUI.UIControl>} newValues
 */


function handlePropertyChange(control, oldValues, newValues) {
  var state = UIControl_(control);

  var container = state.container;

  if (oldValues.element) {
    container.delete(oldValues.element);
  }

  if (newValues.element) {
    container.add(control, 'init', function () {
      state.inited2 = true;
    });
    container.add(control, eventHandlers[control.type]);
    container.add(control, state.handlers);
    (0,util/* each */.S6)(container.renderer.getRoles(control), function (i, v) {
      if (v !== control.type && eventHandlers[v]) {
        container.add(control, eventHandlers[v]);
      }
    });
    container.add(control, 'init', function () {
      setInitial(control);
    });

    if (!oldValues.element) {
      emitAsyncEvent(control, 'init', null, unhandlaebleOption);
    }
  }
}
/* --------------------------------------
 * UIControl
 * -------------------------------------- */

/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIControl>) => void} */


function UIControl(container, species, parent, allowExport, extraOptions) {
  /** @type {ZetaUI.UIControl} */
  // @ts-ignore: type inference issue
  var self = this;
  var spec = container.getSpeciesSpec(species);
  var requireScope = !allowExport && parent && UIControl_(parent).toolset !== spec.toolset; // @ts-ignore: checked for parent

  var context = requireScope ? createInnerContext(parent) : parent && UIControl_(parent).childContext || (parent || container).context;
  var toolsetState = (0,util/* mapGet */.LX)(container.toolsetStates, spec.toolset, function () {
    // @ts-ignore: type inference issue
    return new core_UIToolsetState(container, spec.toolset, context);
  });
  var name = getUniqueName(toolsetState.all, spec.name);

  var state = UIControl_(self, {
    control: self,
    species: species,
    container: container,
    handlers: spec.handlers,
    options: spec.options,
    toolset: spec.toolset,
    toolsetState: toolsetState,
    values: {},
    initialValues: {},
    exports: []
  });

  (0,util/* watch */.YP)(self, true);
  (0,util/* watch */.YP)(self, function (e) {
    handlePropertyChange(self, e.oldValues, e.newValues);
  });
  (0,flags/* initFlagState */.n2)(self, state);
  (0,util/* mapGet */.LX)(speciesMap, Object.getPrototypeOf(self), Set).add(self);
  self.required = false;
  (0,util/* each */.S6)(spec.options, function (i, v) {
    if (!(0,util/* isFunction */.mf)(v) && !(0,util/* isFunction */.mf)(self[i])) {
      self[i] = v;
    }
  });
  (0,util/* each */.S6)(extraOptions, function (i, v) {
    if (!(0,util/* isFunction */.mf)(v) && !(0,util/* isFunction */.mf)(self[i])) {
      self[i] = v;
    }
  });

  if (self.label === undefined) {
    self.label = spec.name;
  }

  if (typeof spec.options.execute === 'string') {
    self.shortcut = dom/* default.getShortcut */.ZP.getShortcut(spec.options.execute)[0];
  }

  (0,util/* extend */.l7)(self, {
    name: name,
    type: spec.type,
    icon: self.icon || '',
    parent: parent || null,
    state: toolsetState,
    context: context,
    parentContext: container.parentContext || null,
    parentElement: container.parentElement || null,
    controls: [],
    errors: null,
    id: (0,util/* randomId */.kb)(),
    all: toolsetState.all
  });
  self.all[name] = self;

  if (parent) {
    parent.controls.push(self);

    if (allowExport && parent.all !== self.all) {
      parent.all[name] = self;
    }
  }

  if (spec.defaultExport) {
    exportProperty(self, context, spec.defaultExport, true);
  }

  (0,util/* each */.S6)(spec.options.exports, function (i, v) {
    exportProperty(self, context, v);
  });
  state.inited = true;
}

(0,util/* definePrototype */.r9)(UIControl, {
  get previousSibling() {
    var element = this.element;
    return element && UIControl_(this).container.getContexts(element.previousSibling)[0] || null;
  },

  get nextSibling() {
    var element = this.element;
    return element && UIControl_(this).container.getContexts(element.nextSibling)[0] || null;
  },

  get focused() {
    return dom/* default.focused */.ZP.focused(this.element);
  },

  get pending() {
    return dom/* default.locked */.ZP.locked(this.element);
  },

  get enabled() {
    return (0,flags/* isEnabled */._k)(this);
  },

  set enabled(value) {
    (0,flags/* setFlag */.mB)(this, flags/* FLAG_ENABLED */.Hc, value);
  },

  get active() {
    return (0,flags/* isActive */.zh)(this);
  },

  set active(value) {
    (0,flags/* setFlag */.mB)(this, flags/* FLAG_ACTIVE */.By, value);
  },

  get visible() {
    return !(0,flags/* isHidden */.xj)(this);
  },

  set visible(value) {
    (0,flags/* setFlag */.mB)(this, flags/* FLAG_VISIBLE */.nM, value);
  },

  get value() {
    return UIControl_(this).value;
  },

  /** @this {ZetaUI.UIControl} */
  set value(value) {
    _setValue(this, value);
  },

  /** @this {ZetaUI.UIControl} */
  setValue: function setValue(value) {
    return _setValue(this, value);
  },

  /** @this {ZetaUI.UIControl} */
  contains: function contains(control) {
    for (var cur = control; cur && cur !== this; cur = cur.parent) {
      ;
    }

    return !!cur;
  },

  /** @this {ZetaUI.UIControl} */
  getTemplateContext: function getTemplateContext(raw) {
    var self = this;

    var state = UIControl_(self);

    var proto = Object.getPrototypeOf(self);
    var values = {};

    if (raw) {
      var copyValue = function copyValue(prop) {
        values[prop] = self[prop];
      };

      Object.getOwnPropertyNames(self).forEach(copyValue);
      Object.getOwnPropertyNames(state.options).forEach(copyValue);
      (0,util/* extend */.l7)(values, state.values);
      values.value = state.value;
    } else {
      (0,util/* extend */.l7)(values, self);
    }

    (0,util/* each */.S6)(values, function (i) {
      if (!(i in proto) && !(0,util/* matchWord */.fg)(i, CONST_PROPS)) {
        (0,util/* defineGetterProperty */.Hl)(values, i, function () {
          listenProperty(proto, i);
          return self[i];
        });
      }
    });
    return values;
  },

  /** @this {ZetaUI.UIControl} */
  getElementForRole: function getElementForRole(role) {
    return UIControl_(this).container.renderer.getElementForRole(this, role);
  },

  /** @this {ZetaUI.UIControl} */
  hasRole: function hasRole(role) {
    return !!this.getElementForRole(role);
  },

  /** @this {ZetaUI.UIControl} */
  on: function on(event, handler) {
    return UIControl_(this).container.add(this, event, handler);
  },

  /** @this {ZetaUI.UIControl} */
  watch: function watch(prop, handler, fireInit) {
    var self = this;
    listenProperty(Object.getPrototypeOf(self), prop);

    if ((0,util/* isFunction */.mf)(handler)) {
      self.on('propertyChange', function (e) {
        if (prop in e.oldValues) {
          handler.call(self, e.newValues[prop], e.oldValues[prop], prop, self);
        }
      });

      if (fireInit) {
        handler.call(self, self[prop], null, prop, self);
      }
    }
  },

  /** @this {ZetaUI.UIControl} */
  focus: function focus() {
    if ((0,flags/* isEnabled */._k)(this)) {
      dom/* default.focus */.ZP.focus(this.element);
    }
  },

  /** @this {ZetaUI.UIControl} */
  validate: function validate() {
    return (0,util/* resolve */.DB)(validateAll(this));
  },

  /** @this {ZetaUI.UIControl} */
  execute: function execute(value) {
    var self = this;

    if (!(0,flags/* isEnabled */._k)(self) || (0,flags/* isHidden */.xj)(self) || executingControls.has(self)) {
      return (0,util/* reject */.d1)();
    }

    if (value !== undefined) {
      self.value = value;
    }

    var finish = function finish(resolved, data) {
      executingControls.delete(self);

      if (resolved) {
        emitEvent(self, 'executed', {
          data: data
        }, unhandlaebleOption);

        if (self.parent) {
          emitEvent(self.parent, 'childExecuted', {
            control: self
          }, {
            bubbles: true,
            handleable: false
          });
        }
      }

      emitEvent(self, 'afterExecute', resolved, unhandlaebleOption);
    };

    var run = function run() {
      var promise;
      emitEvent(self, 'beforeExecute', null, unhandlaebleOption);
      executingControls.add(self);

      try {
        var command = UIControl_(self).options.execute;

        if (typeof command === 'string') {
          promise = dom/* default.emit */.ZP.emit(command, self.value, true);
        } else if ((0,util/* isFunction */.mf)(command)) {
          // @ts-ignore: type inference issue
          promise = command.call(self, self);
        }
      } catch (e) {
        console.error(e);
        promise = (0,util/* reject */.d1)(e);
      }

      if (self.waitForExecution && (0,util/* isThenable */.J8)(promise)) {
        promise = (0,domLock/* lock */.dR)(self.element, promise, function () {
          return emitEvent(self, 'cancel') || (0,util/* reject */.d1)();
        });
        (0,util/* always */.Bx)(promise, finish);
        return promise;
      }

      finish(true);
      return (0,util/* resolve */.DB)();
    };

    var promise = validateAll(self);
    return promise ? promise.then(run) : run();
  },

  /** @this {ZetaUI.UIControl} */
  reset: function reset() {
    foreachControl(this, _reset);
  },

  /** @this {ZetaUI.UIControl} */
  append: function append(control, clear) {
    var self = this;

    if (clear) {
      (0,util/* each */.S6)(self.controls.slice(0), function (i, v) {
        v.destroy();
      });
    }

    appendControls(UIControl_(self).container, self, (0,util/* makeArray */.VL)(control));
  },

  /** @this {ZetaUI.UIControl} */
  destroy: function destroy() {
    var self = this;

    if (self.pending) {
      (0,domLock/* cancelLock */.Ei)(self.element, true);
    }

    (0,util/* always */.Bx)(emitEvent(self, 'beforeDestroy'), function () {
      var container = UIControl_(self).container;

      (0,util/* mapRemove */.M2)(importedControls, self);
      foreachControl(self, function (v) {
        var state = UIControl_(v);

        var species = (0,util/* mapGet */.LX)(speciesMap, Object.getPrototypeOf(v));
        delete v.all[v.name];

        if (v.parent && v.parent.all[v.name] === v) {
          delete v.parent.all[v.name];
        }

        (0,util/* each */.S6)(state.exports, function (i, w) {
          delete v.context[w];
        });
        species.delete(v);
        container.delete(self);
      });

      if (self.parent) {
        var arr = self.parent.controls;
        arr.splice(arr.indexOf(self), 1);
        container.renderer.remove(self);
        (0,flags/* clearFlag */.R0)(self.parent);
        emitStateChange(self.parent);
      } else {
        // ensure all other resources can be garbage collected
        setTimeout(function () {
          container.destroy();
        });
        (0,domUtil/* removeNode */.ZF)(container.autoDestroy ? container.element : self.element);
      }
    });
  }
});
(0,util/* defineObservableProperty */.aU)(UIControl.prototype, 'element');
(0,util/* each */.S6)('icon label errors placeholder description', function (i, v) {
  listenProperty(UIControl.prototype, v);
});
defineInheritedProperty({
  showIcon: 'auto',
  showText: true,
  hideDisabledChild: false,
  hideCalloutOnBlur: true,
  hideCalloutOnExecute: true,
  waitForExecution: true,
  enableChildren: true
});
/* harmony default export */ var core_UIControl = (UIControl);


/***/ }),

/***/ 292:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _include_external_jquery_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(571);
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(765);
/* harmony import */ var _util_common_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(400);
/* harmony import */ var _UIControl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(259);
/* harmony import */ var _UIToolset_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(449);






var _ = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .createPrivateStore */ .D8)();
/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIControlSpecies>) => void} */


function UIControlSpecies(toolset, type, baseClass, name, options) {
  var ctor = (0,_util_common_js__WEBPACK_IMPORTED_MODULE_2__/* .createNamedFunction */ .zu)((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .ucfirst */ .Ps)(name ? type + '_' + name.replace(/[^a-z0-9]+/gi, '_') : type), baseClass);
  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .definePrototype */ .r9)(ctor, baseClass);
  options = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .extend */ .l7)({}, options);
  var self = this;
  self.name = name || '';
  self.type = type;

  _(self, {
    ctor: ctor,
    toolset: toolset,
    type: type,
    name: name || options.name || type,
    options: options,
    handlers: (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .pick */ .ei)(options, _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .isFunction */ .mf),
    defaultExport: options.defaultExport || 'value' in options && 'value'
  });
}

(0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .definePrototype */ .r9)(UIControlSpecies, {
  all: function all(control) {
    var ctor = _(this).ctor;

    var arr = [];
    (0,_UIControl_js__WEBPACK_IMPORTED_MODULE_3__/* .foreachControl */ .W2)(control, function (v) {
      if ((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__.is)(v, ctor)) {
        arr[arr.length] = v;
      }
    });
    return arr;
  },
  clone: function clone(initData) {
    var clone = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .inherit */ .ED)(UIControlSpecies, this);
    var cloneData = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .extend */ .l7)({}, _(this));
    cloneData.options = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .extend */ .l7)({}, cloneData.options, initData);

    _(clone, cloneData);

    return clone;
  },
  render: function render(element, props) {
    if ((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .isPlainObject */ .PO)(element)) {
      props = element;
      element = document.createElement('div');
    } else if (typeof element === 'string') {
      element = _include_external_jquery_js__WEBPACK_IMPORTED_MODULE_0__(element)[0];
    } // @ts-ignore: type inference issue


    return (0,_UIControl_js__WEBPACK_IMPORTED_MODULE_3__/* .createContext */ .kr)(_, this, _UIToolset_js__WEBPACK_IMPORTED_MODULE_4__/* .default.defaultRenderer */ .Z.defaultRenderer, element, props);
  }
});
/* harmony default export */ __webpack_exports__["Z"] = (UIControlSpecies);

/***/ }),

/***/ 449:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(765);
/* harmony import */ var _define_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(567);
/* harmony import */ var _UIControl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(259);
/* harmony import */ var _UIControlSpecies_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(292);




var exportedLabels = {};

function addLabels(obj, language, key, value) {
  if ((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .isPlainObject */ .PO)(key)) {
    (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .each */ .S6)(key, addLabels.bind(null, obj, language));
  } else {
    var dict = obj[key] || (obj[key] = {});
    dict[language || 'default'] = value;
  }
}
/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIToolset>) => void} */


function UIToolset(name, options) {
  var self = this;
  var labels = name ? exportedLabels[name] || (exportedLabels[name] = {}) : {};
  self.name = name || '';
  self.labels = labels;
  self.options = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)({}, options);
  addLabels(labels, 'default', self.options.labels || {});
}

(0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .definePrototype */ .r9)(UIToolset, {
  use: function use() {
    return this;
  },
  on: function on(event, handler) {
    (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)(this.options, (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .isPlainObject */ .PO)(event) || (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__.kv)(event, handler));
  },
  i18n: function i18n(language, key, value) {
    addLabels(this.labels, language, key, value);
  },
  import: function _import(id, options) {
    // @ts-ignore: type inference issue
    return new _UIControlSpecies_js__WEBPACK_IMPORTED_MODULE_3__/* .default */ .Z(this, 'import', _UIControl_js__WEBPACK_IMPORTED_MODULE_2__/* .default */ .ZP, id, options || {});
  },
  export: function _export() {
    // @ts-ignore: type inference issue
    _UIControl_js__WEBPACK_IMPORTED_MODULE_2__/* .exportControls.apply */ .AO.apply(null, arguments);
  }
});
(0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)(UIToolset, {
  define: _define_js__WEBPACK_IMPORTED_MODULE_1__/* .define */ .O,
  hasRole: _UIControl_js__WEBPACK_IMPORTED_MODULE_2__/* .hasRole */ .nu,
  i18n: function i18n(toolset, language, key, value) {
    var dict = exportedLabels[toolset] || (exportedLabels[toolset] = {});
    addLabels(dict, language, key, value);
  }
});
/* harmony default export */ __webpack_exports__["Z"] = (UIToolset);

/***/ }),

/***/ 567:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": function() { return /* binding */ defineLayout; },
/* harmony export */   "O": function() { return /* binding */ define; }
/* harmony export */ });
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(765);
/* harmony import */ var _ArgumentIterator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(602);
/* harmony import */ var _renderer_default_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(89);
/* harmony import */ var _UIControl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(259);
/* harmony import */ var _UIControlSpecies_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(292);
/* harmony import */ var _UIToolset_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(449);
/* harmony import */ var _util_common_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(400);







var definedType = {};

function defineInternal(type, options) {
  if (definedType[type]) {
    throw new Error(type + ' already defined');
  }

  var specs = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)({}, options);
  var defaultOptions = {};
  var handlers = {};
  (0,_renderer_default_index_js__WEBPACK_IMPORTED_MODULE_2__/* .setDefaultTemplate */ .i)(type, specs.template || '', specs.templates);
  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .each */ .S6)(specs, function (i, v) {
    if ((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .isFunction */ .mf)(v) && i !== 'parseOptions') {
      handlers[i] = v;
    } else if (i !== 'template' && i !== 'parseOptions') {
      defaultOptions[i] = v;
      delete specs[i];
    }
  });
  specs.defaultOptions = defaultOptions;
  (0,_UIControl_js__WEBPACK_IMPORTED_MODULE_3__/* .setEventHandlers */ .Yi)(type, handlers);
  return specs;
}
/**
 * @param {string} type
 * @param {ZetaUI.UIControlTypeOptions} options
 */


function defineLayout(type, options) {
  defineInternal(type, options);
}
/**
 * @param {string} type
 * @param {ZetaUI.UIControlTypeOptions} options
 */

function define(type, options) {
  var ctor = (0,_util_common_js__WEBPACK_IMPORTED_MODULE_6__/* .createNamedFunction */ .zu)((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .ucfirst */ .Ps)(type), _UIControl_js__WEBPACK_IMPORTED_MODULE_3__/* .default */ .ZP);
  var specs = defineInternal(type, options);

  var create = function create() {
    var iter = new _ArgumentIterator_js__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .makeArray */ .VL)(arguments));
    var name = iter.string();
    var options = {};

    if (specs.parseOptions) {
      specs.parseOptions(options, iter);
    }

    (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)(options, iter.next('object') && iter.value);
    return new _UIControlSpecies_js__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z((0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__.is)(this, _UIToolset_js__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z) || new _UIToolset_js__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z(), type, ctor, name || '', (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .extend */ .l7)({}, specs.defaultOptions, options));
  };

  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .definePrototype */ .r9)(_UIToolset_js__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z, (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__.kv)(type, create));
  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .definePrototype */ .r9)(ctor, _UIControl_js__WEBPACK_IMPORTED_MODULE_3__/* .default */ .ZP);
  create.prototype = ctor.prototype;
  return create;
}

/***/ }),

/***/ 927:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hc": function() { return /* binding */ FLAG_ENABLED; },
/* harmony export */   "By": function() { return /* binding */ FLAG_ACTIVE; },
/* harmony export */   "nM": function() { return /* binding */ FLAG_VISIBLE; },
/* harmony export */   "n2": function() { return /* binding */ initFlagState; },
/* harmony export */   "R0": function() { return /* binding */ clearFlag; },
/* harmony export */   "mB": function() { return /* binding */ setFlag; },
/* harmony export */   "_k": function() { return /* binding */ isEnabled; },
/* harmony export */   "zh": function() { return /* binding */ isActive; },
/* harmony export */   "xj": function() { return /* binding */ isHidden; },
/* harmony export */   "j1": function() { return /* binding */ isDisabledByToolset; }
/* harmony export */ });
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(765);
/* harmony import */ var _UIControl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(259);


var FLAG_NAMES = 'enabled active visible'.split(' ');
var FLAG_ENABLED = 1;
var FLAG_ACTIVE = 2;
var FLAG_VISIBLE = 4;
var computeFn = [isEnabled, isActive, isHidden];

var _ = (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .createPrivateStore */ .D8)();

function initFlagState(component, state) {
  _(component, state);
}

function getFlag(control, flag, callback) {
  var state = _(control);

  var bit = state.flag;
  var cur = (bit & flag) > 0; // @ts-ignore: boolean arithmetics

  if ((state.flag |= flag << 8) !== bit && cur ^ !!callback(state)) {
    state.flag ^= flag;

    if (state.inited2) {
      (0,_UIControl_js__WEBPACK_IMPORTED_MODULE_1__/* .emitStateChange */ .F2)(control, true);
    }

    return !cur;
  }

  return cur;
}

function setFlag(control, flag, value) {
  _(control)[FLAG_NAMES[flag >> 1]] = value;
  clearFlag(control, flag);
}

function clearFlag(control, flags) {
  _(control).flag &= 0xff;

  if (flags) {
    computeFn.forEach(function (v, i) {
      return flags & 1 << i && v(control);
    });
  }
}

function isEnabled(control) {
  return getFlag(control, FLAG_ENABLED, function (state) {
    if (isDisabledByToolset(control) || !state.container.renderer.isEnabled(control)) {
      return false;
    }

    if (control.requireChildControls && (!control.controls.some(isEnabled) || control.controls.every(isHidden))) {
      return false;
    }

    return state.enabled !== false && (state.options.enabled || _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .noop */ .ZT).call(control, control) !== false;
  });
}

function isActive(control) {
  return getFlag(control, FLAG_ACTIVE, function (state) {
    return state.active || (state.options.active || _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .noop */ .ZT).call(control, control);
  });
}

function isHidden(control) {
  return getFlag(control, FLAG_VISIBLE, function (state) {
    if (isDisabledByToolset(control)) {
      return true;
    }

    if (!isEnabled(control)) {
      var hiddenWhenDisabled = control.hiddenWhenDisabled;

      if (hiddenWhenDisabled || hiddenWhenDisabled !== false && control.parent && control.parent.hideDisabledChild) {
        return true;
      }
    }

    return state.visible === false || (state.options.visible || _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_0__/* .noop */ .ZT).call(control, control) === false;
  });
}

function isDisabledByToolset(control) {
  return getFlag(control, 8, function (state) {
    var toolsetState = state.toolsetState;
    return toolsetState && (isEnabled(toolsetState) === false || control.realm && !toolsetState[control.realm]);
  });
}



/***/ }),

/***/ 594:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ entry; }
});

// EXTERNAL MODULE: external {"commonjs":"zeta-dom","commonjs2":"zeta-dom","amd":"zeta-dom","root":"zeta"}
var external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_ = __webpack_require__(163);
;// CONCATENATED MODULE: ./build/include/zeta-dom/index.js

var _defaultExport = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_;
/* harmony default export */ var zeta_dom = (_defaultExport);
// EXTERNAL MODULE: ./build/index.js
var build = __webpack_require__(655);
// EXTERNAL MODULE: ./build/include/zeta-dom/util.js
var util = __webpack_require__(765);
// EXTERNAL MODULE: ./build/include/external/jquery.js
var jquery = __webpack_require__(571);
// EXTERNAL MODULE: ./build/include/zeta-dom/domUtil.js
var domUtil = __webpack_require__(501);
;// CONCATENATED MODULE: ./build/util/cssUtil.js



var FLIP_POS = {
  top: 'bottom',
  left: 'right',
  right: 'left',
  bottom: 'top'
};
var DIR_SIGN = {
  top: -1,
  left: -1,
  right: 1,
  bottom: 1
};
var root = document.documentElement;
var snaps = new Map();

function cssFromPoint(x, y, origin, parent) {
  var refRect = (0,domUtil/* getRect */.Dz)((0,util.is)(parent || origin, Node) || window);
  var dirX = (0,util/* matchWord */.fg)(origin || y, 'left right') || 'left';
  var dirY = (0,util/* matchWord */.fg)(origin || y, 'top bottom') || 'top';
  var style = {};
  y = ((x.top || x.clientY || x.y || y) | 0) - refRect.top;
  x = ((x.left || x.clientX || x.x || x) | 0) - refRect.left;
  style[dirX] = (dirX === 'left' ? x : refRect.width - x) + 'px';
  style[dirY] = (dirY === 'top' ? y : refRect.height - y) + 'px';
  style[FLIP_POS[dirX]] = 'auto';
  style[FLIP_POS[dirY]] = 'auto';
  return style;
}

function position(element, to, dir, within, offset) {
  if (!(0,domUtil/* containsOrEquals */.BZ)(root, element)) {
    document.body.appendChild(element);
  }

  jquery(element).css({
    position: 'fixed',
    maxWidth: '',
    maxHeight: ''
  });
  var oDirX = (0,util/* matchWord */.fg)(dir, 'left right center') || 'left';
  var oDirY = (0,util/* matchWord */.fg)(dir, 'top bottom center') || 'bottom';
  var inset = (0,util/* matchWord */.fg)(dir, 'inset-x inset-y inset') || (FLIP_POS[oDirY] ? 'inset-x' : 'inset-y');
  var refRect = (0,util/* isPlainObject */.PO)(to) || !to ? (0,domUtil/* toPlainRect */.Nj)((to.left || to.clientX || to.x) | 0, (to.right || to.clientY || to.y) | 0) : (0,domUtil/* getRect */.Dz)(to);

  if (offset && inset !== 'inset') {
    refRect = inset === 'inset-x' ? refRect.expand(0, offset) : refRect.expand(offset, 0);
  }

  var winRect = inset === 'inset' ? refRect.expand(-offset) : (0,domUtil/* getRect */.Dz)(within);
  var elmRect = (0,domUtil/* getRect */.Dz)(element, true);
  var margin = {};
  var point = {};
  var style = {
    transform: ''
  };

  var fn = function fn(dir, inset, p, pSize, pMax, sTransform) {
    style[pMax] = winRect[pSize] + margin[p] - margin[FLIP_POS[p]] - offset;

    if (!FLIP_POS[dir]) {
      var center = (refRect[FLIP_POS[p]] + refRect[p]) / 2;
      dir = center - winRect[p] < elmRect[pSize] / 2 ? p : winRect[FLIP_POS[p]] - center < elmRect[pSize] / 2 ? FLIP_POS[p] : '';

      if (!dir) {
        style.transform += ' ' + sTransform;
      }

      point[p] = dir ? winRect[dir] : center + margin[p];
      return dir;
    } // determine cases of 'normal', 'flip' and 'fit' by available rooms


    var rDir = inset ? FLIP_POS[dir] : dir;

    if (refRect[dir] * DIR_SIGN[rDir] + elmRect[pSize] <= winRect[rDir] * DIR_SIGN[rDir]) {
      point[p] = refRect[dir] + margin[FLIP_POS[rDir]];
    } else if (refRect[FLIP_POS[dir]] * DIR_SIGN[rDir] - elmRect[pSize] > winRect[FLIP_POS[rDir]] * DIR_SIGN[rDir]) {
      dir = FLIP_POS[dir];
      point[p] = refRect[dir] + margin[rDir];
    } else {
      point[p] = winRect[dir];
      style[pMax] = inset ? style[pMax] : Math.abs(refRect[dir] - point[p]) - DIR_SIGN[dir] * margin[dir];
      return dir;
    }

    if (!inset) {
      dir = FLIP_POS[dir];
    }

    style[pMax] = Math.abs(winRect[FLIP_POS[dir]] - point[p]);
    return dir;
  };

  var elmRectNoMargin = (0,domUtil/* getRect */.Dz)(element);
  (0,util/* keys */.XP)(FLIP_POS).forEach(function (v) {
    margin[v] = elmRect[v] - elmRectNoMargin[v];
  });
  var dirX = fn(oDirX, FLIP_POS[oDirY] && inset === 'inset-x', 'left', 'width', 'maxWidth', 'translateX(-50%)');
  var dirY = fn(oDirY, FLIP_POS[oDirX] && inset === 'inset-y', 'top', 'height', 'maxHeight', 'translateY(-50%)');
  jquery(element).css((0,util/* extend */.l7)(style, cssFromPoint(point, dirX + ' ' + dirY)));
}

function snapToElement(element, options) {
  if ((0,domUtil/* isVisible */.pn)(element) && (options.to === window || (0,domUtil/* isVisible */.pn)(options.to))) {
    var dir = options.dir;

    if (dir === 'auto') {
      if (options.to === window) {
        dir = 'center inset';
      } else {
        var scrollParent = (0,domUtil/* getScrollParent */.rP)(options.to);
        var winRect = (0,domUtil/* getRect */.Dz)();
        var rect = (0,domUtil/* getRect */.Dz)(scrollParent === root ? options.to : root);
        var area = [winRect.height * (rect.left - winRect.left), winRect.height * (winRect.right - rect.right), winRect.width * (rect.top - winRect.top), winRect.width * (winRect.bottom - rect.bottom)];
        dir = 'left right top bottom'.split(' ')[area.indexOf(Math.max.apply(null, area))] + ' center';
      }
    }

    position(element, options.to, dir, window, options.margin);
  }
}

function snap(element, to, dir, margin) {
  to = to || root;
  var prop = {
    to: to,
    dir: dir || 'left bottom',
    margin: margin || 0
  };
  snaps.set(element, prop);

  if (!(0,domUtil/* containsOrEquals */.BZ)(root, element)) {
    document.body.appendChild(element);
  }

  setZIndexOver(element, to === window ? document.body : to);
  snapToElement(element, prop);
}

function unsnap(element) {
  snaps.delete(element);
}

function getZIndex(element, pseudo) {
  var style = getComputedStyle(element, pseudo || null);
  return (0,util/* matchWord */.fg)(style.position, 'absolute fixed relative') && style.zIndex !== 'auto' ? parseInt(style.zIndex) : -1;
}

function getZIndexOver(over) {
  var maxZIndex = -1;
  var iterator = (0,domUtil/* createTreeWalker */.Xd)(document.body, 1, function (v) {
    if ((0,domUtil/* comparePosition */.p5)(v, over, true)) {
      return 2;
    }

    var zIndex = getZIndex(v);

    if (zIndex >= 0) {
      maxZIndex = Math.max(maxZIndex, zIndex);
      return 2;
    }

    maxZIndex = Math.max(maxZIndex, getZIndex(v, '::before'), getZIndex(v, '::after'));
    return 1;
  });
  (0,domUtil/* iterateNode */.Jn)(iterator);
  return maxZIndex + 1;
}

function setZIndexOver(element, over) {
  element.style.zIndex = getZIndexOver(over);

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
}

function updateSnaps() {
  (0,util/* each */.S6)(snaps, snapToElement);
}

(0,domUtil/* bind */.ak)(window, 'resize scroll orientationchange mousemove wheel keyup touchend transitionend', function () {
  (0,util/* setTimeoutOnce */.ww)(updateSnaps);
}, {
  passive: true
});

// EXTERNAL MODULE: ./build/core/ArgumentIterator.js
var ArgumentIterator = __webpack_require__(602);
// EXTERNAL MODULE: ./build/core/UIToolset.js
var UIToolset = __webpack_require__(449);
// EXTERNAL MODULE: ./build/include/zeta-dom/dom.js
var dom = __webpack_require__(358);
// EXTERNAL MODULE: ./build/core/define.js
var define = __webpack_require__(567);
// EXTERNAL MODULE: ./build/core/UIControlSpecies.js
var UIControlSpecies = __webpack_require__(292);
;// CONCATENATED MODULE: ./build/util/defineUtil.js


function parseExecute(options, iter) {
  options.execute = iter.fn();
}
function parseControlsAndExecute(options, iter) {
  options.controls = iter.nextAll(UIControlSpecies/* default */.Z);
  parseExecute(options, iter);
}
function parseIconAndExecute(options, iter) {
  options.icon = iter.string();
  parseExecute(options, iter);
}
/**
 * @param {Zeta.ZetaEvent & ZetaUI.UIEventContext} e
 * @param {string} role
 */

function shouldExecuteOnClick(e, role) {
  var elm = e.context.getElementForRole(role);
  return elm && (0,domUtil/* containsOrEquals */.BZ)(elm, e.target);
}
// EXTERNAL MODULE: ./build/include/zeta-dom/cssUtil.js
var cssUtil = __webpack_require__(548);
;// CONCATENATED MODULE: ./build/Overlay.js



function getOverlayElement(self) {
  return self.getElementForRole('overlay') || self.element;
}

(0,define/* defineLayout */.a)('overlay', {
  init: function init(e, self) {
    var target = getOverlayElement(self);
    (0,cssUtil/* runCSSTransition */.Yr)(target, 'open');
  },
  focusreturn: function focusreturn(e, self) {
    var target = getOverlayElement(self);
    (0,cssUtil/* runCSSTransition */.Yr)(target, 'pop', true);
  },
  beforeDestroy: function beforeDestroy(e, self) {
    var target = getOverlayElement(self);
    return (0,cssUtil/* runCSSTransition */.Yr)(target, 'closing');
  }
});
/* harmony default export */ var Overlay = (null);
;// CONCATENATED MODULE: ./build/Dialog.js







function closeDialog(e, self) {
  self.destroy();
}

var Dialog = (0,define/* define */.O)('dialog', {
  template: '<div class="zui-root"><z:overlay class="zui-float zui-dialog-inner"><div class="zui-dialog-content"><h2>{{title}}</h2><z:form><p>{{description}}</p><controls></controls></z:form></div><div class="zui-dialog-error error hidden:{{not errorMessage}}">{{errorMessage}}</div><controls of="type == buttonset"/></z:overlay></div>',
  templates: {
    buttonset: '<z:buttonset class="zui-dialog-buttonset"><controls of="danger" show-text="true"></controls><div class="zui-buttonset-pad"></div><controls show-text="true"></controls></z:buttonset>'
  },
  pinnable: true,
  modal: true,
  title: '',
  description: '',
  errorMessage: '',
  parseOptions: parseControlsAndExecute,
  init: function init(e, self) {
    var element = self.element;
    var parentElement = self.parentElement;
    var snapTo = parentElement && self.pinnable && screen.availWidth >= 600 && screen.availHeight >= 600 && UIToolset/* default.hasRole */.Z.hasRole(parentElement, 'button buttonlike') ? parentElement : window;
    document.body.appendChild(element);

    if (parentElement) {
      dom/* default.retainFocus */.ZP.retainFocus(parentElement, element);
    }

    if (self.modal) {
      dom/* default.setModal */.ZP.setModal(element);
    }

    snap(element, snapTo, 'auto', 10);
    setZIndexOver(element, parentElement || document.activeElement);
    setTimeout(function () {
      dom/* default.focus */.ZP.focus(element);
    });
  },
  error: function error(e, self) {
    self.errorMessage = (e.error || '').message || e.error || '';
    e.handled();
  },
  focusout: closeDialog,
  escape: closeDialog,
  afterExecute: function afterExecute(e, self) {
    if (e.data) {
      if (self.pending) {
        self.on('asyncEnd', function () {
          closeDialog(e, self);
        });
      } else {
        closeDialog(e, self);
      }
    }
  },
  enter: function enter(e, self) {
    return self.execute();
  }
});
/* harmony default export */ var build_Dialog = (Dialog);
;// CONCATENATED MODULE: ./build/Label.js

var T_SHOWICON = '[ @global.showIcon ?? showIcon ]';
var T_SHOWTEXT = '[ @global.showText ?? showText ]';
var T_ICON = '[ @global.icon ?? icon ]';
var Label = (0,define/* define */.O)('label', {
  template: '<span class="hidden:{{[ ! ' + T_SHOWICON + ' || ! ' + T_ICON + ' ] && ! ' + T_SHOWTEXT + '}}" title="{{tooltip || label}}"><i class="material-icons hidden:{{[ ! ' + T_ICON + ' && ' + T_SHOWICON + ' != true ] || ! ' + T_SHOWICON + '}}">{{' + T_ICON + '}}</i>{{? ' + T_SHOWTEXT + ' [ @global.label ?? label ] ""}}</span>',
  showIcon: 'auto',
  showText: true,
  defaultExport: 'label'
});
/* harmony default export */ var build_Label = (Label);
;// CONCATENATED MODULE: ./build/Button.js




function executeButton(e, self) {
  if (e.type !== 'click' || shouldExecuteOnClick(e, 'button')) {
    return self.execute();
  }
}

var Button = (0,define/* define */.O)('button', {
  template: '<button class="danger:{{danger}}"><z:label></z:label><children/></button>',
  danger: false,
  defaultExport: 'execute',
  parseOptions: parseIconAndExecute,
  enter: executeButton,
  click: executeButton
});
/* harmony default export */ var build_Button = (Button);
;// CONCATENATED MODULE: ./build/SubmitButton.js


var SubmitButton = (0,define/* define */.O)('submit', {
  template: '<z:button/>',
  defaultExport: 'execute',
  parseOptions: function parseOptions(options, iter) {
    options.icon = iter.string();

    options.execute = function (self) {
      for (var cur = self; cur && !cur.hasRole('form'); cur = cur.parent) {
        ;
      }

      return cur && cur.execute();
    };
  }
});
/* harmony default export */ var build_SubmitButton = (SubmitButton);
;// CONCATENATED MODULE: ./build/ButtonSet.js


var ButtonSet = (0,define/* define */.O)('buttonset', {
  templates: {
    textbox: '<z:textbox show-placeholder="auto"/>'
  },
  requireChildControls: true,
  hiddenWhenDisabled: true,
  parseOptions: parseControlsAndExecute
});
/* harmony default export */ var build_ButtonSet = (ButtonSet);
;// CONCATENATED MODULE: ./build/Generic.js


var GenericComponent = (0,define/* define */.O)('generic', {
  parseOptions: parseControlsAndExecute
});
/* harmony default export */ var Generic = (GenericComponent);
// EXTERNAL MODULE: ./build/include/external/zeta-editor.js
var zeta_editor = __webpack_require__(372);
;// CONCATENATED MODULE: ./build/renderer/default/contenteditable.js




function _setValue(control, value) {
  var editor = control.editor;

  if (!editor) {
    return;
  }

  if (!editor.focused(true) && value !== editor.getValue()) {
    editor.setValue(value);
  }

  control.setValue(editor.getValue());
}

(0,define/* defineLayout */.a)('contenteditable', {
  template: '<div class="zui-editable" contenteditable spellcheck="{{spellcheck}}"></div>',
  init: function init(e, self) {
    var target = self.getElementForRole('contenteditable') || self.element;
    self.editor = new zeta_editor.Editor(target, self.editorOptions);
    self.editor.enable('stateclass', {
      target: self.element,
      focused: ''
    });
    self.editor.on('contentChange', function () {
      if (self.setValue(self.editor.getValue())) {
        self.execute();
      }
    });

    _setValue(self, self.value);
  },
  stateChange: function stateChange(e, self) {
    if ((0,util/* either */.wE)(self.editor.enabled(), self.enabled)) {
      self.editor[self.enabled ? 'enable' : 'disable']();
    }
  },
  focusin: function focusin(e, self) {
    if (!self.editor.focused()) {
      self.editor.focus();
    }
  },
  setValue: function setValue(e, self) {
    _setValue(self, e.newValue);

    e.handled();
  },
  validate: function validate(e, self) {
    return self.editor.validate();
  }
});
/* harmony default export */ var contenteditable = (null);
;// CONCATENATED MODULE: ./build/TextBoxLike.js



(0,define/* defineLayout */.a)('textboxlike', {
  template: '<label class="zui-textbox keep-placeholder:{{showPlaceholder == always && ! $placeholder}}"><z:label show-text="false" show-icon="auto"></z:label><div class="zui-textbox-wrapper" data-label="{{? $placeholder label}}"><div class="zui-textbox-inner"><children></children><div class="zui-textbox-placeholder">{{placeholder || label}}</div></div><div class="zui-textbox-error"></div><div class="zui-textbox-clear"></div></div></label>',
  click: function click(e, self) {
    if ((0,domUtil/* matchSelector */.oN)(e.target, '.zui-textbox-clear')) {
      self.execute('');
      self.editor.focus();
    }
  }
});
/* harmony default export */ var TextBoxLike = (null);
;// CONCATENATED MODULE: ./build/TextBox.js





var PRESET_KEY = '__preset__';
var DEFAULT_PRESET = {
  overrides: {
    getValue: function getValue() {
      return this.extractText();
    }
  }
};

function initOptions(preset, options) {
  var presetDefinition = {};
  var originalInit = (options || '').init;
  options = (0,util/* extend */.l7)({
    inline: true,
    defaultOptions: false,
    disallowedElement: '*'
  }, (0,util.kv)(PRESET_KEY, (0,util/* extend */.l7)({}, options)));
  (0,util/* each */.S6)(preset, function (i, v) {
    ((0,util/* isFunction */.mf)(v) || i === 'options' || i === 'commands' ? presetDefinition : options)[i] = v;
  });
  (0,util/* each */.S6)(options[PRESET_KEY], function (i, v) {
    if (!presetDefinition.options || !(i in presetDefinition.options)) {
      options[i] = v;
      delete options[PRESET_KEY][i];
    }
  });
  options.widgets = (0,util/* extend */.l7)(options.widgets, (0,util.kv)(PRESET_KEY, presetDefinition));

  options.init = function (e) {
    var presetWidget = e.typer.getStaticWidget(PRESET_KEY);
    (0,util/* each */.S6)(preset.overrides, function (i, v) {
      e.typer[i] = function (value) {
        return v.call(this, presetWidget, value);
      };
    });

    if ((0,util/* isFunction */.mf)(originalInit)) {
      originalInit.call(options, e);
    }
  };

  return options;
}

var TextBox = (0,define/* define */.O)('textbox', {
  template: '<z:textboxlike><z:contenteditable spellcheck="false"></z:contenteditable></z:textboxlike>',
  hideCalloutOnExecute: false,
  preventLeave: true,
  value: '',
  placeholder: '',
  parseOptions: parseExecute,
  init: function init(e, self) {
    self.editorOptions = initOptions(self.preset || DEFAULT_PRESET, self.options);
    self.watch('editor', function (editor) {
      self.options = editor.getStaticWidget(PRESET_KEY).options;
      self.editorOptions.options = (0,util/* extend */.l7)({}, self.options);
    });
  },
  reset: function reset(e, self) {
    self.options = self.editor.getStaticWidget(PRESET_KEY).options;
    (0,util/* extend */.l7)(self.options, self.editorOptions.options);
  }
});
/* harmony default export */ var build_TextBox = (TextBox);
;// CONCATENATED MODULE: ./build/promptFactory.js










var ui = new UIToolset/* default */.Z('dialog').use(build_Dialog, build_Button, build_SubmitButton, build_ButtonSet, Generic, build_TextBox);
var currentNotify;
ui.i18n('en', {
  action: 'OK',
  cancel: 'Cancel',
  leaveForm: 'There are unsubmitted information on the page. Are you sure to leave?'
});
ui.export('dialog.prompt', ui.dialog({
  preventLeave: false,
  data: null,
  exports: 'title description errorMessage data',
  controls: [ui.textbox('value', {
    hiddenWhenDisabled: true,
    exports: 'enabled label'
  }), ui.buttonset(ui.submit('action', 'done', {
    defaultExport: 'label',
    exports: 'icon'
  }), ui.button('cancel', 'close', {
    exports: 'visible',
    execute: function execute(self) {
      return self.all.dialog.destroy();
    }
  }))],
  execute: function execute(self) {
    return ((0,util/* isFunction */.mf)(self.context.callback) || util/* resolve */.DB)(self.context.value);
  }
}));
ui.export('dialog.notify', ui.generic({
  template: '<z:overlay class="zui-root zui-snackbar notify:{{kind}}"><div class="zui-float"><z:buttonset><z:label/><z:button icon="close" show-text="false" show-icon="true"/></z:buttonset></div></z:overlay>',
  data: null,
  init: function init(e, self) {
    if (currentNotify) {
      currentNotify.destroy();
    }

    (0,util/* extend */.l7)(self, self.context); // @ts-ignore: custom control property

    snap(e.target, self.within || document.body, 'top center inset'); // @ts-ignore: custom control property

    if (self.timeout) {
      setTimeout(function () {
        self.destroy(); // @ts-ignore: custom control property
      }, self.timeout);
    }

    currentNotify = self;
  },
  click: function click(e, self) {
    self.destroy();
  }
}));
/* --------------------------------------
 * Exports
 * -------------------------------------- */

function initPrompt(targetUI, type, value, message, iter) {
  targetUI = (0,util.is)(targetUI, UIToolset/* default */.Z) || ui;
  return targetUI.import('dialog.prompt').render({
    value: value,
    valueEnabled: type === 'prompt',
    valueLabel: message,
    cancelVisible: type !== 'alert',
    action: iter.string(),
    dialogTitle: iter.string(),
    dialogDescription: type === 'prompt' ? iter.string() : message,
    dialogData: iter.next('object') && iter.value,
    callback: iter.fn()
  }).dialog;
}

function promptFactory_alert(message, action, title, data, callback) {
  return initPrompt(this, 'alert', true, message, new ArgumentIterator/* default */.Z([action, title, data, callback]));
}

function promptFactory_confirm(message, action, title, data, callback) {
  return initPrompt(this, 'confirm', true, message, new ArgumentIterator/* default */.Z([action, title, data, callback]));
}

function promptFactory_prompt(message, value, action, title, description, data, callback) {
  return initPrompt(this, 'prompt', value, message, new ArgumentIterator/* default */.Z([action, title, description, data, callback]));
}

function notify(message, kind, timeout, within, data) {
  var targetUI = (0,util.is)(this, UIToolset/* default */.Z) || ui;
  var iter = new ArgumentIterator/* default */.Z([kind, timeout, within, data]);
  return targetUI.import('dialog.notify').render({
    label: message,
    kind: iter.string() || true,
    timeout: iter.next('number') && iter.value,
    within: iter.next(Node) && iter.value,
    data: iter.next('object') && iter.value
  }).dialog;
}

var factory = {
  alert: promptFactory_alert,
  confirm: promptFactory_confirm,
  prompt: promptFactory_prompt,
  notify: notify
};
(0,util/* define */.Ou)(UIToolset/* default */.Z, factory);
(0,util/* definePrototype */.r9)(UIToolset/* default */.Z, factory);

;// CONCATENATED MODULE: ./build/ButtonList.js



/**
 * @param {ZetaUI.UIControl} control
 * @param {'previousSibling' | 'nextSibling'} prop
 */

function getNextVisible(control, prop) {
  for (var cur = control[prop]; cur && !cur.visible; cur = cur[prop]) {
    ;
  }

  return cur;
}

var ButtonList = (0,define/* define */.O)('buttonlist', {
  template: '<div class="sep-before:{{showSeparatorBefore}} sep-after:{{showSeparatorAfter}}"><children show-text="true" show-icon="true" controls/></div>',
  templates: {
    button: '<z:button><span class="zui-label zui-label-description">{{description ?? [ shortcut :zui-shortcut ]}}</span></z:button>'
  },
  showIcon: true,
  showText: true,
  showSeparatorBefore: false,
  showSeparatorAfter: false,
  requireChildControls: true,
  hiddenWhenDisabled: true,
  parseOptions: parseControlsAndExecute,
  stateChange: function stateChange(e, self) {
    (0,util/* each */.S6)(self.controls, function (i, v) {
      if (v.type === 'buttonlist') {
        var prevVisible = getNextVisible(v, 'previousSibling');
        var nextVisible = getNextVisible(v, 'nextSibling'); // @ts-ignore

        v.showSeparatorBefore = !!prevVisible; // @ts-ignore

        v.showSeparatorAfter = !!nextVisible && nextVisible.type !== 'buttonlist';
      }
    });
  }
});
/* harmony default export */ var build_ButtonList = (ButtonList);
;// CONCATENATED MODULE: ./build/ButtonLike.js

(0,define/* defineLayout */.a)('buttonlike', {
  template: '<label role="button"><children/></label>'
});
/* harmony default export */ var ButtonLike = (null);
;// CONCATENATED MODULE: ./build/Callout.js



var Callout = (0,define/* define */.O)('callout', {
  template: '<div><controls of="not parent.alwaysShowCallout && parent.controls where enabled as _enabled && _enabled.length == 1 && _enabled.0.id == id"></controls><z:buttonlike class="hidden:{{[ not alwaysShowCallout ] && controls where enabled length == 1}}"><z:label></z:label></z:buttonlike><z:menu></z:menu></div>',
  requireChildControls: true,
  hideCalloutOnExecute: true,
  hideCalloutOnBlur: true,
  alwaysShowCallout: true,
  parseOptions: function parseOptions(options, iter) {
    options.icon = iter.string();
    options.controls = iter.nextAll(UIControlSpecies/* default */.Z);
  }
});
/* harmony default export */ var build_Callout = ((/* unused pure expression or super */ null && (Callout)));
;// CONCATENATED MODULE: ./build/Checkbox.js



function checkboxToggleValue(e, self) {
  if (e.type !== 'click' || shouldExecuteOnClick(e, 'checkbox')) {
    self.value = !self.value;
    return self.type === 'checkbox' ? self.execute() : e.handled();
  }
}

var Checkbox = (0,define/* define */.O)('checkbox', {
  template: '<z:button class="checked:{{value}}" show-icon="false" show-text="true"/>',
  value: false,
  preventLeave: true,
  parseOptions: parseExecute,
  click: checkboxToggleValue,
  enter: checkboxToggleValue,
  space: checkboxToggleValue
});
/* harmony default export */ var build_Checkbox = ((/* unused pure expression or super */ null && (Checkbox)));
// EXTERNAL MODULE: ./build/include/zeta-dom/env.js
var env = __webpack_require__(562);
;// CONCATENATED MODULE: ./build/Menu.js








function getNextItem(self, cur, dir) {
  var arr = [];

  (function getButtonList(control) {
    (0,util/* each */.S6)(control.controls, function (i, v) {
      if (v.hasRole('buttonlist') && !v.hasRole('menu')) {
        getButtonList(v);
      } else if (v.hasRole('button') && v.enabled && v.visible) {
        arr[arr.length] = v;
      }
    });
  })(self);

  var i = arr.indexOf(cur);
  return arr[i < 0 ? 0 : i + dir];
}

function showCallout(self, to, dir, within, offset) {
  var callout = self.callout;

  if (self.parent && (0,domUtil/* containsOrEquals */.BZ)(self.element, callout)) {
    (0,domUtil/* setClass */.w)(callout, 'hidden', false);
    position(callout, self.element, 'right top inset-y');
  } else {
    if (self.calloutParent) {
      snap(callout, self.calloutParent);
    } else if ((0,util.is)(to, Node)) {
      snap(callout, to, dir, offset);
    } else {
      position(callout, to, dir, within, offset);
    }

    dom/* default.focus */.ZP.focus(callout);

    if ((0,domUtil/* getClass */.ll)(callout, 'closing')) {
      (0,domUtil/* setClass */.w)(callout, 'open', false);
      (0,domUtil/* setClass */.w)(callout, 'closing', false);
    }

    (0,util/* catchAsync */.ZD)((0,cssUtil/* runCSSTransition */.Yr)(callout, 'open'));
  }
}

function hideCallout(self) {
  var callout = self.callout;

  if (self.parent && (0,domUtil/* containsOrEquals */.BZ)(self.element, callout)) {
    (0,domUtil/* setClass */.w)(callout, 'hidden', true);
  } else {
    (0,util/* catchAsync */.ZD)((0,cssUtil/* runCSSTransition */.Yr)(callout, 'closing', function () {
      (0,domUtil/* removeNode */.ZF)(callout);
    }));
  }

  self.activeButton = null;
}

function isSubMenu(self) {
  if (self.parent) {
    for (var cur = self.parent; cur && cur.hasRole('buttonlist') && !cur.hasRole('menu'); cur = cur.parent) {
      ;
    }

    return !cur || cur.hasRole('menu');
  }
}

var Menu = (0,define/* define */.O)('menu', {
  template: '<div scrollable class="zui-root zui-float"><z:buttonlist/></div>',
  waitForExecution: false,
  parseOptions: parseControlsAndExecute,
  init: function init(e, self) {
    var callout = e.context.getElementForRole('menu') || self.element;

    if (isSubMenu(self)) {
      (0,domUtil/* bind */.ak)(self.element, {
        mouseenter: showCallout.bind(null, self),
        mouseleave: hideCallout.bind(null, self)
      });
    } else if (!self.parent && callout === self.element) {
      (0,util/* defineHiddenProperty */.c)(self.context, 'showMenu', showCallout.bind(null, self));
      (0,util/* defineHiddenProperty */.c)(self.context, 'hideMenu', hideCallout.bind(null, self));
      (0,util/* defineHiddenProperty */.c)(self.context, 'element', callout);
    } else {
      self.calloutParent = callout.parentNode;
      dom/* default.retainFocus */.ZP.retainFocus(self.element, callout);
      (0,domUtil/* removeNode */.ZF)(callout);
    }

    (0,domUtil/* bind */.ak)(self.element, 'mousemove', function () {
      self.activeButton = null;
    });
    (0,domUtil/* setClass */.w)(callout, 'is-' + self.type, true);
    self.callout = callout;
    self.activeButton = null;
    self.watch('activeButton', function (cur, old) {
      (old || {}).active = false;
      (cur || {}).active = true;
      (cur || self).focus();
    });
    hideCallout(self);
  },
  focusin: function focusin(e, self) {
    if (e.source === 'keyboard' && !self.parent) {
      showCallout(self);
      self.activeButton = getNextItem(self, self, 1);
    }
  },
  focusout: function focusout(e, self) {
    self.activeButton = null;

    if (self.hideCalloutOnBlur) {
      hideCallout(self);
    }
  },
  click: function click(e, self) {
    if (!(0,domUtil/* containsOrEquals */.BZ)(self.callout, e.target)) {
      showCallout(self);
      e.handled();
    }
  },
  keystroke: function keystroke(e, self) {
    var cur = self.activeButton;
    var dir = /^(up|down|left|right)Arrow$/.test(e.data) && RegExp.$1[0];

    if (dir === 'l') {
      if (!self.parent) {
        e.handled();
      } else if (cur) {
        hideCallout(self);
        e.handled();
      }
    } else if (dir === 'r') {
      showCallout(self);
      self.activeButton = cur || getNextItem(self, self, 1);
      e.handled();
    } else if (dir && (cur || !self.parent || self.calloutParent)) {
      self.activeButton = getNextItem(self, cur, dir === 'u' ? -1 : 1) || cur;
      e.handled();
    }
  },
  childExecuted: function childExecuted(e, self) {
    self.activeButton = null; // @ts-ignore: type inference issue

    for (var cur = e.control; cur && cur !== self.parent; cur = cur.parent) {
      if (!cur.hideCalloutOnExecute) {
        return;
      }
    }

    hideCallout(self);
  },
  beforeDestroy: function beforeDestroy(e, self) {
    hideCallout(self);
  }
});
/* harmony default export */ var build_Menu = (Menu);
// EXTERNAL MODULE: ./build/util/common.js
var common = __webpack_require__(400);
;// CONCATENATED MODULE: ./build/Dropdown.js








var _ = (0,util/* createPrivateStore */.D8)();

function setDropdownValue(dropdown, value, forceUpdate) {
  var choices = _(dropdown).all(dropdown);

  var defaultChoice;
  var match = (0,util/* any */.Yj)(choices, function (v) {
    defaultChoice = defaultChoice || v;
    return v.value === value;
  });

  if (!match && !dropdown.allowEmpty) {
    match = defaultChoice;
  }

  if (dropdown.setValue(match ? match.value : '') || forceUpdate) {
    dropdown.hintValue = value;
    dropdown.selectedText = (match && dropdown.valueAsLabel ? match : dropdown).label;
    (0,util/* each */.S6)(choices, function (i, v) {
      v.selected = v === match;
    });
  }
}

function updateDropdownChoices(dropdown, choiceObj) {
  var isArray = Array.isArray(choiceObj);
  var choices = [];
  (0,util/* each */.S6)(choiceObj, function (i, v) {
    choices[choices.length] = isArray && (0,util/* isPlainObject */.PO)(v) ? v : {
      value: isArray ? v : (0,common/* parseTemplateConstant */.pV)(i),
      label: v
    };
  });

  var choiceButton = _(dropdown);

  var newButtons = [];

  for (var i = 0, len = choices.length - Object.keys(choiceButton.all(dropdown)).length; i < len; i++) {
    newButtons[i] = choiceButton;
  }

  dropdown.append(newButtons);
  (0,util/* each */.S6)(choiceButton.all(dropdown), function (i, v) {
    v.enabled = v.visible = !!choices[0];
    (0,util/* extend */.l7)(v, choices.shift());
  });
  setDropdownValue(dropdown, dropdown.hintValue, true);
}

var Dropdown = (0,define/* define */.O)('dropdown', {
  template: '<z:buttonlike label="{{selectedText}}" show-text="true"><z:label></z:label><z:menu></z:menu></z:buttonlike>',
  requireChildControls: true,
  hideCalloutOnBlur: true,
  hideCalloutOnExecute: true,
  preventLeave: true,
  allowEmpty: true,
  valueAsLabel: true,
  value: '',
  parseOptions: function parseOptions(options, iter) {
    options.icon = iter.string();

    if (iter.next(Array) || iter.next(Map)) {
      options.choices = iter.value;
      options.value = iter.next('string') || iter.next('number') ? iter.value : '';
    }

    parseControlsAndExecute(options, iter);
  },
  init: function init(e, self) {
    _(self, new UIToolset/* default */.Z(self.state.name).use(build_Button).button({
      template: '<z:button class="selected:{{selected}}" show-icon="true" show-text="true"/>',
      execute: function execute(choice) {
        setDropdownValue(self, choice.value);
        self.execute();
      }
    }));

    self.hintValue = self.value;
    self.selectedText = self.label;
    self.watch('choices', function (cur) {
      updateDropdownChoices(self, cur);
    }, true);
  },
  setValue: function setValue(e, self) {
    updateDropdownChoices(self, self.choices);
    setDropdownValue(self, e.newValue);
    e.handled();
  }
});
/* harmony default export */ var build_Dropdown = (Dropdown);
// EXTERNAL MODULE: ./build/globalContext.js
var globalContext = __webpack_require__(451);
;// CONCATENATED MODULE: ./build/DatePicker.js
















var MS_PER_DAY = 86400000;
var TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;
var INPUT_TYPES = {
  datetime: 'datetime-local',
  day: 'date',
  week: 'week',
  month: 'month'
};
var MONTH_NAMES = [];
var WEEKDAYS_NAMES = [];
var DatePicker_ui = new UIToolset/* default */.Z('zeta.ui.datepicker').use(Generic, build_ButtonSet, build_Menu, build_Dropdown, build_Button, build_SubmitButton, build_Label, build_TextBox);
var defaultLocale = globalContext/* default.language */.Z.language;
var controls;
var callout;
var activeTyper;
/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function range(count, callback) {
  var arr = [];

  for (var i = 0; i < count; i++) {
    arr[i] = callback(i);
  }

  return arr;
}

function loadLabels(lang) {
  var key = lang || 'default';
  var locale = lang || defaultLocale;
  var monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long'
  });
  var weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'narrow'
  });
  var importDefaultLabels = __webpack_require__(839)("./" + locale + "/zeta.ui.datepicker.json");
  importDefaultLabels.then(function (labels) {
    DatePicker_ui.i18n(key, labels.default);
  });
  range(12, function (i) {
    var str = monthFormatter.format(new Date(1970, i));
    MONTH_NAMES[i] = str;
    DatePicker_ui.i18n(key, 'month_' + i, str);
  });
  range(7, function (i) {
    var date = new Date(1970, 0, i);
    WEEKDAYS_NAMES[date.getDay()] = weekdayFormatter.format(date);
  });
}

function getFullYear(d) {
  return d.getFullYear();
}

function getMonth(d) {
  return d.getMonth();
}

function getDate(d) {
  return d.getDate();
}

function getHours(d) {
  return d.getHours();
}

function getMinutes(d) {
  return d.getMinutes();
}

function sameMonth(x, y) {
  return getFullYear(x) === getFullYear(y) && getMonth(x) === getMonth(y);
}

function parseMaxima(d) {
  if (typeof d === 'string' && /^today|([+-]\d+)(day|week|month|year)?$/g.test(d)) {
    return RegExp.$1 ? stepDate(RegExp.$2 || 'day', new Date(), +RegExp.$1) : new Date();
  }

  d = d === null ? undefined : d instanceof Date ? d : new Date(d);
  return isNaN(d) ? undefined : d;
}

function makeTime(h, m) {
  var date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

function toNumericValue(mode, value) {
  // timestamp values for native controls are based on local time against local time epoch for "datetime-local" and
  // UTC midnight against UTC epoch for other non-time types; which is exactly the opposite in this library:
  // local time against UTC epoch and local midnight against UTC epoch respectively
  switch (mode) {
    case 'datetime':
      return +value - TIMEZONE_OFFSET;

    case 'month':
      return (getFullYear(value) - 1970) * 12 + getMonth(value);
  }

  return +value + TIMEZONE_OFFSET;
}

function fromNumericValue(mode, value) {
  switch (mode) {
    case 'datetime':
      return new Date(value + TIMEZONE_OFFSET);

    case 'month':
      return new Date(1970, value);
  }

  return new Date(value - TIMEZONE_OFFSET);
}

function normalizeDate(options, date) {
  var min = parseMaxima(options.min);
  var max = parseMaxima(options.max);
  date = new Date(+(date < min ? min : date > max ? max : date));

  switch (options.mode || options) {
    case 'week':
      date.setDate(getDate(date) - date.getDay());
      break;

    case 'month':
      date.setDate(1);
      break;
  }

  if ((options.mode || options) !== 'datetime') {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setSeconds(0, 0);
  }

  return date;
}

function stepDate(mode, date, dir, step) {
  switch (mode) {
    case 'minute':
      var d = dir / Math.abs(dir);
      return new Date(+date + 60000 * (((d > 0 ? step : 0) - getMinutes(date) % step || step * d) + step * (dir - d)));

    case 'day':
      return new Date(+date + MS_PER_DAY * dir);

    case 'week':
      return new Date(+date + MS_PER_DAY * 7 * dir);

    case 'month':
      return new Date(getFullYear(date), getMonth(date) + dir, getDate(date));

    case 'year':
      return new Date(getFullYear(date) + dir, getMonth(date), getDate(date));
  }
}

function formatDate(mode, date) {
  switch (mode) {
    case 'month':
      return MONTH_NAMES[getMonth(date)] + ' ' + getFullYear(date);

    case 'week':
      var end = stepDate('day', date, 6);
      return MONTH_NAMES[getMonth(date)] + ' ' + getDate(date) + ' - ' + (getMonth(end) !== getMonth(date) ? MONTH_NAMES[getMonth(end)] + ' ' : '') + getDate(end) + ', ' + getFullYear(date);
  }

  var monthPart = MONTH_NAMES[getMonth(date)] + ' ' + getDate(date) + ', ' + getFullYear(date);
  return mode === 'datetime' ? monthPart + ' ' + (getHours(date) || 12) + ':' + ('0' + getMinutes(date)).slice(-2) + ' ' + (getHours(date) >= 12 ? 'PM' : 'AM') : monthPart;
}

function showMonth(self, date) {
  if (isNaN(+date)) {
    return;
  }

  if (typeof date === 'number') {
    date = stepDate('month', self.currentMonth, date);
  }

  var min = parseMaxima(self.min);
  var max = parseMaxima(self.max);
  var currentMonth = normalizeDate({
    mode: 'month',
    min: min,
    max: max
  }, date);
  var y = getFullYear(currentMonth);
  var m = getMonth(currentMonth);
  var all = controls.year.all(self)[0].all;
  var firstDay = currentMonth.getDay();
  var $buttons = jquery('td', self.element).removeClass('selected disabled');

  if (!self.currentMonth || !sameMonth(currentMonth, self.currentMonth)) {
    var numDays = new Date(y, m + 1, 0).getDate();
    var numDaysLast = new Date(y, m, 0).getDate();
    $buttons.removeClass('prev cur next today');
    $buttons.each(function (i, v) {
      if (i < firstDay) {
        jquery(v).children().text(i + 1 - firstDay + numDaysLast).end().addClass('prev');
      } else if (i >= numDays + firstDay) {
        jquery(v).children().text(i + 1 - firstDay - numDays).end().addClass('next');
      } else {
        jquery(v).children().text(i + 1 - firstDay).end().addClass('cur');
      }
    });
    var today = new Date();

    if (sameMonth(currentMonth, today)) {
      $buttons.eq(getDate(today) + firstDay - 1).addClass('today');
    }

    jquery('tr:last', self.element).toggle(firstDay + numDays > 35);
    all.year.choices = range(11, function (v) {
      return y + v - 5;
    });
    self.currentMonth = currentMonth;
  }

  all.year.value = y;
  all.month.value = m;
  var isMinMonth = min && sameMonth(currentMonth, min);
  var isMaxMonth = max && sameMonth(currentMonth, max);
  all.prevMonth.enabled = !isMinMonth;
  all.nextMonth.enabled = !isMaxMonth;

  if (isMinMonth) {
    $buttons.slice(0, getDate(min) + firstDay - 1).addClass('disabled');
  }

  if (isMaxMonth) {
    $buttons.slice(getDate(max) + firstDay).addClass('disabled');
  }

  var selected = sameMonth(currentMonth, self.value);

  if (selected || self.mode === 'week' && sameMonth(currentMonth, stepDate('day', self.value, 6))) {
    switch (self.mode) {
      case 'day':
        $buttons.eq(getDate(self.value) + firstDay - 1).addClass('selected');
        break;

      case 'week':
        $buttons.slice(selected ? getDate(self.value) + firstDay - 1 : 0).slice(0, 7).addClass('selected');
        break;

      case 'month':
        $buttons.filter('td.cur').addClass('selected');
        break;
    }
  }

  jquery(self.element).toggleClass('select-range', self.mode !== 'day');
}

function initControls() {
  var dropdownOptions = {
    template: '<z:callout label="{{selectedText}}" show-text="true"/>'
  };
  var monthChoices = new Map();
  range(12, function (v) {
    monthChoices.set(v, 'month_' + v);
  });
  controls = {
    year: DatePicker_ui.dropdown('year', function (self) {
      // @ts-ignore: parent is not null
      return showMonth(self.parent, new Date(self.value, getMonth(self.parent.currentMonth)));
    }, dropdownOptions),
    month: DatePicker_ui.dropdown('month', monthChoices, function (self) {
      // @ts-ignore: parent is not null
      return showMonth(self.parent, new Date(getFullYear(self.parent.currentMonth), self.value));
    }, dropdownOptions),
    prev: DatePicker_ui.button('prevMonth', "\uE314", function (self) {
      return showMonth(self.parent, -1);
    }),
    setToday: DatePicker_ui.button('setToday', "\uE8DF", function (self) {
      // @ts-ignore: parent is not null
      return self.parent.execute(new Date());
    }),
    next: DatePicker_ui.button('nextMonth', "\uE315", function (self) {
      return showMonth(self.parent, 1);
    }),
    hour: DatePicker_ui.number('hour', {
      options: {
        min: 0,
        max: 23,
        loop: true
      },
      execute: function execute(self) {
        // @ts-ignore: parent is not null
        self.parent.execute(makeTime(self.value, self.all.minute.value));
      }
    }),
    timeSeperator: DatePicker_ui.label('timeSeperator'),
    minute: DatePicker_ui.number('minute', {
      options: {
        min: 0,
        max: 59,
        digits: 'fixed',
        loop: true
      },
      execute: function execute(self) {
        // @ts-ignore: parent is not null
        self.parent.execute(makeTime(self.all.hour.value, self.value));
      }
    }),
    meridiem: DatePicker_ui.button('meridiem', {
      value: false,
      label: 'am',
      showText: true,
      propertyChange: function propertyChange(e, self) {
        self.label = self.value ? 'pm' : 'am';
      },
      execute: function execute(self) {
        self.value = !self.value; // @ts-ignore: parent is not null

        self.parent.execute(makeTime(self.all.hour.value % 12 + (self.value ? 12 : 0), self.all.minute.value));
      }
    })
  };
}

function initDatepickerCallout() {
  var executed = function executed(e, self) {
    var date = new Date(+self.all.calendar.value);
    date.setHours(getHours(self.all.clock.value), getMinutes(self.all.clock.value));

    if (activeTyper) {
      activeTyper.setValue(date);
    }
  };

  var calender = DatePicker_ui.calendar({
    executed: executed,
    contextChange: function contextChange(e, self) {
      // @ts-ignore: custom control property
      self.min = callout.min; // @ts-ignore: custom control property

      self.max = callout.max; // @ts-ignore: custom control property

      self.mode = callout.mode === 'datetime' ? 'day' : callout.mode;
    }
  });
  var clock = DatePicker_ui.clock({
    hiddenWhenDisabled: true,
    executed: executed,
    contextChange: function contextChange(e, self) {
      // @ts-ignore: custom control property
      self.step = callout.minuteStep;
      self.enabled = callout.mode === 'datetime';
    }
  });
  var okButton = DatePicker_ui.submit('done', 'done', {
    execute: function execute(self) {
      callout.hideMenu();
    }
  });
  callout = DatePicker_ui.menu(DatePicker_ui.buttonset(calender, clock), DatePicker_ui.generic({
    controls: [DatePicker_ui.buttonset(okButton)],
    template: '<z:generic><controls layout="dialog"/></z:generic>'
  }), {
    hideCalloutOnBlur: false
  }).render();
}

function stepValue(tx) {
  var options = tx.widget.options;
  var date = stepDate(options.mode === 'datetime' ? 'minute' : options.mode, tx.typer.getValue() || new Date(), tx.commandName === 'stepUp' ? -1 : 1, options.minuteStep);
  tx.typer.setValue(date);
}
/* --------------------------------------
 * Control types
 * -------------------------------------- */


var Calendar = (0,define/* define */.O)('calendar', {
  template: '<div><div class="zui-calendar-header"><z:buttonset show-text="false"/></div><div class="zui-calendar-body"><table></table></div></div>',
  hideCalloutOnExecute: false,
  value: null,
  mode: 'day',
  min: null,
  max: null,
  setValue: function setValue(e, self) {
    var value = normalizeDate(this, e.newValue);
    self.selectedDate = value;
    self.value = value;
    showMonth(self, value);
  },
  init: function init(e, self) {
    if (!controls) {
      initControls();
    }

    self.append([controls.year, controls.month, controls.prev, controls.setToday, controls.next]);

    var updateValue = function updateValue() {
      self.value = normalizeDate(self, self.selectedDate);
    };

    self.watch('mode', updateValue);
    self.watch('min', updateValue);
    self.watch('max', updateValue);
    var $table = jquery('table', self.element);
    jquery((0,util/* repeat */.rx)('<tr></tr>', 7)).appendTo($table);
    jquery((0,util/* repeat */.rx)('<th></th>', 7)).appendTo($table.find('tr:first'));
    jquery((0,util/* repeat */.rx)('<td></td>', 7)).appendTo($table.find('tr+tr'));
    jquery('<button>').appendTo($table.find('td'));
    $table.find('th').text(function (i) {
      return WEEKDAYS_NAMES[i];
    });
    $table.find('td').on('click', function () {
      var monthDelta = jquery(this).hasClass('prev') ? -1 : jquery(this).hasClass('next') ? 1 : 0; // @ts-ignore: type inference issue

      self.execute(new Date(getFullYear(self.currentMonth), getMonth(self.currentMonth) + monthDelta, +this.textContent));
    });

    if (!self.value) {
      self.value = new Date();
    } else {
      showMonth(self, 0);
    }
  },
  mousewheel: function mousewheel(e, self) {
    if (self.context === callout) {
      showMonth(self, e.data);
      e.handled();
    }
  },
  contextChange: function contextChange(e, self) {
    showMonth(self, self.currentMonth || self.value || new Date());
  }
});
var Clock = (0,define/* define */.O)('clock', {
  template: '<div><div class="zui-clock-face"><s hand="h"></s><s hand="m"></s><i></i><i></i></div><z:buttonset/></div>',
  hideCalloutOnExecute: false,
  step: 1,
  value: null,
  init: function init(e, self) {
    if (!controls) {
      initControls();
    }

    self.append([controls.hour, controls.timeSeperator, controls.minute, controls.meridiem]);
    self.watch('step', function (step) {
      // only allow minute interval that is a factor of 60
      // to maintain consistent step over hours
      if (60 % step) {
        self.step = 1;
      }

      controls.minute.all(self)[0].options.step = step;
    }, true);
    self.setValue(new Date());
  },
  setValue: function setValue(e, self) {
    var date = e.newValue;
    var all = controls.hour.all(self)[0].all;
    all.hour.value = getHours(date) || 12;
    all.minute.value = getMinutes(date);
    all.meridiem.value = getHours(date) >= 12;
    jquery('s[hand="h"]', self.element).css('transform', 'rotate(' + (getHours(date) * 30 + getMinutes(date) * 0.5 - 90) + 'deg)');
    jquery('s[hand="m"]', self.element).css('transform', 'rotate(' + (getMinutes(date) * 6 - 90) + 'deg)');
  },
  mousedown: function mousedown(e, self) {
    if ((0,domUtil/* matchSelector */.oN)(e.target, 's')) {
      // @ts-ignore: parent is not null
      var rect = (0,domUtil/* getRect */.Dz)(e.target.parentNode);
      var promise = dom/* default.beginDrag */.ZP.beginDrag(function (x, y) {
        var rad = Math.atan2(y - rect.centerY, x - rect.centerX) / Math.PI;
        var curM = getMinutes(self.value);
        var curH = getHours(self.value);

        if (e.target.getAttribute('hand') === 'm') {
          // @ts-ignore: custom control property
          var m = Math.round((rad * 30 + 75) / self.step) * self.step % 60;

          if (m !== curM) {
            var deltaH = Math.floor(Math.abs(curM - m) / 30) * (m > curM ? -1 : 1);
            self.setValue(makeTime(curH + deltaH, m));
          }
        } else {
          var h = Math.round(rad * 6 + 15) % 12 + (controls.meridiem.all(self)[0].value ? 12 : 0);

          if (h !== curH) {
            self.setValue(makeTime(h, curM));
          }
        }
      });
      promise.then(function () {
        self.execute();
      });
    }
  },
  mousewheel: function mousewheel(e, self) {
    self.setValue(stepDate('minute', self.value, e.data, self.step));
    self.mousewheelTimeout = self.mousewheelTimeout || setTimeout(function () {
      self.mousewheelTimeout = null;
      self.execute();
    });
    e.preventDefault();
    e.handled();
  }
});
var DatePicker = (0,define/* define */.O)('datepicker', {
  template: '<z:textbox/>',
  preventLeave: true,
  value: '',
  options: {},
  init: function init(e, self) {
    if (env/* IS_TOUCH */.Dr) {
      var mode = self.options.mode || self.preset.options.mode;
      self.nativeInput = jquery('<input type="' + INPUT_TYPES[mode] + '">').appendTo(self.element)[0];
      (0,domUtil/* bind */.ak)(self.nativeInput, 'change', function (e) {
        self.setValue(fromNumericValue(mode, self.nativeInput.valueAsNumber));
      });
    }
  },
  focusin: function focusin(e, self) {
    if (env/* IS_TOUCH */.Dr) {
      var mode = self.options.mode || self.preset.options.mode;

      if (!self.value) {
        self.value = new Date();
      } // input type "datetime-local" does not support valueAsDate so we need to use with valueAsNumber (timestamp)


      self.nativeInput.valueAsNumber = toNumericValue(mode, self.value);
      self.nativeInput.focus();
      e.preventDefault();
    }
  },
  preset: {
    options: {
      mode: 'day',
      minuteStep: 1,
      min: null,
      max: null,
      required: false,
      formatDate: null
    },
    overrides: {
      getValue: function getValue(preset) {
        return preset.selectedDate ? normalizeDate(preset.options, preset.selectedDate) : null;
      },
      setValue: function setValue(preset, date) {
        date = date ? normalizeDate(preset.options, date) : null;
        preset.selectedDate = date;
        preset.softSelectedDate = null;
        var text = '';

        if (date && !isNaN(+date)) {
          var format = function format(fn) {
            return (0,util/* isFunction */.mf)(fn) && fn(preset.options.mode, date);
          };

          text = format(preset.options.formatDate) || format(formatDate);
        }

        if (text !== this.extractText()) {
          this.invoke(function (tx) {
            tx.selection.selectAll();
            tx.insertText(text);
          });

          if (this === activeTyper) {
            callout.calendar = callout.clock = preset.selectedDate || new Date();
          }
        }
      },
      validate: function validate(preset) {
        if (preset.options.required && !!preset.selectedDate) {
          return (0,util/* reject */.d1)('required');
        }
      }
    },
    commands: {
      stepUp: stepValue,
      stepDown: stepValue
    },
    contentChange: function contentChange(e) {
      if (e.typer === activeTyper && e.source !== 'script') {
        var date = new Date(e.typer.extractText());

        if (!isNaN(+date)) {
          callout.calendar = callout.clock = normalizeDate(e.widget.options, date);
        }

        e.widget.softSelectedDate = date;
      }
    },
    click: function click(e) {
      if (e.typer === activeTyper) {
        callout.showMenu(e.typer.element, 'left bottom', null, 10);
      }
    },
    escape: function escape(e) {
      if ((0,domUtil/* containsOrEquals */.BZ)(document, callout.element)) {
        callout.hideMenu();
        e.handled();
      }
    },
    focusin: function focusin(e) {
      if (!callout) {
        initDatepickerCallout();
      }

      e.typer.retainFocus(callout.element);
      activeTyper = e.typer;
      var options = e.widget.options;
      var value = e.typer.getValue() || new Date();
      (0,util/* extend */.l7)(callout, {
        mode: options.mode,
        minuteStep: options.minuteStep,
        min: options.min,
        max: options.max,
        calendar: value,
        clock: value
      });
      callout.update();

      if (e.source !== 'script') {
        callout.showMenu(e.typer.element, 'left bottom', null, 10);
      }
    },
    focusout: function focusout(e) {
      if (e.typer === activeTyper) {
        var softDate = e.widget.softSelectedDate;
        e.typer.setValue(!softDate || isNaN(+softDate) ? e.widget.selectedDate : softDate);
        activeTyper = null;
        callout.hideMenu();
      }
    }
  }
});
loadLabels();

;// CONCATENATED MODULE: ./build/Fieldset.js



function updateFlag(self) {
  self.value = self.optional ? !!self.value : undefined;
  self.enableChildren = !self.optional || self.value;
}

var FieldSet = (0,define/* define */.O)('fieldset', {
  template: '<div class="optional:{{optional && [ ? value checked [ ! value ] ]}}"><div class="zui-fieldset-title"><z:checkbox/><p>{{description}}</p></div><div class="zui-form hidden:{{not enableChildren}}"><children controls/></div></div>',
  templates: {
    textbox: '<z:textbox show-placeholder="always"/>'
  },
  value: false,
  optional: false,
  parseOptions: parseControlsAndExecute,
  init: function init(e, self) {
    updateFlag(self);
  },
  propertyChange: function propertyChange(e, self) {
    if ('optional' in e.newValues || 'value' in e.newValues) {
      updateFlag(self);
    }
  }
});
/* harmony default export */ var Fieldset = ((/* unused pure expression or super */ null && (FieldSet)));
;// CONCATENATED MODULE: ./build/FileInput.js





function resetFileInput(e) {
  var input = jquery(':file', e.target)[0];
  var originalParent = input.parentNode;
  var form = document.createElement('form');
  form.appendChild(input);
  form.reset(); // @ts-ignore: originalParent is not null

  jquery(input).prependTo(originalParent);
}

var FileInput = (0,define/* define */.O)('file', {
  template: '<z:buttonlike><z:label show-icon="auto"></z:label><input type="file" multiple="{{multiple}}"/></z:buttonlike>',
  autoReset: true,
  multiple: false,
  parseOptions: parseIconAndExecute,
  reset: resetFileInput,
  init: function init(e, self) {
    jquery(':file', e.target).on('change', function (e) {
      // @ts-ignore: e.target is file input
      self.execute((0,util/* makeArray */.VL)(e.target.files));
    });
  },
  afterExecute: function afterExecute(e, self) {
    if (self.autoReset) {
      resetFileInput(e);
    }
  }
});
/* harmony default export */ var build_FileInput = ((/* unused pure expression or super */ null && (FileInput)));
// EXTERNAL MODULE: ./build/include/external/promise-polyfill.js
var promise_polyfill = __webpack_require__(406);
// EXTERNAL MODULE: ./build/include/zeta-dom/domLock.js
var domLock = __webpack_require__(605);
;// CONCATENATED MODULE: ./build/Form.js






var guards = new WeakMap();
var deferreds = new WeakMap();

function ensureFormPromise(form, store) {
  return (0,util/* mapGet */.LX)(store, form, function () {
    var obj = {};
    obj.promise = new promise_polyfill(function (resolve, reject) {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    return obj;
  });
}

function settleFormPromise(form, store, resolveOrReject, data) {
  var deferred = (0,util/* mapRemove */.M2)(store, form);

  if (deferred) {
    deferred[resolveOrReject ? 'resolve' : 'reject'](data);
  }
}

function initForm(form) {
  var deferred = ensureFormPromise(form, deferreds);
  (0,util/* defineHiddenProperty */.c)(form.context, form.name, deferred.promise);
  settleFormPromise(form, guards, true);
}

var Form = (0,define/* define */.O)('form', {
  templates: {
    buttonset: '<z:buttonset><children controls show-text="true"/></z:buttonset>',
    textbox: '<z:textbox show-placeholder="always"/>'
  },
  parseOptions: parseControlsAndExecute,
  defaultExport: 'promise',
  preventLeave: true,
  init: function init(e, self) {
    initForm(self);
  },
  childExecuted: function childExecuted(e, self) {
    if (e.source !== 'script' && e.control.preventLeave && !guards.get(self)) {
      (0,domLock/* lock */.dR)(self.element, ensureFormPromise(self, guards).promise, function () {
        return self.preventLeave ? promptFactory_confirm('leaveForm') : (0,util/* resolve */.DB)();
      });
    }
  },
  beforeExecute: function beforeExecute(e, self) {
    settleFormPromise(self, guards, true);
  },
  executed: function executed(e, self) {
    settleFormPromise(self, deferreds, true, e.data !== null ? e.data : self.value !== undefined ? self.value : self.context.toJSON());
    self.reset();
  },
  cancelled: function cancelled(e, self) {
    settleFormPromise(self, deferreds, false);
  },
  destroy: function destroy(e, self) {
    settleFormPromise(self, deferreds, false);
  },
  reset: function reset(e, self) {
    if (!deferreds.get(self)) {
      initForm(self);
    }
  }
});
/* harmony default export */ var build_Form = ((/* unused pure expression or super */ null && (Form)));
;// CONCATENATED MODULE: ./build/KeywordInput.js
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

















var SHOW_DIALOG = env/* IS_TOUCH */.Dr;
var KeywordInput_ui = new UIToolset/* default */.Z('zeta.ui.keyword').use(build_Menu, build_Dropdown, build_Dialog, build_TextBox, build_Button, build_SubmitButton, build_ButtonSet, build_ButtonList);
var KeywordInput_defaultLocale = globalContext/* default.language */.Z.language;
var activeInput;
var activeDialog;
var KeywordInput_callout;
/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function KeywordInput_loadLabels(lang) {
  var importDefaultLabels = __webpack_require__(839)("./" + (lang || KeywordInput_defaultLocale) + "/zeta.ui.keyword.json");
  return importDefaultLabels.then(function (labels) {
    KeywordInput_ui.i18n(lang || 'default', labels.default);
  });
}

function initCallout() {
  KeywordInput_callout = KeywordInput_ui.menu({
    hideCalloutOnBlur: false,
    hideCalloutOnExecute: false,
    controls: [KeywordInput_ui.dropdown({
      template: '<z:buttonlist/>',
      execute: function execute(self) {
        insertItem(KeywordInput_callout.preset, self.value);
        KeywordInput_callout.preset.typer.focus();
      },
      contextChange: function contextChange(e, self) {
        self.choices = self.context.suggestions;
      }
    })]
  }).render();
}

function encode(v, keepWS) {
  var a = document.createTextNode(keepWS ? v : v.replace(/\s/g, "\xA0")),
      b = document.createElement('div');
  b.appendChild(a);
  return b.innerHTML;
}

function toValue(v) {
  return v.value;
}

function toValueObject(v) {
  if (_typeof(v) !== 'object') {
    return {
      value: v,
      label: v
    };
  }

  return v;
}

function sortValues(a, b) {
  return a.value.localeCompare(b.value);
}

function valueChanged(x, y) {
  return x.length !== y.length || x.some(function (v) {
    return y.indexOf(v) < 0;
  });
}

function fuzzyMatch(haystack, needle) {
  haystack = String(haystack || '');
  var vector = [];
  var str = haystack.toLowerCase();
  var j = 0;
  var lastpos = -1;

  for (var i = 0; i < needle.length; i++) {
    var l = needle.charAt(i).toLowerCase();

    if (l == ' ') {
      continue;
    }

    j = str.indexOf(l, j);

    if (j == -1) {
      return {
        firstIndex: Infinity,
        consecutiveMatches: -1,
        formattedText: haystack
      };
    }

    vector[vector.length] = j - lastpos - 1;
    lastpos = j++;
  }

  var firstIndex = vector[0];
  var consecutiveMatches = /^(0+)/.test(vector.slice(0).sort().join('')) && RegExp.$1.length;
  var formattedText = '';
  j = 0;

  for (i = 0; i < vector.length; i++) {
    formattedText += haystack.substr(j, vector[i]) + '**' + haystack[j + vector[i]] + '**';
    j += vector[i] + 1;
  }

  formattedText += haystack.slice(j);
  return {
    firstIndex: firstIndex,
    consecutiveMatches: consecutiveMatches,
    formattedText: formattedText.replace(/\*\*(\ *)\*\*/g, '$1')
  };
}

function getSuggestions(preset, value, exclude) {
  var suggestions = preset.options.suggestions || preset.options.allowedValues || [];

  if ((0,util/* isFunction */.mf)(suggestions)) {
    suggestions = suggestions(value);
  }

  return (0,util/* resolve */.DB)(suggestions).then(function (suggestions) {
    suggestions = suggestions.map(toValueObject);
    suggestions.forEach(function (v) {
      preset.knownValues[v.value] = v.label;
    });

    if (exclude) {
      suggestions = suggestions.filter(function (v) {
        return exclude.indexOf(v.value) < 0;
      });
    }

    return suggestions;
  });
}

function processSuggestions(suggestions, needle, count) {
  suggestions = suggestions.filter(function (v) {
    (0,util/* extend */.l7)(v, fuzzyMatch(v.label, needle));
    [v.value].concat(v.matches || []).forEach(function (w) {
      var m = fuzzyMatch(w, needle);
      v.firstIndex = Math.min(v.firstIndex, m.firstIndex);
      v.consecutiveMatches = Math.max(v.consecutiveMatches, m.consecutiveMatches || 0);
    });
    return v.firstIndex !== Infinity;
  });
  suggestions.sort(function (a, b) {
    return b.consecutiveMatches - a.consecutiveMatches + (a.firstIndex - b.firstIndex) || sortValues(a, b);
  });
  return suggestions.slice(0, count);
}

function showSuggestions(preset) {
  var editor = preset.typer;
  var value = editor.extractText();
  var promise = getSuggestions(preset, value, editor.getValue());
  promise.then(function (suggestions) {
    if (editor.focused()) {
      suggestions = processSuggestions(suggestions, value, preset.options.suggestionCount);

      if (value && preset.options.allowFreeInput && !suggestions.some(function (v) {
        return v.label === value;
      })) {
        suggestions.push({
          value: value,
          label: value,
          formattedText: '*' + value + '*'
        });
      }

      if (!KeywordInput_callout) {
        initCallout();
      }

      KeywordInput_callout.update({
        preset: preset,
        suggestions: suggestions.map(function (v) {
          return {
            value: v.value,
            label: v.formattedText,
            icon: v.icon || ''
          };
        })
      });
      dom/* default.retainFocus */.ZP.retainFocus(editor.element, KeywordInput_callout.element);
      KeywordInput_callout.showMenu(editor.element, 'left bottom', null, 10);
      editor.focus();
    }
  });
}

function showSuggestionDialog(preset, control) {
  var knownValues = getSuggestions(preset);
  KeywordInput_loadLabels(globalContext/* default.language */.Z.language).catch(function () {
    return KeywordInput_loadLabels();
  }).then(function () {
    KeywordInput_ui.dialog({
      title: control.label,
      description: control.placeholder,
      controls: [KeywordInput_ui.textbox('newValue', {
        enter: function enter(e, self) {
          self.all.list.append(KeywordInput_ui.checkbox({
            showIcon: true,
            label: self.value,
            entry: self.value,
            value: true,
            description: 'new value',
            before: '*'
          }));
          return self.execute();
        },
        visible: function visible() {
          return preset.options.allowFreeInput;
        }
      }), KeywordInput_ui.buttonlist('list'), KeywordInput_ui.buttonset(KeywordInput_ui.submit('done', 'done'), KeywordInput_ui.button('cancel', 'close', function (self) {
        self.all.dialog.destroy();
      }))],
      childExecuted: function childExecuted(e, self) {
        self.value = self.all.list.controls.filter(function (v) {
          return v.value;
        }).map(function (v) {
          // @ts-ignore: custom control property
          return v.entry;
        });
      },
      init: function init(e, self) {
        var currentValues = preset.typer.getValue();
        self.all.dialog.value = currentValues.slice(0);
        activeDialog = true;
        knownValues.then(function (knownValues) {
          var allValues = knownValues.map(toValue);
          knownValues = knownValues.concat(currentValues.filter(function (v) {
            return allValues.indexOf(v) < 0;
          }).map(toValueObject));
          knownValues.sort(sortValues);
          self.all.list.append(knownValues.map(function (v) {
            var checked = currentValues.indexOf(v.value) >= 0;
            return KeywordInput_ui.checkbox({
              showIcon: true,
              label: v.label,
              icon: v.icon,
              entry: v.value,
              value: checked,
              before: checked ? '*' : ''
            });
          }));
        });
      },
      destroy: function destroy(e, self) {
        activeDialog = false;
      }
    }).render().dialog.then(function (values) {
      preset.typer.setValue(values);
    });
  });
}

function insertItem(preset, value) {
  if (!value || preset.typer.getValue().indexOf(value.value || value) >= 0) {
    return;
  }

  if (_typeof(value) !== 'object') {
    value = {
      value: value,
      label: preset.knownValues[value] || value
    };
  }

  var span = jquery('<span class="zui-keyword-item" data-value="' + encode(value.value, true) + '">' + encode(value.label) + '<i>delete</i></span>')[0];
  var lastChild = preset.typer.rootNode.lastChild;
  preset.typer.invoke(function (tx) {
    tx.selection.selectAll();

    if (lastChild) {
      tx.selection.baseCaret.moveTo(lastChild.element, false);
    }

    tx.insertHtml(span);
  });

  if (!preset.options.allowFreeInput) {
    getSuggestions(preset, value.value).then(function () {
      if (!preset.knownValues[value.value]) {
        jquery(span).addClass('invalid');
      }
    });
  }
}
/* --------------------------------------
 * Control types
 * -------------------------------------- */


var KeywordInput = (0,define/* define */.O)('keyword', {
  template: '<z:textbox/>',
  preventLeave: true,
  options: {},
  value: [],
  init: function init(e, self) {
    self.watch('required', function (required) {
      self.options.required = required;
    }, true);
  },
  focusin: function focusin(e, self) {
    activeInput = self;
  },
  setValue: function setValue(e, self) {
    var newValue = e.newValue || [];

    if (valueChanged(e.oldValue, newValue)) {
      self.setValue(newValue);
      self.editor.setValue(newValue);
    }

    e.handled();
  },
  preset: {
    options: {
      required: false,
      allowFreeInput: true,
      allowedValues: null,
      suggestionCount: 5,
      suggestions: false
    },
    overrides: {
      getValue: function getValue(preset) {
        return jquery('span', this.element).map(function (i, v) {
          return String(jquery(v).data('value'));
        }).get();
      },
      setValue: function setValue(preset, values) {
        values = ((0,util/* isArray */.kJ)(values) || String(values).split(/\s+/)).filter(function (v) {
          return v;
        });

        if (valueChanged(values, this.getValue())) {
          this.invoke(function (tx) {
            tx.selection.selectAll();
            tx.insertText('');
            values.forEach(function (v) {
              insertItem(preset, v);
            });
          });
        }
      },
      validate: function validate(preset) {
        if (preset.options.required && !this.getValue().length) {
          return (0,util/* reject */.d1)('required');
        }

        if (jquery('.invalid', this.element)[0]) {
          return (0,util/* reject */.d1)('invalid-value');
        }
      }
    },
    widgets: {
      tag: {
        element: 'span',
        inline: true,
        editable: 'none',
        click: function click(e) {
          if (e.target !== e.widget.element) {
            jquery(e.widget.element).detach();
          }
        }
      }
    },
    setup: function setup(e) {
      e.typer.select(e.typer.element, -0);
      e.widget.knownValues = {};
    },
    focusin: function focusin(e) {
      if (!SHOW_DIALOG) {
        showSuggestions(e.widget);
      } else {
        showSuggestionDialog(e.widget, activeInput);
      }
    },
    focusout: function focusout(e) {
      insertItem(e.widget, e.typer.extractText());

      if (!SHOW_DIALOG) {
        KeywordInput_callout.hideMenu();
      }
    },
    click: function click(e) {
      if (SHOW_DIALOG && !activeDialog) {
        showSuggestionDialog(e.widget, activeInput);
      }
    },
    upArrow: function upArrow(e) {
      dom/* default.focus */.ZP.focus(KeywordInput_callout.element);
      e.handled();
    },
    downArrow: function downArrow(e) {
      dom/* default.focus */.ZP.focus(KeywordInput_callout.element);
      e.handled();
    },
    textInput: function textInput(e) {
      var lastChild = e.typer.rootNode.lastChild;

      if (lastChild && e.typer.getSelection().comparePosition(lastChild.element) < 0) {
        e.typer.select(e.typer.element, -0);
      }
    },
    enter: function enter(e) {
      var suggestions = KeywordInput_callout.suggestions;
      insertItem(e.widget, suggestions.length === 1 || suggestions[0] && suggestions[0].label === '**' + e.widget.knownValues[suggestions[0].value] + '**' ? suggestions[0].value : e.typer.extractText());
      e.handled();
    },
    escape: function escape(e) {
      if ((0,domUtil/* containsOrEquals */.BZ)(document, KeywordInput_callout.element)) {
        KeywordInput_callout.hideMenu();
        e.handled();
      }
    },
    contentChange: function contentChange(e) {
      if (!SHOW_DIALOG && e.source !== 'script') {
        showSuggestions(e.widget);
      }
    }
  }
});
/* harmony default export */ var build_KeywordInput = ((/* unused pure expression or super */ null && (KeywordInput)));
;// CONCATENATED MODULE: ./build/LinkButton.js


var LinkButton = (0,define/* define */.O)('link', {
  template: '<z:buttonlike><a href="{{value}}" target="{{target}}"><z:label show-icon="auto"></z:label></a></z:buttonlike>',
  parseOptions: function parseOptions(options, iter) {
    options.icon = iter.string();
    options.value = iter.string();
    options.target = iter.string();
  }
});
/* harmony default export */ var build_LinkButton = ((/* unused pure expression or super */ null && (LinkButton)));
;// CONCATENATED MODULE: ./build/NumberInput.js



function NumberInput_setValue(widget, value, isKeyboardEvent) {
  if (value === null || value === '' || isNaN(value)) {
    value = value ? '0' : '';
    widget.value = null;
  } else {
    var min = parseInt(widget.options.min);
    var max = parseInt(widget.options.max);
    var loop = widget.options.loop && min === min && max === max;

    if (loop && value < min || !loop && max === max && value > max) {
      value = max;
    } else if (loop && value > max || !loop && min === min && value < min) {
      value = min;
    }

    widget.value = +value | 0;
    value = String(+value | 0);
  }

  var numOfDigits = String(+widget.options.max || 0).length;
  var currentText = widget.typer.extractText();

  if (widget.options.digits === 'fixed') {
    value = (new Array(numOfDigits + 1).join('0') + value).substr(-numOfDigits);
  }

  if (value !== currentText && (!isKeyboardEvent || currentText.length >= numOfDigits)) {
    widget.typer.invoke(function (tx) {
      tx.selection.selectAll();
      tx.insertText(value);
    });
  }
}

function NumberInput_stepValue(tx) {
  NumberInput_setValue(tx.widget, (tx.widget.value || 0) + (tx.commandName === 'stepUp' ? 1 : -1) * tx.widget.options.step);
}

var NumberInput = (0,define/* define */.O)('number', {
  template: '<z:textbox/>',
  preventLeave: true,
  value: null,
  preset: {
    validation: {
      allowChars: '0-9'
    },
    options: {
      max: null,
      min: null,
      digits: 'auto',
      step: 1,
      loop: false
    },
    overrides: {
      getValue: function getValue(preset) {
        return preset.value;
      },
      setValue: function setValue(preset, value) {
        NumberInput_setValue(preset, value);
      }
    },
    commands: {
      stepUp: NumberInput_stepValue,
      stepDown: NumberInput_stepValue
    },
    focusout: function focusout(e) {
      NumberInput_setValue(e.widget, e.widget.value);
    },
    contentChange: function contentChange(e) {
      NumberInput_setValue(e.widget, parseInt(e.typer.extractText()), e.source === 'keyboard');
    }
  }
});
/* harmony default export */ var build_NumberInput = ((/* unused pure expression or super */ null && (NumberInput)));
;// CONCATENATED MODULE: ./build/RichTextInput.js





var RichTextInput = (0,define/* define */.O)('richtext', {
  template: '<div><div class="zui-richtext-toolbar"></div><label class="zui-textbox"><z:contenteditable></z:contenteditable><div class="zui-textbox-placeholder"><p>{{label}}</p></div></label></div>',
  hideCalloutOnExecute: false,
  preventLeave: true,
  value: '',
  parseOptions: parseExecute,
  init: function init(e, self) {
    self.editorOptions = self.options || {};
    self.editorOptions.toolbar = {
      container: jquery('.zui-richtext-toolbar', e.target)[0]
    };
  },
  validate: function validate(e, self) {
    if (self.required && !self.editor.extractText()) {
      return (0,util/* reject */.d1)('required');
    }
  }
});
/* harmony default export */ var build_RichTextInput = ((/* unused pure expression or super */ null && (RichTextInput)));
;// CONCATENATED MODULE: ./build/entry.js





















 // @ts-ignore: extend namespace for UMD export

zeta_dom.UI = build/* default */.Z;
/* harmony default export */ var entry = (build/* default */.Z);

/***/ }),

/***/ 451:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__) {

"use strict";
var defaultLocale = 'en';

if (typeof process !== 'undefined' && "en") {
  defaultLocale = "en";
}
/** @type {ZetaUI.UIGlobalContext} */


var globalContext = {
  language: defaultLocale
};
/* harmony default export */ __webpack_exports__["Z"] = (globalContext);

/***/ }),

/***/ 571:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// @ts-nocheck

/** @type {JQueryStatic} */
var jQuery = window.jQuery || __webpack_require__(609);

module.exports = jQuery;

/***/ }),

/***/ 406:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// @ts-nocheck

/** @type {PromiseConstructor} */
var Promise = window.Promise || __webpack_require__(804).default;

module.exports = Promise;

/***/ }),

/***/ 551:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// @ts-nocheck

/** @type {Waterpipe} */
var waterpipe = window.waterpipe || __webpack_require__(160);

module.exports = waterpipe; // assign to a new variable to avoid incompatble declaration issue by typescript compiler

var waterpipe_ = waterpipe;

waterpipe_.pipes['{'] = function (_, varargs) {
  var o = {};

  while (varargs.hasArgs()) {
    var key = varargs.raw();

    if (key === '}') {
      break;
    }

    o[String(key).replace(/:$/, '')] = varargs.next();
  }

  return o;
}; // @ts-ignore: add member to function


waterpipe_.pipes['{'].varargs = true;

/***/ }),

/***/ 372:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// @ts-nocheck
module.exports = {
  get Editor() {
    try {
      return window.zeta && zeta.Editor || __webpack_require__(47);
    } catch (e) {}
  }

};

/***/ }),

/***/ 548:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Yr": function() { return /* binding */ runCSSTransition; }
/* harmony export */ });
/* unused harmony exports parseCSS, isCssUrlValue */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var _zeta$css = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.css,
    parseCSS = _zeta$css.parseCSS,
    isCssUrlValue = _zeta$css.isCssUrlValue,
    runCSSTransition = _zeta$css.runCSSTransition;


/***/ }),

/***/ 358:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony exports textInputAllowed, beginDrag, beginPinchZoom, getShortcut, setShortcut, focusable, focused, setModal, retainFocus, releaseFocus, focus */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var _defaultExport = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.dom;
/* harmony default export */ __webpack_exports__["ZP"] = (_defaultExport);
var _zeta$dom = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.dom,
    textInputAllowed = _zeta$dom.textInputAllowed,
    beginDrag = _zeta$dom.beginDrag,
    beginPinchZoom = _zeta$dom.beginPinchZoom,
    getShortcut = _zeta$dom.getShortcut,
    setShortcut = _zeta$dom.setShortcut,
    focusable = _zeta$dom.focusable,
    focused = _zeta$dom.focused,
    setModal = _zeta$dom.setModal,
    retainFocus = _zeta$dom.retainFocus,
    releaseFocus = _zeta$dom.releaseFocus,
    focus = _zeta$dom.focus;


/***/ }),

/***/ 605:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dR": function() { return /* binding */ lock; },
/* harmony export */   "Ei": function() { return /* binding */ cancelLock; }
/* harmony export */ });
/* unused harmony export locked */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var _zeta$dom = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.dom,
    lock = _zeta$dom.lock,
    locked = _zeta$dom.locked,
    cancelLock = _zeta$dom.cancelLock;


/***/ }),

/***/ 501:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a2": function() { return /* binding */ tagName; },
/* harmony export */   "pn": function() { return /* binding */ isVisible; },
/* harmony export */   "oN": function() { return /* binding */ matchSelector; },
/* harmony export */   "p5": function() { return /* binding */ comparePosition; },
/* harmony export */   "BZ": function() { return /* binding */ containsOrEquals; },
/* harmony export */   "Jn": function() { return /* binding */ iterateNode; },
/* harmony export */   "X2": function() { return /* binding */ iterateNodeToArray; },
/* harmony export */   "pf": function() { return /* binding */ createNodeIterator; },
/* harmony export */   "Xd": function() { return /* binding */ createTreeWalker; },
/* harmony export */   "ak": function() { return /* binding */ bind; },
/* harmony export */   "ZF": function() { return /* binding */ removeNode; },
/* harmony export */   "ll": function() { return /* binding */ getClass; },
/* harmony export */   "w": function() { return /* binding */ setClass; },
/* harmony export */   "rP": function() { return /* binding */ getScrollParent; },
/* harmony export */   "Dz": function() { return /* binding */ getRect; },
/* harmony export */   "Nj": function() { return /* binding */ toPlainRect; }
/* harmony export */ });
/* unused harmony exports domReady, connected, acceptNode, combineNodeFilters, getCommonAncestor, parentsAndSelf, selectIncludeSelf, selectClosestRelative, bindUntil, dispatchDOMMouseEvent, getScrollOffset, getContentRect, scrollBy, scrollIntoView, makeSelection, getRects, rectEquals, rectCovers, rectIntersects, pointInRect, mergeRect, elementFromPoint */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var _zeta$util = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.util,
    domReady = _zeta$util.domReady,
    tagName = _zeta$util.tagName,
    isVisible = _zeta$util.isVisible,
    matchSelector = _zeta$util.matchSelector,
    comparePosition = _zeta$util.comparePosition,
    connected = _zeta$util.connected,
    containsOrEquals = _zeta$util.containsOrEquals,
    acceptNode = _zeta$util.acceptNode,
    combineNodeFilters = _zeta$util.combineNodeFilters,
    iterateNode = _zeta$util.iterateNode,
    iterateNodeToArray = _zeta$util.iterateNodeToArray,
    getCommonAncestor = _zeta$util.getCommonAncestor,
    parentsAndSelf = _zeta$util.parentsAndSelf,
    selectIncludeSelf = _zeta$util.selectIncludeSelf,
    selectClosestRelative = _zeta$util.selectClosestRelative,
    createNodeIterator = _zeta$util.createNodeIterator,
    createTreeWalker = _zeta$util.createTreeWalker,
    bind = _zeta$util.bind,
    bindUntil = _zeta$util.bindUntil,
    dispatchDOMMouseEvent = _zeta$util.dispatchDOMMouseEvent,
    removeNode = _zeta$util.removeNode,
    getClass = _zeta$util.getClass,
    setClass = _zeta$util.setClass,
    getScrollOffset = _zeta$util.getScrollOffset,
    getScrollParent = _zeta$util.getScrollParent,
    getContentRect = _zeta$util.getContentRect,
    scrollBy = _zeta$util.scrollBy,
    scrollIntoView = _zeta$util.scrollIntoView,
    makeSelection = _zeta$util.makeSelection,
    getRect = _zeta$util.getRect,
    getRects = _zeta$util.getRects,
    toPlainRect = _zeta$util.toPlainRect,
    rectEquals = _zeta$util.rectEquals,
    rectCovers = _zeta$util.rectCovers,
    rectIntersects = _zeta$util.rectIntersects,
    pointInRect = _zeta$util.pointInRect,
    mergeRect = _zeta$util.mergeRect,
    elementFromPoint = _zeta$util.elementFromPoint;


/***/ }),

/***/ 562:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mq": function() { return /* binding */ IS_MAC; },
/* harmony export */   "Dr": function() { return /* binding */ IS_TOUCH; }
/* harmony export */ });
/* unused harmony exports IS_IOS, IS_IE10, IS_IE */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var IS_IOS = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.IS_IOS,
    IS_IE10 = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.IS_IE10,
    IS_IE = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.IS_IE,
    IS_MAC = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.IS_MAC,
    IS_TOUCH = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.IS_TOUCH;


/***/ }),

/***/ 765:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ZT": function() { return /* binding */ noop; },
/* harmony export */   "wE": function() { return /* binding */ either; },
/* harmony export */   "is": function() { return /* binding */ is; },
/* harmony export */   "kJ": function() { return /* binding */ isArray; },
/* harmony export */   "mf": function() { return /* binding */ isFunction; },
/* harmony export */   "J8": function() { return /* binding */ isThenable; },
/* harmony export */   "PO": function() { return /* binding */ isPlainObject; },
/* harmony export */   "VL": function() { return /* binding */ makeArray; },
/* harmony export */   "l7": function() { return /* binding */ extend; },
/* harmony export */   "S6": function() { return /* binding */ each; },
/* harmony export */   "Yj": function() { return /* binding */ any; },
/* harmony export */   "Zr": function() { return /* binding */ single; },
/* harmony export */   "kv": function() { return /* binding */ kv; },
/* harmony export */   "ei": function() { return /* binding */ pick; },
/* harmony export */   "LX": function() { return /* binding */ mapGet; },
/* harmony export */   "M2": function() { return /* binding */ mapRemove; },
/* harmony export */   "D8": function() { return /* binding */ createPrivateStore; },
/* harmony export */   "ww": function() { return /* binding */ setTimeoutOnce; },
/* harmony export */   "XP": function() { return /* binding */ keys; },
/* harmony export */   "nr": function() { return /* binding */ hasOwnProperty; },
/* harmony export */   "Ou": function() { return /* binding */ define; },
/* harmony export */   "r9": function() { return /* binding */ definePrototype; },
/* harmony export */   "Hl": function() { return /* binding */ defineGetterProperty; },
/* harmony export */   "c": function() { return /* binding */ defineHiddenProperty; },
/* harmony export */   "w$": function() { return /* binding */ defineAliasProperty; },
/* harmony export */   "aU": function() { return /* binding */ defineObservableProperty; },
/* harmony export */   "YP": function() { return /* binding */ watch; },
/* harmony export */   "ED": function() { return /* binding */ inherit; },
/* harmony export */   "kb": function() { return /* binding */ randomId; },
/* harmony export */   "rx": function() { return /* binding */ repeat; },
/* harmony export */   "qR": function() { return /* binding */ camel; },
/* harmony export */   "rs": function() { return /* binding */ hyphenate; },
/* harmony export */   "Ps": function() { return /* binding */ ucfirst; },
/* harmony export */   "px": function() { return /* binding */ lcfirst; },
/* harmony export */   "fg": function() { return /* binding */ matchWord; },
/* harmony export */   "DB": function() { return /* binding */ resolve; },
/* harmony export */   "d1": function() { return /* binding */ reject; },
/* harmony export */   "Bx": function() { return /* binding */ always; },
/* harmony export */   "CL": function() { return /* binding */ resolveAll; },
/* harmony export */   "ZD": function() { return /* binding */ catchAsync; }
/* harmony export */ });
/* unused harmony exports isUndefinedOrNull, isArrayLike, map, grep, splice, exclude, setAdd, equal, combineFn, setImmediate, setImmediateOnce, throwNotFunction, values, getOwnPropertyDescriptors, defineOwnProperty, watchOnce, watchable, deepFreeze, iequal, trim, htmlDecode, setPromiseTimeout */
/* harmony import */ var zeta_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);

var _zeta$util = zeta_dom__WEBPACK_IMPORTED_MODULE_0__.util,
    noop = _zeta$util.noop,
    either = _zeta$util.either,
    is = _zeta$util.is,
    isUndefinedOrNull = _zeta$util.isUndefinedOrNull,
    isArray = _zeta$util.isArray,
    isFunction = _zeta$util.isFunction,
    isThenable = _zeta$util.isThenable,
    isPlainObject = _zeta$util.isPlainObject,
    isArrayLike = _zeta$util.isArrayLike,
    makeArray = _zeta$util.makeArray,
    extend = _zeta$util.extend,
    each = _zeta$util.each,
    map = _zeta$util.map,
    grep = _zeta$util.grep,
    splice = _zeta$util.splice,
    any = _zeta$util.any,
    single = _zeta$util.single,
    kv = _zeta$util.kv,
    pick = _zeta$util.pick,
    exclude = _zeta$util.exclude,
    mapGet = _zeta$util.mapGet,
    mapRemove = _zeta$util.mapRemove,
    setAdd = _zeta$util.setAdd,
    equal = _zeta$util.equal,
    combineFn = _zeta$util.combineFn,
    createPrivateStore = _zeta$util.createPrivateStore,
    setTimeoutOnce = _zeta$util.setTimeoutOnce,
    setImmediate = _zeta$util.setImmediate,
    setImmediateOnce = _zeta$util.setImmediateOnce,
    throwNotFunction = _zeta$util.throwNotFunction,
    keys = _zeta$util.keys,
    values = _zeta$util.values,
    hasOwnProperty = _zeta$util.hasOwnProperty,
    getOwnPropertyDescriptors = _zeta$util.getOwnPropertyDescriptors,
    define = _zeta$util.define,
    definePrototype = _zeta$util.definePrototype,
    defineOwnProperty = _zeta$util.defineOwnProperty,
    defineGetterProperty = _zeta$util.defineGetterProperty,
    defineHiddenProperty = _zeta$util.defineHiddenProperty,
    defineAliasProperty = _zeta$util.defineAliasProperty,
    defineObservableProperty = _zeta$util.defineObservableProperty,
    watch = _zeta$util.watch,
    watchOnce = _zeta$util.watchOnce,
    watchable = _zeta$util.watchable,
    inherit = _zeta$util.inherit,
    deepFreeze = _zeta$util.deepFreeze,
    iequal = _zeta$util.iequal,
    randomId = _zeta$util.randomId,
    repeat = _zeta$util.repeat,
    camel = _zeta$util.camel,
    hyphenate = _zeta$util.hyphenate,
    ucfirst = _zeta$util.ucfirst,
    lcfirst = _zeta$util.lcfirst,
    trim = _zeta$util.trim,
    matchWord = _zeta$util.matchWord,
    htmlDecode = _zeta$util.htmlDecode,
    resolve = _zeta$util.resolve,
    reject = _zeta$util.reject,
    always = _zeta$util.always,
    resolveAll = _zeta$util.resolveAll,
    catchAsync = _zeta$util.catchAsync,
    setPromiseTimeout = _zeta$util.setPromiseTimeout;


/***/ }),

/***/ 655:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _renderer_default_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(89);
/* harmony import */ var _globalContext_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(451);
/* harmony import */ var _core_UIToolset_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(449);
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(765);




(0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_3__/* .extend */ .l7)(_core_UIToolset_js__WEBPACK_IMPORTED_MODULE_2__/* .default */ .Z, {
  defaultRenderer: _renderer_default_index_js__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z,
  globalContext: _globalContext_js__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z
});
/* harmony default export */ __webpack_exports__["Z"] = (_core_UIToolset_js__WEBPACK_IMPORTED_MODULE_2__/* .default */ .Z);

/***/ }),

/***/ 24:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(655);
/* harmony import */ var _en_zeta_ui_datepicker_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(935);
/* harmony import */ var _en_zeta_ui_keyword_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
// @ts-nocheck



_index_js__WEBPACK_IMPORTED_MODULE_0__/* .default.i18n */ .Z.i18n('zeta.ui.datepicker', 'en', _en_zeta_ui_datepicker_json__WEBPACK_IMPORTED_MODULE_1__);
_index_js__WEBPACK_IMPORTED_MODULE_0__/* .default.i18n */ .Z.i18n('zeta.ui.keyword', 'en', _en_zeta_ui_keyword_json__WEBPACK_IMPORTED_MODULE_2__);

/***/ }),

/***/ 89:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": function() { return /* binding */ renderer_default; },
  "i": function() { return /* binding */ setDefaultTemplate; }
});

// EXTERNAL MODULE: ./build/include/external/waterpipe.js
var waterpipe = __webpack_require__(551);
// EXTERNAL MODULE: ./build/include/external/jquery.js
var jquery = __webpack_require__(571);
// EXTERNAL MODULE: ./build/include/zeta-dom/domUtil.js
var domUtil = __webpack_require__(501);
// EXTERNAL MODULE: ./build/include/zeta-dom/util.js
var util = __webpack_require__(765);
// EXTERNAL MODULE: ./build/util/common.js
var common = __webpack_require__(400);
// EXTERNAL MODULE: ./build/core/flags.js
var flags = __webpack_require__(927);
// EXTERNAL MODULE: ./build/core/UIToolset.js
var UIToolset = __webpack_require__(449);
// EXTERNAL MODULE: ./build/include/zeta-dom/env.js
var env = __webpack_require__(562);
;// CONCATENATED MODULE: ./build/util/formatShortcut.js



var MAC_CTRLKEY = {
  ctrl: "\u2318",
  alt: "\u2325",
  shift: "\u21E7",
  enter: "\u21A9",
  tab: "\u2135",
  pageUp: "\u21DE",
  pageDown: "\u21DF",
  backspace: "\u232B",
  escape: "\u238B",
  leftArrow: "\u2B60",
  upArrow: "\u2B61",
  rightArrow: "\u2B62",
  downArrow: "\u2B63",
  home: "\u2B66",
  end: "\u2B68"
};

function formatShortcutWin(value) {
  return waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
    return (0,util/* ucfirst */.Ps)(v) + '+';
  });
}

function formatShortcutMac(value) {
  var flag = {};
  var str = waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
    v = (0,util/* lcfirst */.px)(v);
    flag[v] = MAC_CTRLKEY[v];
    return '';
  });
  return (flag.alt || '') + (flag.shift || '') + (flag.ctrl || '') + (MAC_CTRLKEY[(0,util/* lcfirst */.px)(str)] || str);
}

var formatShortcut = env/* IS_MAC */.Mq ? formatShortcutMac : formatShortcutWin;
/* harmony default export */ var util_formatShortcut = (formatShortcut);
// EXTERNAL MODULE: ./build/include/zeta-dom/cssUtil.js
var cssUtil = __webpack_require__(548);
// EXTERNAL MODULE: ./build/include/zeta-dom/dom.js
var dom = __webpack_require__(358);
;// CONCATENATED MODULE: ./build/renderer/default/effects.js







function createRipple(elm, x, y, until) {
  var rect = (0,domUtil/* getRect */.Dz)(elm);
  var p1 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.left, 2);
  var p2 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.right, 2);
  var p3 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.left, 2);
  var p4 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.right, 2);
  var scalePercent = 0.5 + 2 * Math.sqrt(Math.max(p1, p2, p3, p4)) / parseFloat(jquery.css(elm, 'font-size'));
  var $overlay = jquery('<div class="zui-clickeffect"><i></i></div>').appendTo(elm);
  var $anim = $overlay.children().css({
    top: y - rect.top,
    left: x - rect.left
  });
  setTimeout(function () {
    $anim.css('transform', $anim.css('transform') + ' scale(' + scalePercent + ')').addClass('animate-in');
  });
  $overlay.css('border-radius', jquery.css(elm, 'border-radius'));
  (0,util/* always */.Bx)(until, function () {
    (0,cssUtil/* runCSSTransition */.Yr)($overlay.children()[0], 'animate-out', function () {
      $overlay.remove();
    });
  });
}

(0,domUtil/* bind */.ak)(window, env/* IS_TOUCH */.Dr ? 'touchstart' : 'mousedown', function (e) {
  // @ts-ignore: type inference issue
  var elm = jquery(e.target).closest('.zui-root .zui-button, .zui-root .zui-buttonlike')[0];

  if (elm) {
    // @ts-ignore: e can be TouchEvent
    var p = (e.touches || [e])[0];
    createRipple(elm, p.clientX, p.clientY, dom/* default.beginDrag */.ZP.beginDrag());
  }
});
/* harmony default export */ var effects = (null);
;// CONCATENATED MODULE: ./build/renderer/default/index.js









var BOOL_ATTRS = 'checked selected disabled readonly multiple ismap';
var RE_PIPE = /\{\{((?:[^\}]|\}(?!\}))+)\}\}/;
/** @type {WeakMap<any, DOMState>} */

var states = new WeakMap();
var parsedTemplates = new WeakMap();
var defaultTemplates = {};
var overrideTemplates = {};
waterpipe.pipes[":zui-shortcut"] = util_formatShortcut;
/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function DOMState() {
  this.position = null;
  this.current = null;
  this.layouts = {};
}

function _(control) {
  return (0,util/* mapGet */.LX)(states, control, DOMState);
}

function createDocumentFragment(content) {
  // @ts-ignore: type inference issue
  return (0,util.is)(content, DocumentFragment) || jquery(document.createDocumentFragment()).append(content)[0];
}

function parseTemplate(template, templates, cacheKeyObj, parentTemplateName) {
  var cached = (0,util/* mapGet */.LX)(parsedTemplates, cacheKeyObj || templates, Object)[template];

  if (cached) {
    return cached;
  }

  var index = 0;
  var binds = {
    0: []
  };
  var roles = {};

  function addBind(index, expression, name, type) {
    var arr = binds[index] || (binds[index] = []);
    arr[arr.length] = {
      type: type || 'text',
      name: name || '',
      expression: expression
    };
  }

  function extractPartialBinds(attr) {
    var partialBind;
    attr.value = attr.value.replace(/([\w-]+)\:(\{\{(?:[^\}]|\}(?!\}))+\}\})/g, function (v, a, b) {
      partialBind = true;
      return addBind(index, b, a, attr.nodeName), '';
    });
    return partialBind;
  }

  function hasOverrideTemplate(templates, roles) {
    return (0,util/* single */.Zr)(roles, function (v, i) {
      return (0,util/* hasOwnProperty */.nr)(templates, i) && i;
    });
  }

  function includeTemplate(name, node) {
    // prevent infinite recursion when mentioning the original template in overriden definition
    var haystack = parentTemplateName === name ? Object.getPrototypeOf(templates) : templates;
    var includeTemplate = haystack[name] || '<div><children controls/></div>'; // replace children placeholder with the actual child contents

    var tmp = jquery.parseHTML(includeTemplate)[0];
    jquery('children', tmp).each(function (i, v) {
      // @ts-ignore: type inference issue
      var childNodes = createDocumentFragment(v.attributes.controls && !node.childNodes[0] ? [document.createElement('controls')] : node.cloneNode(true).childNodes);
      var $controls = jquery('controls', childNodes);
      (0,common/* eachAttr */.YL)(v, function (i, v) {
        $controls.attr(i, v);
      });
      jquery(v).replaceWith(childNodes);
    }); // @ts-ignore: tmp is element

    includeTemplate = tmp.outerHTML; // check whether we can use cached template from parent
    // if such cached template does not refer to altered template by current template definitions

    var cacheKeyObj = templates;

    for (var parent = templates; parent; parent = Object.getPrototypeOf(parent)) {
      var cache = (0,util/* mapGet */.LX)(parsedTemplates, parent, Object)[includeTemplate];

      if (cache) {
        cacheKeyObj = hasOverrideTemplate(templates, cache.roles) ? templates : parent;
        break;
      }
    } // set layout type of the further included template to the included one only if this is a true control type


    var include = parseTemplate(includeTemplate, templates, cacheKeyObj, UIToolset/* default.prototype */.Z.prototype[name] ? name : parentTemplateName);
    var dom = include.dom.cloneNode(true);
    var $controls = jquery('controls', dom);
    var context = {};
    (0,common/* eachAttr */.YL)(node, function (i, v, attr) {
      if (i === 'class') {
        extractPartialBinds(attr);
        jquery(dom).addClass(attr.value);
      } else {
        var expr = RE_PIPE.test(v) && RegExp.$1;
        context[(0,util/* camel */.qR)(i)] = !expr ? (0,common/* parseTemplateConstant */.pV)(v) : {
          expression: v,
          evalAsObject: expr.length === v.length - 4
        };

        if (!expr) {
          $controls.attr(i, v);
        }
      }
    });
    (0,util/* each */.S6)(include.binds, function (i, v) {
      var j = +i + index;
      binds[j] = v.concat(binds[j] || []);
      binds[j].context = (0,util/* extend */.l7)({}, v.context, context);
    });
    roles[name] = index;
    (0,util/* each */.S6)(include.roles, function (i, v) {
      roles[i] = +v + index;
    });
    index += include.nodeCount;
    jquery(dom).addClass('zui-' + name.toLowerCase());
    return dom;
  }

  function processDOM(element) {
    var nodeToReplace = new Map();
    var iterator = (0,domUtil/* createTreeWalker */.Xd)(element, 5, function (v) {
      // @ts-ignore: tagName return empty for non-element
      if (/z\:([\w-]+)/.test((0,domUtil/* tagName */.a2)(v))) {
        nodeToReplace.set(v, includeTemplate((0,util/* camel */.qR)(RegExp.$1), v));
        return 2;
      }

      return 1;
    });
    (0,domUtil/* iterateNode */.Jn)(iterator, function (v) {
      if (v.nodeType === 1) {
        (0,common/* eachAttr */.YL)(v, function (i, w, attr) {
          if (RE_PIPE.test(w) && (!(0,util/* matchWord */.fg)(i, 'class style') || !extractPartialBinds(attr))) {
            addBind(index, w, i, (0,util/* matchWord */.fg)(i, BOOL_ATTRS) && i in v ? 'prop' : 'attr');
            attr.value = '';
          }
        });
        index++; // @ts-ignore: v is text node
      } else if (RE_PIPE.test(v.data)) {
        if (v.previousSibling || v.nextSibling) {
          // @ts-ignore: v is text node
          addBind(index, v.data);
          nodeToReplace.set(v, document.createElement('span'));
          index++;
        } else {
          // @ts-ignore: v is text node
          addBind(index - 1, v.data);
        } // @ts-ignore: v is text node


        v.data = '';
      }
    });
    nodeToReplace.forEach(function (v, i) {
      jquery(i).replaceWith(v);
    });
    return element.childNodes[0];
  }

  var result = {
    dom: processDOM(createDocumentFragment(jquery.parseHTML(template)[0])),
    roles: waterpipe.eval('sortby [ . ]', roles),
    binds: binds,
    nodeCount: index
  };
  cacheKeyObj = cacheKeyObj || templates;

  do {
    (0,util/* mapGet */.LX)(parsedTemplates, cacheKeyObj, Object)[template] = result;
  } while (cacheKeyObj !== defaultTemplates && !hasOverrideTemplate(cacheKeyObj, roles) && (cacheKeyObj = Object.getPrototypeOf(cacheKeyObj)));

  return result;
}

function evalTemplate(expression, context, globals, evalAsObject) {
  var options = {
    globals: globals
  };
  return evalAsObject ? waterpipe.eval(expression.slice(2, -2), context, options) : waterpipe(expression, context, options);
}
/* --------------------------------------
 * UIControlDOM
 * -------------------------------------- */


function UIControlDOM(control, layoutType) {
  var self = this;
  var template = parseTemplate(control.template || '<z:' + (0,util/* hyphenate */.rs)(control.type) + '/>', overrideTemplates[layoutType] || defaultTemplates);
  var element = template.dom.cloneNode(true);
  var nodes = (0,domUtil/* iterateNodeToArray */.X2)((0,domUtil/* createNodeIterator */.pf)(element, 1));
  var bindedNode = nodes.filter(function (v, i) {
    return template.binds[i];
  });
  var positions = waterpipe.eval('sortby [ ! condition ]', jquery('controls', element).map(function (i, v) {
    return new UIControlDOMPosition(control, v);
  }).get());
  self.control = control;
  self.element = element;
  self.roles = template.roles;
  self.binds = template.binds;
  self.bindedNode = bindedNode;
  self.positions = positions;
  self.layoutType = layoutType;

  if (control.cssClass) {
    jquery(element).addClass(control.cssClass);
  }

  _(control).current = self; // bind all defined event handlers to the cloned element
  // assign element to control so that handlers can be registered to correct element

  control.element = element;
  control.on('stateChange', function () {
    // @ts-ignore: type inference issue
    self.update();
  });
}

(0,util/* definePrototype */.r9)(UIControlDOM, {
  update: function update() {
    var self = this;
    var element = self.element;
    var control = self.control;

    if (control.parent) {
      appendControl(control, control.parent);
    }

    var position = _(control).position;

    if (!position) {
      return;
    }

    var reBold = /\*\*(([^*]|\*(?!\*))+)\*\*/g;
    var reItalic = /\*([^*]+)\*/g;
    var context = control.getTemplateContext();
    var index = 0;
    (0,util/* each */.S6)(self.binds, function (i, v) {
      var node = self.bindedNode[index++];
      var globals = (0,util/* extend */.l7)({}, position.context);
      (0,util/* each */.S6)(v.context, function (i, v) {
        globals[i] = !v.expression ? v : evalTemplate(v.expression, context, null, v.evalAsObject);
      });
      (0,util/* each */.S6)(v, function (i, v) {
        var value = evalTemplate(v.expression, context, globals, v.type === 'class' || v.type === 'prop');

        switch (v.type) {
          case 'class':
            return (0,domUtil/* setClass */.w)(node, v.name, value);

          case 'style':
            return jquery(node).css(v.name, value);

          case 'prop':
            node[v.name] = !!value;
            return;

          case 'attr':
            value = value.replace(reBold, '$1').replace(reItalic, '$1');
            return jquery(node).attr(v.name, value || null);
        }

        value = value.replace(reBold, '<b>$1</b>').replace(reItalic, '<i>$1</i>').replace(/\n/g, '<br>');

        if (value !== node.innerHTML) {
          node.innerHTML = value;
        }
      });
    });
    (0,domUtil/* setClass */.w)(element, {
      active: context.active,
      loading: context.pending,
      error: context.errors,
      disabled: !context.enabled,
      hidden: !context.visible,
      focused: context.focused && context.focusedBy
    });

    if ('disabled' in element) {
      // @ts-ignore: disabled checked for existence
      element.disabled = !context.enabled;
    }

    if (control.controls[1]) {
      var map = new Map();
      (0,util/* each */.S6)(control.controls, function (i, v) {
        map.set(v.element, i);
      }); // perform bubble sort for controls in each position

      (0,util/* each */.S6)(self.positions, function (k, v) {
        for (var j = v.count - 1; j > 0; j--) {
          // @ts-ignore: type inferene issue
          for (var i = 0, cur = v.start; i < j; i++, cur = cur.nextSibling) {
            if (map.get(cur) > map.get(cur.nextSibling)) {
              // @ts-ignore: type inferene issue
              jquery(cur.nextSibling).insertBefore(cur); // @ts-ignore: type inferene issue

              cur = cur.previousSibling;

              if (i === 0) {
                v.start = cur;
              } else if (i === v.count - 1) {
                // @ts-ignore: type inferene issue
                v.end = cur.nextSibling;
              }
            }
          }
        }
      });
    }

    (0,util/* each */.S6)(control.controls, function (i, v) {
      appendControl(v, control);
    });
  }
});
/* --------------------------------------
 * UIControlDOMPosition
 * -------------------------------------- */

function UIControlDOMPosition(control, placeholder) {
  placeholder = placeholder || document.createElement('controls');
  placeholder.style.display = 'none!important';
  var context = {};
  (0,common/* eachAttr */.YL)(placeholder, function (i, v) {
    context[(0,util/* camel */.qR)(i)] = (0,common/* parseTemplateConstant */.pV)(v);
  });
  var self = this;
  self.control = control;
  self.context = context;
  self.placeholder = placeholder;
  self.condition = context.of || '';
  self.layoutType = context.layout || control.type || 'default';
  self.start = placeholder;
  self.end = placeholder;
  self.count = 0;
}

(0,util/* definePrototype */.r9)(UIControlDOMPosition, {
  get enabled() {
    return this.control.enableChildren !== false;
  }

});
/* --------------------------------------
 * Exports
 * -------------------------------------- */

/**
 * @param {ZetaUI.UIControl} control
 * @param {ZetaUI.UIControl | Internal.UIEventContainer} parent
 * @param {boolean=} suppressEvent
 */

function appendControl(control, parent, suppressEvent) {
  var state = _(control);

  var parentState = _(parent);

  if (!parentState.current) {
    parentState.current = {
      positions: []
    };
  } // compute and update if this control should be positioned in different location


  var positions = parentState.current.positions;
  var prevPos = state.position;
  var nextPos;

  if (!positions[0]) {
    nextPos = new UIControlDOMPosition(parent); // @ts-ignore: fallback for parent with no type

    nextPos.layoutType = parent.type || '';
    jquery(nextPos.placeholder).appendTo(parent.element);
    positions[0] = nextPos;
  } else {
    var context = control.getTemplateContext();
    nextPos = (0,util/* any */.Yj)(positions, function (v) {
      return !v.condition || waterpipe.eval(v.condition, context);
    }); // clear flags because the state may be invalid when building control tree

    (0,flags/* clearFlag */.R0)(control);
  }

  if (prevPos === nextPos) {
    return;
  }

  var prev = state.current;
  var next = prev;

  if (prev) {
    removeControl(control);
  }

  state.position = nextPos;

  if (nextPos) {
    var layoutType = nextPos.layoutType;

    if (!prev || layoutType !== prev.layoutType) {
      next = state.layouts[layoutType] || (state.layouts[layoutType] = new UIControlDOM(control, layoutType));
      state.current = next; // @ts-ignore: internal update read-only property

      control.element = next.element;
    }

    var element = control.element;

    if (!nextPos.count) {
      jquery(nextPos.start).replaceWith(element);
      nextPos.start = nextPos.end = element;
    } else {
      jquery(element).insertAfter(nextPos.end);
      nextPos.end = element;
    }

    nextPos.count++;

    if (parent && !suppressEvent && next !== prev) {
      next.update();
    }
  }
}
/**
 * @param {ZetaUI.UIControl} control
 */


function removeControl(control) {
  var elm = control.element;
  var pos = (0,util/* mapGet */.LX)(states, control, DOMState).position;

  if (pos.count === 1) {
    pos.start = pos.end = jquery(pos.placeholder).insertBefore(elm)[0];
  } else if (pos.start === elm) {
    pos.start = elm.nextSibling;
  } else if (pos.end === elm) {
    pos.end = elm.previousSibling;
  }

  pos.count--;
  (0,domUtil/* removeNode */.ZF)(elm);
}
/** @type {ZetaUI.UIControlRenderer} */


var defaultRenderer = {
  append: appendControl,
  remove: removeControl,
  getElementForRole: function getElementForRole(control, role) {
    var dom = _(control).current;

    return dom.bindedNode[(0,util/* keys */.XP)(dom.binds).indexOf(String(dom.roles[role]))];
  },
  getRoles: function getRoles(control) {
    var dom = _(control).current;

    return (0,util/* keys */.XP)(dom.roles);
  },
  isEnabled: function isEnabled(control) {
    var pos = _(control).position;

    return !pos || pos.enabled;
  }
};
/* harmony default export */ var renderer_default = (defaultRenderer);
function setDefaultTemplate(type, template, overrides) {
  defaultTemplates[type] = template;
  overrideTemplates[type] = overrides && (0,util/* inherit */.ED)(defaultTemplates, overrides);
}

/***/ }),

/***/ 400:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JG": function() { return /* binding */ copy; },
/* harmony export */   "YL": function() { return /* binding */ eachAttr; },
/* harmony export */   "pV": function() { return /* binding */ parseTemplateConstant; },
/* harmony export */   "zu": function() { return /* binding */ createNamedFunction; }
/* harmony export */ });
/* harmony import */ var _include_external_waterpipe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(551);
/* harmony import */ var _include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(765);


function copy(dst, src) {
  // use each() instead of extend()
  // to ensure all values copied even if the value is undefined
  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .each */ .S6)(src, function (i, v) {
    dst[i] = v;
  });
  return dst;
}
function eachAttr(node, callback) {
  (0,_include_zeta_dom_util_js__WEBPACK_IMPORTED_MODULE_1__/* .each */ .S6)(node.attributes, function (i, v) {
    callback(v.nodeName, v.value, v);
  });
}
function parseTemplateConstant(value) {
  return _include_external_waterpipe_js__WEBPACK_IMPORTED_MODULE_0__.eval('"' + value + '"');
}
function createNamedFunction(name, body) {
  if (!/^[$_a-z][$_a-z0-9]*$/i.test(name)) {
    throw new Error('Invalid function name \'' + name + '\'');
  }

  return new Function('fn', 'return function ' + name + '() { return fn.apply(this, arguments) }')(body);
}

/***/ }),

/***/ 609:
/***/ (function(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__609__;

/***/ }),

/***/ 804:
/***/ (function(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__804__;

/***/ }),

/***/ 160:
/***/ (function(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__160__;

/***/ }),

/***/ 163:
/***/ (function(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__163__;

/***/ }),

/***/ 47:
/***/ (function(module) {

"use strict";
if(typeof __WEBPACK_EXTERNAL_MODULE__47__ === 'undefined') { var e = new Error("Cannot find module 'undefined'"); e.code = 'MODULE_NOT_FOUND'; throw e; }

module.exports = __WEBPACK_EXTERNAL_MODULE__47__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	!function() {
/******/ 		var getProto = Object.getPrototypeOf ? function(obj) { return Object.getPrototypeOf(obj); } : function(obj) { return obj.__proto__; };
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach(function(key) { def[key] = function() { return value[key]; }; });
/******/ 			}
/******/ 			def['default'] = function() { return value; };
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(594);
/******/ })()
.default;
});
//# sourceMappingURL=zeta-ui.js.map