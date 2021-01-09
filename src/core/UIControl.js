import dom from "../include/zeta-dom/dom.js";
import $ from "../include/external/jquery.js";
import { cancelLock, lock } from "../include/zeta-dom/domLock.js";
import { comparePosition, containsOrEquals, removeNode } from "../include/zeta-dom/domUtil.js";
import { ZetaEventContainer } from "../include/zeta-dom/events.js";
import { always, any, createPrivateStore, defineAliasProperty, defineGetterProperty, defineHiddenProperty, defineObservableProperty, definePrototype, each, either, extend, hasOwnProperty, is, isFunction, isPlainObject, isThenable, kv, makeArray, mapGet, mapRemove, matchWord, pick, randomId, reject, resolve, resolveAll, single, ucfirst, watch } from "../include/zeta-dom/util.js";
import { copy } from "../util/common.js";
import { clearFlag, FLAG_ACTIVE, FLAG_ENABLED, FLAG_VISIBLE, initFlagState, isActive, isEnabled, isHidden, setFlag } from "./flags.js";
import DisplayValue from "./DisplayValue.js";
import UIContext from "./UIContext.js";
import UIToolsetState from "./UIToolsetState.js";
import globalContext from "../globalContext.js";

const CONST_PROPS = 'element name type parent all controls context previousSibling nextSibling';
const RE_PIPE = /\{\{((?:[^\}]|\}(?!\}))+)\}\}/;

const speciesMap = new WeakMap();
const executingControls = new Set();
const importedControls = new Map();
const exportedControls = {};
const inheritedValues = {};
const eventHandlers = {};
const unhandlaebleOption = Object.freeze({
    handleable: false
});

/** @type {Zeta.PrivateStore<ZetaUI.UIControl, Internal.UIControlState> & Zeta.PrivateStore<UIContext, Internal.UIEventContainer>} */
// @ts-ignore: type inference issue
const _ = createPrivateStore();

var invalidElements;


/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function getUniqueName(all, name) {
    for (var i = 0; all[name + (i || '')]; i++);
    return name + (i || '');
}

/**
 * @param {string} type
 * @param {string | object} event
 * @param {Zeta.AnyFunction=} handler
 */
function setEventHandlers(type, event, handler) {
    eventHandlers[type] = isPlainObject(event) || kv(event, handler);
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
        var control;
        // @ts-ignore: type inference issue
        for (var cur = e.target; !control && cur && cur !== element; cur = cur.parentNode) {
            control = container.getContexts(cur)[0];
        }
        if (control && isEnabled(control)) {
            container.emit(e, e.target === element ? control.element : undefined);
            if (matchWord(e.type, 'focusin focusout')) {
                // @ts-ignore: internal update read-only property
                control.focusedBy = e.source;
                emitStateChange(control);
            } else if (matchWord(e.type, 'asyncStart asyncEnd')) {
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
    var context = new UIContext(_, values);
    var parentContext = dom.context;
    var parentElement = null;
    var parentControl = any(executingControls, function (v) {
        return dom.focused(v.element);
    });
    if (parentControl) {
        parentContext = parentControl.context;
        parentElement = parentControl.element;
    } else if (is(parentContext, UIContext)) {
        var parentContainer = _(parentContext);
        // @ts-ignore: type inference issue
        parentElement = parentContainer.event && parentContainer.event.context.element;
    }
    $(element).addClass('zui-root');

    var container = createEventContainer(element, context);
    extend(container, {
        toolset: getSpeciesSpec(species).toolset,
        toolsetStates: new Map(),
        parentContext: parentContext,
        parentElement: parentElement,
        getSpeciesSpec: getSpeciesSpec,
        renderer: renderer
    });
    _(context, container);
    appendControls(container, null, [species], true);
    container.flushEvents();
    return container.context;
}

/**
 * @param {ZetaUI.UIControl} control
 */
function createInnerContext(control) {
    var state = _(control);
    if (!is(state.childContext, UIContext)) {
        var context = new UIContext(_);
        if (!('value' in state.options)) {
            state.value = context;
            defineGetterProperty(control.context, control.name, function () {
                return context;
            }, function (value) {
                var oldValue = extend({}, context);
                emitPropertyChange(control, 'value', oldValue, extend(context, value));
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
    each(species, function (i, v) {
        var spec = container.getSpeciesSpec(v);
        if (spec.type === 'import') {
            mapGet(importedControls, parent, Object)[spec.name] = true;
            appendControls(container, parent, exportedControls[spec.name] || [], true, spec.options);
        } else {
            var control = new spec.ctor(container, v, parent, allowExport, options);
            container.renderer.append(control, parent || container, true);
            appendControls(container, control, makeArray(spec.options.controls));
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
            each(parent.controls, function (i, v) {
                defaultOrder.set(v, i);
            });
            parent.controls.sort(function (a, b) {
                function m(a, b, prop, mult) {
                    return !a[prop] ? 0 : a[prop] === '*' || matchWord(b.name, a[prop]) ? mult : -mult;
                }
                var a1 = m(a, b, 'after', 1);
                var a2 = m(a, b, 'before', -1);
                var b1 = m(b, a, 'after', -1);
                var b2 = m(b, a, 'before', 1);
                if (either(!a1 && !a2, !b1 && !b2)) {
                    return a1 || a2 || b1 || b2;
                }
                return (a1 + a2 + b1 + b2) || defaultOrder.get(a) - defaultOrder.get(b);
            });
        }
        emitStateChange(parent);
    }
}

function foreachControl(control, callback, enabledOnly) {
    if (!enabledOnly || isEnabled(control)) {
        callback(control);
        each(control.controls, function (i, v) {
            foreachControl(v, callback, enabledOnly);
        });
    }
}

/**
 * @param {ZetaUI.UIControl} control
 */
function setInitial(control) {
    var state = _(control);
    var values = state.initialValues;
    each(Object.getOwnPropertyNames(control), function (i, v) {
        if (!matchWord(v, CONST_PROPS)) {
            values[v] = control[v];
        }
    });
    copy(values, state.values);
    defineHiddenProperty(values, 'value', state.value);
}

/**
 * @param {ZetaUI.UIControl} control
 * @param {*} newValue
 * @param {boolean=} suppressEvent
 */
function setValue(control, newValue, suppressEvent) {
    var state = _(control);
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
    if (isEnabled((control))) {
        if (control.required && !control.value) {
            result = reject('required');
        } else {
            result = emitEvent(control, 'validate');
        }
    }
    if (result) {
        result.then(function () {
            control.errors = null;
        }, function (errors) {
            if (isPlainObject(errors)) {
                control.errors = errors;
            } else {
                var obj = {};
                each(makeArray(errors), function (i, v) {
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
    var focusOnFailed = !invalidElements && !matchWord(dom.getEventSource(control.element), 'script touch');
    var failed = invalidElements || (focusOnFailed && (invalidElements = []));
    var promises = [];
    _(control).container.flushEvents();
    foreachControl(control, function (v) {
        var promise = validate(v);
        if (promise) {
            promise.catch(function () {
                if (failed && !any(failed, function (w) {
                    return containsOrEquals(v.element, w);
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
        var promise = resolveAll(promises);
        promise.catch(function () {
            if (focusOnFailed && !any(failed, function (v) {
                return dom.focused(v);
            })) {
                failed.sort(comparePosition);
                dom.focus(failed[0]);
            }
        });
        return promise;
    }
}

/**
 * @param {ZetaUI.UIControl} control
 */
function reset(control) {
    var state = _(control);
    var initialValues = state.initialValues;
    control.errors = null;
    clearFlag(control);
    if (initialValues) {
        // use each() instead of extend()
        // to ensure all values copied even if the value is undefined
        each(initialValues, function (i, v) {
            (i in state.values ? state.values : control)[i] = v;
        });
        setValue(control, initialValues.value, true);
    }
    emitEvent(control, 'reset', null, unhandlaebleOption);
    emitStateChange(control);
}

function getLabel(source, name) {
    var labels = source.toolset.labels;
    if (name in labels) {
        getLabel.value = String(labels[name][globalContext.language] || labels[name].default || '');
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
        var state = _(control);
        var displayValue = prop !== 'icon' && (getLabel(state.container, value) || getLabel(state, value)) ? getLabel.value : value;
        var needEvaluate = RE_PIPE.test(displayValue);
        if (displayValue !== value || needEvaluate) {
            return new DisplayValue(control, prop, value, displayValue, needEvaluate, fireEvent);
        }
    }
    return value;
}

/**
 * @param {string | object} name
 * @param {any=} defaultValue
 */
function defineInheritedProperty(name, defaultValue) {
    each(isPlainObject(name) || kv(name, defaultValue), function (i, v) {
        inheritedValues[i] = v;
        listenProperty(UIControl.prototype, i);
    });
}

/**
 * @param {ZetaUI.UIControl | null} control
 */
function getInheritProperty(control, name) {
    for (; control; control = control.parent) {
        var dict = _(control).values;
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
    if (!(prop in proto) && !matchWord(prop, CONST_PROPS)) {
        defineGetterProperty(proto, prop, function () {
            var self = this;
            var value = hasOwnProperty(inheritedValues, prop) ? getInheritProperty(self, prop) : _(self).values[prop];
            return is(value, DisplayValue) ? value.lastValue : value;
        }, function (value) {
            var self = this;
            var dict = _(self).values;
            var dv = is(dict[prop], DisplayValue);
            if (value !== dict[prop] && (!dv || value !== dv.rawValue)) {
                var isInherited = hasOwnProperty(inheritedValues, prop);
                var oldValue = dv ? dv.lastValue : dict[prop];
                if (isInherited && (value === null || value === undefined)) {
                    delete dict[prop];
                } else {
                    dict[prop] = wrapValue(self, prop, value);
                }
                var newValue = self[prop];
                if (_(self).inited) {
                    emitPropertyChange(self, prop, oldValue, newValue);
                    if (isInherited) {
                        var notifyChildren = function (cur) {
                            each(cur.controls, function (i, v) {
                                if (!(prop in _(v).values)) {
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
        each(mapGet(speciesMap, proto), function (i, v) {
            _(v).values[prop] = wrapValue(v, prop, v[prop]);
            delete v[prop];
            // need to also wrap value of initial values
            // so that it will be properly displayed after reset
            var initialValues = _(v).initialValues;
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
    var name = control.name + (isDefault ? '' : ucfirst(prop));
    if (isFunction(control[prop])) {
        defineHiddenProperty(context, name, control[prop].bind(control));
    } else {
        if (hasOwnProperty(context, name)) {
            control[prop] = context[name];
        }
        defineAliasProperty(context, name, control, prop);
    }
    _(control).exports.push(name);
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
    each(importedControls, function (i, v) {
        if (v[id]) {
            appendControls(_(i).container, i, newControls, true, {});
        }
    });
}

/**
 * @param {Element} element
 * @param {string} role
 */
function hasRole(element, role) {
    var context = is(dom.getEventContext(element).context, UIContext);
    var control = context && _(context).getContexts(element)[0];
    return control && single(role, function (v) {
        // @ts-ignore
        return control.hasRole(v);
    });
}


/* --------------------------------------
 * Events
 * -------------------------------------- */

function emitEvent(control, event, data, bubble) {
    return _(control).container.emit(event, control, data, bubble);
}

function emitAsyncEvent(control, event, data, bubble, callback) {
    return _(control).container.emitAsync(event, control, data, bubble, callback);
}

function emitStateChange(control, recursive) {
    emitAsyncEvent(control, 'stateChange', null, unhandlaebleOption);
    if (recursive) {
        for (var cur = control.parent; cur && cur.requireChildControls; cur = cur.parent) {
            clearFlag(cur);
            emitAsyncEvent(cur, 'stateChange', null, unhandlaebleOption);
        }
    }
}

function emitPropertyChange(control, property, oldValue, newValue) {
    emitAsyncEvent(control, 'propertyChange', {
        oldValues: kv(property, oldValue),
        newValues: kv(property, newValue)
    }, false, function (v, a) {
        a.oldValues = copy(a.oldValues, v.oldValues);
        a.newValues = copy(v.newValues, a.newValues);
        return a;
    });
    var state = _(control);
    each(state.values, function (i, v) {
        if (i !== property && is(v, DisplayValue) && v.needEvaluate) {
            v.getValue(control, i, true);
        }
    });
    clearFlag(control);
    emitStateChange(control, true);
}

/**
 * @param {ZetaUI.UIControl} control
 * @param {Partial<ZetaUI.UIControl>} oldValues
 * @param {Partial<ZetaUI.UIControl>} newValues
 */
function handlePropertyChange(control, oldValues, newValues) {
    var state = _(control);
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
        each(container.renderer.getRoles(control), function (i, v) {
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
    var requireScope = !allowExport && parent && _(parent).toolset !== spec.toolset;
    // @ts-ignore: checked for parent
    var context = requireScope ? createInnerContext(parent) : (parent && _(parent).childContext) || (parent || container).context;
    var toolsetState = mapGet(container.toolsetStates, spec.toolset, function () {
        // @ts-ignore: type inference issue
        return new UIToolsetState(container, spec.toolset, context);
    });
    var name = getUniqueName(toolsetState.all, spec.name);
    var state = _(self, {
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
    watch(self, true);
    watch(self, function (e) {
        handlePropertyChange(self, e.oldValues, e.newValues);
    });
    initFlagState(self, state);
    mapGet(speciesMap, Object.getPrototypeOf(self), Set).add(self);

    self.required = false;
    each(spec.options, function (i, v) {
        if (!isFunction(v) && !isFunction(self[i])) {
            self[i] = v;
        }
    });
    each(extraOptions, function (i, v) {
        if (!isFunction(v) && !isFunction(self[i])) {
            self[i] = v;
        }
    });
    if (self.label === undefined) {
        self.label = spec.name;
    }
    if (typeof spec.options.execute === 'string') {
        self.shortcut = dom.getShortcut(spec.options.execute)[0];
    }
    extend(self, {
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
        id: randomId(),
        all: toolsetState.all
    })
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
    each(spec.options.exports, function (i, v) {
        exportProperty(self, context, v);
    });
    state.inited = true;
}

definePrototype(UIControl, {
    get previousSibling() {
        var element = this.element;
        return element && _(this).container.getContexts(element.previousSibling)[0] || null;
    },
    get nextSibling() {
        var element = this.element;
        return element && _(this).container.getContexts(element.nextSibling)[0] || null;
    },
    get focused() {
        return dom.focused(this.element);
    },
    get pending() {
        return dom.locked(this.element);
    },
    get enabled() {
        return isEnabled(this);
    },
    set enabled(value) {
        setFlag(this, FLAG_ENABLED, value);
    },
    get active() {
        return isActive(this);
    },
    set active(value) {
        setFlag(this, FLAG_ACTIVE, value);
    },
    get visible() {
        return !isHidden(this);
    },
    set visible(value) {
        setFlag(this, FLAG_VISIBLE, value);
    },
    get value() {
        return _(this).value;
    },
    /** @this {ZetaUI.UIControl} */
    set value(value) {
        setValue(this, value);
    },
    /** @this {ZetaUI.UIControl} */
    setValue: function (value) {
        return setValue(this, value);
    },
    /** @this {ZetaUI.UIControl} */
    contains: function (control) {
        for (var cur = control; cur && cur !== this; cur = cur.parent);
        return !!cur;
    },
    /** @this {ZetaUI.UIControl} */
    getTemplateContext: function (raw) {
        var self = this;
        var state = _(self);
        var proto = Object.getPrototypeOf(self);
        var values = {};
        if (raw) {
            var copyValue = function (prop) {
                values[prop] = self[prop];
            };
            Object.getOwnPropertyNames(self).forEach(copyValue);
            Object.getOwnPropertyNames(state.options).forEach(copyValue);
            extend(values, state.values);
            values.value = state.value;
        } else {
            extend(values, self);
        }
        each(values, function (i) {
            if (!(i in proto) && !matchWord(i, CONST_PROPS)) {
                defineGetterProperty(values, i, function () {
                    listenProperty(proto, i);
                    return self[i];
                });
            }
        });
        return values;
    },
    /** @this {ZetaUI.UIControl} */
    getElementForRole: function (role) {
        return _(this).container.renderer.getElementForRole(this, role);
    },
    /** @this {ZetaUI.UIControl} */
    hasRole: function (role) {
        return !!this.getElementForRole(role);
    },
    /** @this {ZetaUI.UIControl} */
    on: function (event, handler) {
        return _(this).container.add(this, event, handler);
    },
    /** @this {ZetaUI.UIControl} */
    watch: function (prop, handler, fireInit) {
        var self = this;
        listenProperty(Object.getPrototypeOf(self), prop);
        if (isFunction(handler)) {
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
    focus: function () {
        if (isEnabled(this)) {
            dom.focus(this.element);
        }
    },
    /** @this {ZetaUI.UIControl} */
    validate: function () {
        return resolve(validateAll(this));
    },
    /** @this {ZetaUI.UIControl} */
    execute: function (value) {
        var self = this;
        if (!isEnabled(self) || isHidden(self) || executingControls.has(self)) {
            return reject();
        }
        if (value !== undefined) {
            self.value = value;
        }
        var finish = function (resolved, data) {
            executingControls.delete(self);
            if (resolved) {
                emitEvent(self, 'executed', { data }, unhandlaebleOption);
                if (self.parent) {
                    emitEvent(self.parent, 'childExecuted', { control: self }, { bubbles: true, handleable: false });
                }
            }
            emitEvent(self, 'afterExecute', resolved, unhandlaebleOption);
        };
        var run = function () {
            var promise;
            emitEvent(self, 'beforeExecute', null, unhandlaebleOption);
            executingControls.add(self);
            try {
                var command = _(self).options.execute;
                if (typeof command === 'string') {
                    promise = dom.emit(command, self.value, true);
                } else if (isFunction(command)) {
                    // @ts-ignore: type inference issue
                    promise = command.call(self, self);
                }
            } catch (e) {
                console.error(e);
                promise = reject(e);
            }
            if (self.waitForExecution && isThenable(promise)) {
                promise = lock(self.element, promise, function () {
                    return emitEvent(self, 'cancel') || reject();
                });
                always(promise, finish);
                return promise;
            }
            finish(true);
            return resolve();
        };
        var promise = validateAll(self);
        return promise ? promise.then(run) : run();
    },
    /** @this {ZetaUI.UIControl} */
    reset: function () {
        foreachControl(this, reset);
    },
    /** @this {ZetaUI.UIControl} */
    append: function (control, clear) {
        var self = this;
        if (clear) {
            each(self.controls.slice(0), function (i, v) {
                v.destroy();
            });
        }
        appendControls(_(self).container, self, makeArray(control));
    },
    /** @this {ZetaUI.UIControl} */
    destroy: function () {
        var self = this;
        if (self.pending) {
            cancelLock(self.element, true);
        }
        always(emitEvent(self, 'beforeDestroy'), function () {
            var container = _(self).container;
            mapRemove(importedControls, self);
            foreachControl(self, function (v) {
                var state = _(v);
                var species = mapGet(speciesMap, Object.getPrototypeOf(v));
                delete v.all[v.name];
                if (v.parent && v.parent.all[v.name] === v) {
                    delete v.parent.all[v.name];
                }
                each(state.exports, function (i, w) {
                    delete v.context[w];
                });
                species.delete(v);
                container.delete(self);
            });
            if (self.parent) {
                var arr = self.parent.controls;
                arr.splice(arr.indexOf(self), 1);
                container.renderer.remove(self);
                clearFlag(self.parent);
                emitStateChange(self.parent);
            } else {
                // ensure all other resources can be garbage collected
                setTimeout(function () {
                    container.destroy();
                });
                removeNode(container.autoDestroy ? container.element : self.element);
            }
        });
    }
});

defineObservableProperty(UIControl.prototype, 'element');

each('icon label errors placeholder description', function (i, v) {
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

export default UIControl;

export {
    createContext,
    emitEvent,
    emitStateChange,
    emitPropertyChange,
    defineInheritedProperty,
    setEventHandlers,
    exportControls,
    foreachControl,
    hasRole
};
