(function ($, zeta) {
    'use strict';

    var MAC_CTRLKEY = JSON.parse('{"ctrl":"\u2318","alt":"\u2325","shift":"\u21e7","enter":"\u21a9","tab":"\u2135","pageUp":"\u21de","pageDown":"\u21df","backspace":"\u232b","escape":"\u238b","leftArrow":"\u2b60","upArrow":"\u2b61","rightArrow":"\u2b62","downArrow":"\u2b63","home":"\u2b66","end":"\u2b68"}');
    var BOOL_ATTRS = 'checked selected disabled readonly multiple ismap';
    var CONST_PROPS = 'element name type parent all controls context previousSibling nextSibling';
    var FLAG_NAMES = 'enabled active visible'.split(' ');
    var RE_PIPE = /\{\{((?:[^\}]|\}(?!\}))+)\}\}/;

    var WeakMap = shim.WeakMap;
    var Map = shim.Map;
    var Set = shim.Set;
    var hasOwnProperty = Object.hasOwnProperty;
    var getPrototypeOf = Object.getPrototypeOf;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var waterpipe = window.waterpipe;
    var helper = zeta.helper;
    var dom = zeta.dom;
    var any = helper.any;
    var camel = helper.camel;
    var createDocumentFragment = helper.createDocumentFragment;
    var defineGetterProperty = helper.defineGetterProperty;
    var defineHiddenProperty = helper.defineHiddenProperty;
    var definePrototype = helper.definePrototype;
    var each = helper.each;
    var extend = helper.extend;
    var inherit = helper.inherit;
    var is = helper.is;
    var isFunction = helper.isFunction;
    var isPlainObject = helper.isPlainObject;
    var kv = helper.kv;
    var makeArray = helper.makeArray;
    var mapGet = helper.mapGet;
    var matchWord = helper.matchWord;
    var noop = helper.noop;
    var randomId = helper.randomId;
    var reject = helper.reject;
    var removeNode = helper.removeNode;
    var runCSSTransition = helper.runCSSTransition;
    var setState = helper.setState;
    var tagName = helper.tagName;
    var when = helper.when;

    var speciesMap = new WeakMap();
    var parsedTemplates = new WeakMap();
    var executingControls = new Set();
    var controlTypes = {};
    var exportedLabels = {};
    var exportedControls = {};
    var defaultTemplates = {};
    var inheritedValues = {};
    var _ = helper.createPrivateStore();

    var globalContext = {
        language: 'en'
    };

    function copy(dst, src) {
        // use each() instead of extend()
        // to ensure all values copied even if the value is undefined
        each(src, function (i, v) {
            dst[i] = v;
        });
        return dst;
    }

    function parseConstant(value) {
        return waterpipe.eval('"' + value + '"');
    }

    function eachAttr(node, callback) {
        each(node.attributes, function (i, v) {
            callback(v.nodeName, v.value, v);
        });
    }

    function objGet(obj, key, fn) {
        return obj[key] || (obj[key] = new fn());
    }

    function addLabels(obj, language, key, value) {
        if (isPlainObject(key)) {
            return each(key, addLabels.bind(null, obj, language));
        }
        objGet(obj, key, Object)[language || 'default'] = value;
    }

    function inheritTemplates(a, b) {
        // return the same base instance if there is no template is overriden
        a = a.templates || defaultTemplates;
        b = b.templates;
        return b && b !== defaultTemplates ? inherit(a, b) : a;
    }

    function evalTemplate(expression, context, globals, evalAsObject) {
        var options = kv('globals', globals);
        return evalAsObject ? waterpipe.eval(expression.slice(2, -2), context, options) : waterpipe(expression, context, options);
    }

    function defineInheritedProperty(name, defaultValue) {
        each(isPlainObject(name) || kv(name, defaultValue), function (i, v) {
            inheritedValues[i] = v;
            listenProperty(UIControl.prototype, i);
        });
    }

    function getInheritProperty(control, name) {
        for (; control; control = control.parent) {
            var dict = _(control).values;
            if (name in dict) {
                return dict[name];
            }
        }
        return inheritedValues[name];
    }

    function foreachControl(control, callback, enabledOnly) {
        if (!enabledOnly || isEnabled(control)) {
            callback(control);
            each(control.controls, function (i, v) {
                foreachControl(v, callback, enabledOnly);
            });
        }
    }

    function triggerEvent(control, event, data, bubble) {
        return _(control).container.emit(event, control.element || control, data, bubble);
    }

    function triggerAsyncEvent(control, event, data, bubble, callback) {
        return _(control).container.emitAsync(event, control.element || control, data, bubble, callback);
    }

    function registerStateChange(control, recursive) {
        triggerAsyncEvent(control, 'stateChange');
        if (recursive) {
            for (var cur = control.parent; cur && cur.requireChildControls; cur = cur.parent) {
                clearFlag(cur);
                triggerAsyncEvent(cur, 'stateChange');
            }
        }
    }

    function registerPropertyChange(control, property, oldValue, newValue) {
        triggerAsyncEvent(control, 'propertyChange', {
            oldValues: kv(property, oldValue),
            newValues: kv(property, newValue)
        }, false, function (v, a) {
            a.oldValues = copy(a.oldValues, v.oldValues);
            a.newValues = copy(v.newValues, a.newValues);
            return a;
        });
        each(_(control).values, function (i, v) {
            if (i !== property && is(v, DisplayValue) && v.needEvaluate) {
                v.getValue(control, i, true);
            }
        });
        clearFlag(control);
        registerStateChange(control, true);
    }

    function getContextForTemplate(control, raw) {
        var proto = getPrototypeOf(control);
        var values = {};
        if (raw) {
            var state = _(control);
            getOwnPropertyNames(control).forEach(function (v) {
                values[v] = control[v];
            });
            extend(values, state.values);
            values.value = state.value;
        } else {
            extend(values, control);
        }
        each(values, function (i, v) {
            if (!(i in proto) && !matchWord(i, CONST_PROPS)) {
                defineGetterProperty(values, i, function () {
                    listenProperty(proto, i);
                    return control[i];
                });
            }
        });
        return values;
    }

    function DisplayValue(control, prop, rawValue, displayValue, needEvaluate, fireEvent) {
        var self = this;
        self.rawValue = rawValue;
        self.displayValue = displayValue;
        self.lastValue = displayValue;
        self.needEvaluate = needEvaluate;
        self.getValue(control, prop, fireEvent);
    }
    definePrototype(DisplayValue, {
        getValue: function (control, prop, fireEvent) {
            var self = this;
            if (self.needEvaluate) {
                var value = waterpipe(self.displayValue, getContextForTemplate(control, true));
                if (fireEvent !== false && value !== self.lastValue) {
                    registerPropertyChange(control, prop, self.lastValue, value);
                }
                self.lastValue = value;
                return value;
            }
            return self.displayValue;
        }
    });

    function getLabel(source, name) {
        var labels = source.toolset.labels;
        if (name in labels) {
            getLabel.value = String(labels[name][globalContext.language] || labels[name].default || '');
            return true;
        }
    }

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

    function listenProperty(proto, prop) {
        if (!(prop in proto) && !matchWord(prop, CONST_PROPS)) {
            defineGetterProperty(proto, prop, function () {
                var self = this;
                var value = hasOwnProperty.call(inheritedValues, prop) ? getInheritProperty(self, prop) : _(self).values[prop];
                return is(value, DisplayValue) ? value.lastValue : value;
            }, function (value) {
                var self = this;
                var dict = _(self).values;
                var dv = is(dict[prop], DisplayValue);
                if (value !== dict[prop] && (!dv || value !== dv.rawValue)) {
                    var isInherited = hasOwnProperty.call(inheritedValues, prop);
                    var oldValue = dv ? dv.lastValue : dict[prop];
                    if (isInherited && (value === null || value === undefined)) {
                        delete dict[prop];
                    } else {
                        dict[prop] = wrapValue(self, prop, value);
                    }
                    var newValue = self[prop];
                    if (_(self).inited) {
                        registerPropertyChange(self, prop, oldValue, newValue);
                        if (isInherited) {
                            var notifyChildren = function (cur) {
                                each(cur.controls, function (i, v) {
                                    if (!(prop in _(v).values)) {
                                        registerPropertyChange(v, prop, oldValue, newValue);
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

    function setValue(control, newValue, suppressEvent) {
        var state = _(control);
        if (!state.inited) {
            state.value = newValue;
            return true;
        }
        var oldValue = state.value;
        if (oldValue === newValue) {
            return false;
        }
        var currentEvent = state.container.event;
        var promise = (!currentEvent || currentEvent.eventName !== 'setValue' || currentEvent.context !== control) && triggerEvent(control, 'setValue', {
            oldValue: oldValue,
            newValue: newValue
        });
        if (promise) {
            return state.value !== oldValue;
        }
        state.value = newValue;
        if (!suppressEvent) {
            registerPropertyChange(control, 'value', oldValue, newValue);
            if (control.errors || control.validateOnSetValue) {
                validate(control);
            }
        }
        return true;
    }

    function validate(control) {
        var result;
        if (isEnabled(control)) {
            if (control.required && !control.value) {
                result = reject('required');
            } else {
                result = triggerEvent(control, 'validate');
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

    function validateAll(control) {
        var focusOnFailed = dom.getEventSource(control.element) !== 'script';
        var promises = [];
        var failed = [];
        _(control).container.flushEvents();
        foreachControl(control, function (v) {
            var promise = validate(v);
            if (promise) {
                promise.catch(function () {
                    failed.push(v.element);
                });
                promises.push(promise);
            }
        }, true);
        if (promises[0]) {
            var promise = helper.waitAll(promises);
            promise.catch(function () {
                if (focusOnFailed) {
                    dom.focus(failed);
                }
            });
            return promise;
        }
    }

    function setInitial(control) {
        var state = _(control);
        var values = state.initialValues;
        each(getOwnPropertyNames(control), function (i, v) {
            if (!matchWord(v, CONST_PROPS)) {
                values[v] = control[v];
            }
        });
        copy(values, state.values);
        defineHiddenProperty(values, 'value', state.value);
    }

    function reset(control) {
        var state = _(control);
        var initialValues = state.initialValues;
        control.errors = null;
        state.flag = 1;
        if (initialValues) {
            // use each() instead of extend()
            // to ensure all values copied even if the value is undefined
            each(initialValues, function (i, v) {
                (i in state.values ? state.values : control)[i] = v;
            });
            setValue(control, initialValues.value, true);
        }
        triggerEvent(control, 'reset');
        registerStateChange(control);
    }

    function clearFlag(control, recal) {
        _(control).flag &= 0xff;
        if (recal) {
            [isEnabled, isActive, isHidden].forEach(function (v, i) {
                return (recal & (1 << i)) && v(control);
            });
        }
    }

    function getFlag(control, flag, callback) {
        var state = _(control);
        var bit = state.flag;
        var cur = (bit & flag) > 0;
        if ((state.flag |= (flag << 8)) !== bit && (cur ^ !!callback(state))) {
            state.flag ^= flag;
            registerStateChange(control, true);
            return !cur;
        }
        return cur;
    }

    function setFlag(control, flag, value) {
        _(control)[FLAG_NAMES[flag >> 1]] = value;
        clearFlag(control, flag);
    }

    function isEnabled(control) {
        return getFlag(control, 1, function (state) {
            if (isDisabledByToolset(control) || (state.position && !state.position.enabled)) {
                return false;
            }
            if (control.requireChildControls && (!control.controls.some(isEnabled) || control.controls.every(isHidden))) {
                return false;
            }
            return state.enabled !== false && (state.options.enabled || noop).call(control, control) !== false;
        });
    }

    function isActive(control) {
        return getFlag(control, 2, function (state) {
            return state.active || (state.options.active || noop).call(control, control);
        });
    }

    function isHidden(control) {
        return getFlag(control, 4, function (state) {
            var hiddenWhenDisabled = control.hiddenWhenDisabled;
            return isDisabledByToolset(control) || (!isEnabled(control) && (hiddenWhenDisabled || (hiddenWhenDisabled !== false && control.parent && control.parent.hideDisabledChild))) || state.visible === false || (state.options.visible || noop).call(control, control) === false;
        });
    }

    function isDisabledByToolset(control) {
        return getFlag(control, 8, function (state) {
            return state.toolsetState && (isEnabled(state.toolsetState) === false || (control.realm && !state.toolsetState[control.realm]));
        });
    }

    function parseTemplate(template, templates, cacheKeyObj, parentTemplateName) {
        var cached = mapGet(parsedTemplates, cacheKeyObj || templates, Object)[template];
        if (cached) {
            return cached;
        }

        var index = 0;
        var binds = {};
        var roles = {};
        binds[0] = [];

        function addBind(index, expression, name, type) {
            objGet(binds, index, Array).push({
                type: type || 'text',
                name: name || '',
                expression: expression
            });
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
            return helper.single(roles, function (v, i) {
                return hasOwnProperty.call(templates, i) && i;
            });
        }

        function includeTemplate(name, node) {
            // prevent infinite recursion when mentioning the original template in overriden definition
            var haystack = parentTemplateName === name ? getPrototypeOf(templates) : templates;
            var includeTemplate = (haystack[name] || '<div><children controls/></div>');

            // replace children placeholder with the actual child contents
            var tmp = $.parseHTML(includeTemplate)[0];
            $('children', tmp).each(function (i, v) {
                var childNodes = createDocumentFragment(v.attributes.controls && !node.childNodes[0] ? [helper.createElement('controls')] : node.cloneNode(true).childNodes);
                var $controls = $('controls', childNodes);
                eachAttr(v, function (i, v) {
                    $controls.attr(i, v);
                });
                $(v).replaceWith(childNodes);
            });
            includeTemplate = tmp.outerHTML;

            // check whether we can use cached template from parent
            // if such cached template does not refer to altered template by current template definitions
            var cacheKeyObj = templates;
            for (var parent = templates; parent; parent = getPrototypeOf(parent)) {
                var cache = mapGet(parsedTemplates, parent, Object)[includeTemplate];
                if (cache) {
                    cacheKeyObj = hasOverrideTemplate(templates, cache.roles) ? templates : parent;
                    break;
                }
            }

            // set layout type of the further included template to the included one only if this is a true control type
            var include = parseTemplate(includeTemplate, templates, cacheKeyObj, UIToolset.prototype[name] ? name : parentTemplateName);
            var dom = include.dom.cloneNode(true);
            var $controls = $('controls', dom);
            var context = {};
            eachAttr(node, function (i, v, attr) {
                if (i === 'class') {
                    extractPartialBinds(attr);
                    $(dom).addClass(attr.value);
                } else {
                    var expr = RE_PIPE.test(v) && RegExp.$1;
                    context[camel(i)] = !expr ? parseConstant(v) : {
                        expression: v,
                        evalAsObject: expr.length === v.length - 4
                    };
                    if (!expr) {
                        $controls.attr(i, v);
                    }
                }
            });
            each(include.binds, function (i, v) {
                var j = (+i) + index;
                binds[j] = v.concat(binds[j] || []);
                binds[j].context = extend({}, v.context, context);
            });
            each(include.roles, function (i, v) {
                roles[i] = (+v) + index;
            });
            roles[name] = index;
            index += include.nodeCount;
            return dom;
        }

        function processDOM(element) {
            var nodeToReplace = new Map();
            var iterator = document.createTreeWalker(element, 5, function (v) {
                if (/z\:([\w-]+)/.test(tagName(v))) {
                    nodeToReplace.set(v, includeTemplate(camel(RegExp.$1), v));
                    return 2;
                }
                return 1;
            }, false);

            helper.iterate(iterator, function (v) {
                if (v.nodeType === 1) {
                    if (tagName(v) === 'controls' && !$(v).attr('layout')) {
                        v.setAttribute('layout', parentTemplateName);
                    }
                    eachAttr(v, function (i, w, attr) {
                        if (RE_PIPE.test(w) && (!matchWord(i, 'class style') || !extractPartialBinds(attr))) {
                            addBind(index, w, i, matchWord(i, BOOL_ATTRS) && i in v ? 'prop' : 'attr');
                            attr.value = '';
                        }
                    });
                    index++;
                } else if (RE_PIPE.test(v.data)) {
                    if (v.previousSibling || v.nextSibling) {
                        addBind(index, v.data);
                        nodeToReplace.set(v, document.createElement('span'));
                        index++;
                    } else {
                        addBind(index - 1, v.data);
                    }
                    v.data = '';
                }
            });
            nodeToReplace.forEach(function (v, i) {
                $(i).replaceWith(v);
            });
            return element.childNodes[0];
        }

        var result = {
            dom: processDOM(createDocumentFragment($.parseHTML(template)[0])),
            roles: waterpipe.eval('sortby [ . ]', roles),
            binds: binds,
            nodeCount: index
        };
        cacheKeyObj = cacheKeyObj || templates;
        do {
            mapGet(parsedTemplates, cacheKeyObj, Object)[template] = result;
        } while (cacheKeyObj !== defaultTemplates && !hasOverrideTemplate(cacheKeyObj, roles) && (cacheKeyObj = getPrototypeOf(cacheKeyObj)));
        return result;
    }

    function removeControlFromDOM(control) {
        var elm = control.element;
        var pos = _(control).position;
        if (pos.count === 1) {
            pos.start = pos.end = $(pos.placeholder).insertBefore(elm)[0];
        } else if (pos.start === elm) {
            pos.start = elm.nextSibling;
        } else if (pos.end === elm) {
            pos.end = elm.previousSibling;
        }
        pos.count--;
        removeNode(elm);
    }

    function appendControlToDOM(control, parent, suppressEvent) {
        var state = _(control);
        var positions = _(parent).dom.positions;
        var prev = state.position;
        var prevDOM = state.dom;
        var next;

        if (!positions[0]) {
            next = new UIControlDOMPosition(parent);
            next.layoutType = parent.type;
            $(next.placeholder).appendTo(parent.element);
            positions[0] = next;
        } else {
            var context = getContextForTemplate(control);
            next = any(positions, function (v) {
                return !v.condition || waterpipe.eval(v.condition, context);
            });
            // clear flags because the state may be invalid when building control tree
            clearFlag(control);
        }
        if (prev !== next) {
            var nextDOM = prevDOM;
            if (prevDOM) {
                removeControlFromDOM(control);
            }
            if (!prevDOM || (next && (prevDOM || '').layoutType !== next.layoutType)) {
                var layoutType = next.layoutType;
                var dict = state.allDOM || (state.allDOM = {});
                nextDOM = dict[layoutType] || (dict[layoutType] = new UIControlDOM(control, layoutType));
                control.element = nextDOM.element;
            }
            var elm = control.element;
            if (!next.count) {
                $(next.start).replaceWith(elm);
                next.start = next.end = elm;
            } else {
                $(elm).insertAfter(next.end);
                next.end = elm;
            }
            next.count++;
            state.position = next;
            state.dom = nextDOM;
            if (parent && !suppressEvent && nextDOM !== prevDOM) {
                nextDOM.update();
            }
        }
    }

    function appendControls(container, parent, species, allowExport, options) {
        each(species, function (i, v) {
            var spec = _(v);
            if (spec.type === 'import') {
                appendControls(container, parent, exportedControls[spec.name] || [], true, spec.options);
            } else {
                var control = new spec.ctor(container, v, parent, allowExport, options);
                appendControlToDOM(control, parent || container, true);
                appendControls(container, control, makeArray(spec.options.controls));
                triggerEvent(control, 'init');
                setInitial(control);
                registerStateChange(control);
                if (!parent) {
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
                    if ((!a1 && !a2) ^ (!b1 && !b2)) {
                        return a1 || a2 || b1 || b2;
                    }
                    return (a1 + a2 + b1 + b2) || defaultOrder.get(a) - defaultOrder.get(b);
                });
            }
            registerStateChange(parent);
        }
    }

    function createUIContext(element, species, values) {
        var parentContext = dom.getContext();
        var parentElement = null;
        var parentControl = any(executingControls, function (v) {
            return dom.focused(v.element);
        });
        if (parentControl) {
            parentContext = parentControl.context;
            parentElement = parentControl.element;
        } else if (is(parentContext, UIContext)) {
            var parent = _(parentContext).container;
            parentElement = parent.event && parent.event.context.element;
        }

        var container = new zeta.Container(element);
        container.context = new UIContext(container, values);
        container.toolset = _(species).toolset;
        container.parentContext = parentContext;
        container.parentElement = parentElement;

        _(container, {
            // compatible for appendControlToDOM
            dom: { positions: [] }
        });
        container.tap(function (e) {
            var control = container.getContext(e.target) || container.control;
            if (isEnabled(control)) {
                container.emit(e, e.target === element ? control.element : e.target);
                if (matchWord(e.eventName, 'focusin focusout')) {
                    control.focusBy = e.source;
                    registerStateChange(control);
                } else if (matchWord(e.eventName, 'asyncStart asyncEnd')) {
                    foreachControl(control, function (v) {
                        registerStateChange(v);
                    });
                }
            }
        });
        appendControls(container, null, [species], true);
        container.flushEvents();
        return container;
    }

    function UIContext(container, values) {
        var self = extend(this, values);
        _(self, {
            container: container,
            toolsets: new Map()
        });
    }
    definePrototype(UIContext, {
        toJSON: function () {
            return extend({}, this);
        },
        update: function (values) {
            var state = _(this);
            var container = state.container;
            extend(this, values);
            each(container.components, function (i, v) {
                if (is(v.context, UIToolsetState)) {
                    triggerEvent(v.context, 'contextChange');
                }
                clearFlag(v.context, 1);
            });
            each(container.components, function (i, v) {
                var control = is(v.context, UIControl);
                if (control) {
                    clearFlag(control, 7);
                    if (!isDisabledByToolset(control)) {
                        triggerEvent(control, 'contextChange');
                    }
                }
            });
            container.flushEvents();
        },
        validate: function () {
            return _(this).container.control.validate();
        },
        reset: function () {
            each(_(this).container.components, function (i, v) {
                reset(v.context);
            });
        }
    });

    function UIToolset(name, options) {
        var self = this;
        self.name = name || '';
        self.labels = name ? objGet(exportedLabels, name, Object) : {};
        self.options = options || {};
    }
    definePrototype(UIToolset, {
        i18n: function (language, key, value) {
            addLabels(this.labels, language, key, value);
        },
        alert: function (message, action, title, callback) {
            return openDefaultDialog(this, 'alert', true, message, new ArgumentIterator([action, title, callback]));
        },
        confirm: function (message, action, title, callback) {
            return openDefaultDialog(this, 'confirm', true, message, new ArgumentIterator([action, title, callback]));
        },
        prompt: function (message, value, action, title, description, callback) {
            return openDefaultDialog(this, 'prompt', value, message, new ArgumentIterator([action, title, description, callback]));
        },
        notify: function (message, kind, timeout, within) {
            var iter = new ArgumentIterator([kind, timeout, within]);
            return this.import('dialog.notify').render({
                label: message,
                kind: iter.string() || true,
                timeout: iter.next('number') && iter.value,
                within: iter.next(Node) && iter.value
            }).dialog;
        },
        import: function (id, options) {
            return new UIControlSpecies(this, 'import', id, options || {});
        },
        export: function (id) {
            var arr = objGet(exportedControls, id, Array);
            for (var i = 1, len = arguments.length; i < len; i++) {
                arr[arr.length] = arguments[i];
            }
        },
        all: function (context) {
            if (is(context, Node)) {
                context = is(dom.getContext(context), UIContext);
            } else if (is(context, UIControl)) {
                if (_(context).toolset === this) {
                    return context.all;
                }
                context = _(context).childContext;
            }
            var state = context && _(context).toolsets.get(this);
            return state ? state.all : {};
        }
    });

    function UIToolsetState(container, toolset, context) {
        var self = this;
        self.name = toolset.name;
        self.context = context;
        self.all = {};
        // responsible for contextChange event and a global enable flag for controls defined in the toolset
        // compatible inferface to UIControl where the enable flag can be listened
        _(self, {
            container: container,
            options: toolset.options,
            control: self,
            flag: 1
        });
        container.add(self, toolset.options);
        container.emit('contextChange', self);
    }
    definePrototype(UIToolsetState, {
        get enabled() {
            return isEnabled(this);
        },
        set enabled(value) {
            setFlag(this, 1, value);
        }
    });

    function controlUniqueName(all, name) {
        for (var i = 0; all[name + (i || '')]; i++);
        return name + (i || '');
    }

    function controlCreateInnerContext(control) {
        var state = _(control);
        if (!is(state.childContext, UIContext)) {
            var context = new UIContext(state.container);
            if (!('value' in state.options)) {
                state.value = context;
                defineGetterProperty(control.context, control.name, function () {
                    return context;
                }, function (value) {
                    var oldValue = extend({}, context);
                    registerPropertyChange(control, 'value', oldValue, extend(context, value));
                });
            }
            state.childContext = context;
        }
        return state.childContext;
    }

    function controlExportProperty(control, context, prop, isDefault) {
        var name = control.name + (isDefault ? '' : helper.ucfirst(prop));
        if (isFunction(control[prop])) {
            defineHiddenProperty(context, name, control[prop].bind(control));
        } else {
            if (hasOwnProperty.call(context, name)) {
                control[prop] = context[name];
            }
            defineGetterProperty(context, name, function () {
                return control[prop];
            }, function (value) {
                control[prop] = value;
            });
        }
        _(control).exports.push(name);
    }

    function UIControl(container, species, parent, allowExport, extraOptions) {
        var self = this;
        var v = _(species);
        var requireScope = !allowExport && parent && _(parent).toolset !== v.toolset;
        var context = requireScope ? controlCreateInnerContext(parent) : (parent && _(parent).childContext) || (parent || container).context;
        var toolsetState = mapGet(_(context).toolsets, v.toolset, function () {
            return new UIToolsetState(container, v.toolset, context);
        });
        var toolsetEventHandle = randomId();
        var name = controlUniqueName(toolsetState.all, v.name);

        var state = {
            control: self,
            species: species,
            container: container,
            toolset: v.toolset,
            options: v.options,
            templates: inheritTemplates(_(parent) || {}, v),
            flag: 1,
            values: {},
            initialValues: {},
            exports: [],
            toolsetState: toolsetState,
            toolsetEventHandle: toolsetEventHandle
        };
        _(self, state);
        mapGet(speciesMap, getPrototypeOf(self), Set).add(self);
        container.add(toolsetState, toolsetEventHandle, {
            stateChange: function () {
                clearFlag(self, 5);
            }
        });

        self.name = name;
        self.type = v.type;
        self.required = false;
        each(v.options, function (i, v) {
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
            self.label = v.name;
        }
        if (typeof v.options.execute === 'string') {
            self.shortcut = dom.getShortcut(v.options.execute)[0];
        }
        self.icon = self.icon || '';
        self.parent = parent || null;
        self.state = toolsetState;
        self.context = context;
        self.parentContext = container.parentContext || null;
        self.parentElement = container.parentElement || null;
        self.controls = [];
        self.errors = null;
        self.id = randomId();
        self.all = toolsetState.all;
        self.all[name] = self;
        if (parent) {
            parent.controls.push(self);
            if (allowExport && parent.all !== self.all) {
                parent.all[name] = self;
            }
        }

        if (v.defaultExport) {
            controlExportProperty(self, context, v.defaultExport, true);
        }
        each(v.options.exports, function (i, v) {
            controlExportProperty(self, context, v);
        });
        state.inited = true;
    }
    definePrototype(UIControl, {
        get previousSibling() {
            var pos = is(_(this).position, UIControlDOMPosition);
            return pos && pos.start !== this ? _(this).container.getContext(this.element.previousSibling) : null;
        },
        get nextSibling() {
            var pos = is(_(this).position, UIControlDOMPosition);
            return pos && pos.end !== this ? _(this).container.getContext(this.element.nextSibling) : null;
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
            setFlag(this, 1, value);
        },
        get active() {
            return isActive(this);
        },
        set active(value) {
            setFlag(this, 2, value);
        },
        get visible() {
            return !isHidden(this);
        },
        set visible(value) {
            setFlag(this, 4, value);
        },
        get value() {
            return _(this).value;
        },
        set value(value) {
            setValue(this, value);
        },
        setValue: function (value) {
            return setValue(this, value);
        },
        contains: function (control) {
            for (var cur = control; cur && cur !== this; cur = cur.parent);
            return !!cur;
        },
        hasRole: function (role) {
            var roles = _(this).dom.roles;
            return any(role, function (v) {
                return v in roles;
            });
        },
        getRoleContext: function (role) {
            var dom = _(this).dom;
            return dom.binds[dom.roles[role]].context;
        },
        on: function (event, handler) {
            _(this).container.add(this.element, isPlainObject(event) || kv(event, handler));
        },
        watch: function (prop, handler) {
            listenProperty(getPrototypeOf(this), prop);
            if (isFunction(handler)) {
                this.on('propertyChange', function (e, self) {
                    if (prop in e.oldValues) {
                        handler.call(self, self, prop, e.oldValues[prop], self[prop]);
                    }
                });
            }
        },
        focus: function () {
            if (isEnabled(this)) {
                dom.focus(this.element);
            }
        },
        validate: function () {
            return when(validateAll(this));
        },
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
                    triggerEvent(self, 'executed', {
                        data: data
                    });
                    if (self.parent) {
                        triggerEvent(self.parent, 'childExecuted', {
                            control: self
                        }, true);
                    }
                }
                triggerEvent(self, 'afterExecute', resolved);
            };
            var run = function () {
                var promise;
                triggerEvent(self, 'beforeExecute');
                executingControls.add(self);
                try {
                    var command = _(self).options.execute;
                    if (typeof command === 'string') {
                        promise = (dom.support(command, self.focused) || noop)(self.value);
                    } else if (isFunction(command)) {
                        promise = command.call(self, self);
                    }
                } catch (e) {
                    console.error(e);
                    promise = reject(e);
                }
                if (self.waitForExecution && promise && isFunction(promise.then)) {
                    promise = dom.lock(self.element, promise, function () {
                        return triggerEvent(self, 'cancel') || reject();
                    });
                    helper.always(dom.prepEventSource(promise), finish);
                    return promise;
                }
                finish(true);
                return when();
            };
            var promise = validateAll(self);
            return promise ? dom.prepEventSource(promise).then(run) : run();
        },
        reset: function () {
            foreachControl(this, reset);
        },
        append: function (control, clear) {
            var self = this;
            if (clear) {
                each(self.controls.slice(0), function (i, v) {
                    v.destroy();
                });
            }
            appendControls(_(self).container, self, makeArray(control));
        },
        destroy: function () {
            var self = this;
            if (self.pending) {
                dom.cancel(self.element, true);
            }
            when(triggerEvent(self, 'beforeDestroy')).then(function () {
                var container = _(self).container;
                foreachControl(self, function (v) {
                    var state = _(v);
                    each(state.allDOM, function (i, v) {
                        container.delete(v.element);
                    });
                    container.delete(v.state, state.toolsetEventHandle);
                    mapGet(speciesMap, getPrototypeOf(v)).delete(v);
                    delete v.all[v.name];
                    if (v.parent && v.parent.all[v.name] === v) {
                        delete v.parent.all[v.name];
                    }
                    each(state.exports, function (i, w) {
                        delete v.context[w];
                    });
                });
                if (self.parent) {
                    var arr = self.parent.controls;
                    arr.splice(arr.indexOf(self), 1);
                    removeControlFromDOM(self);
                    clearFlag(self.parent);
                    registerStateChange(self.parent);
                } else {
                    // ensure all other resources can be garbage collected
                    setTimeout(function () {
                        container.destroy();
                    });
                    helper.removeNode(container.autoDestroy ? container.element : self.element);
                }
            });
        }
    });
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

    function UIControlSpecies(toolset, type, name, options) {
        function Control() {
            UIControl.apply(this, arguments);
        }
        Control.prototype = inherit(UIControl);

        var self = this;
        self.name = name;
        self.type = type;
        _(self, {
            toolset: toolset,
            type: type,
            name: name || options.name || type,
            options: options,
            defaultExport: options.defaultExport || ('value' in options && 'value'),
            templates: inheritTemplates(controlTypes[type] || {}, options),
            ctor: Control
        });
    }
    definePrototype(UIControlSpecies, {
        clone: function (initData) {
            var clone = inherit(UIControlSpecies, this);
            var cloneData = extend({}, _(this));
            cloneData.options = extend({}, cloneData.options, initData);
            _(clone, cloneData);
            return clone;
        },
        render: function (element, props) {
            if (!is(element, Node)) {
                props = element;
                element = document.createElement('div');
            }
            var container = createUIContext(element, this, props);
            $(element).addClass('zeta-ui');
            return container.context;
        }
    });

    function UIControlDOMPosition(control, placeholder) {
        placeholder = placeholder || document.createElement('controls');
        placeholder.style.display = 'none!important';

        var context = {};
        eachAttr(placeholder, function (i, v) {
            context[camel(i)] = parseConstant(v);
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
    definePrototype(UIControlDOMPosition, {
        get enabled() {
            return this.control.enableChildren !== false;
        }
    });

    function UIControlDOM(control, layoutType) {
        var self = this;
        var state = _(control);
        var container = state.container;
        var template = parseTemplate(state.options.template || '<z:' + helper.hyphenate(control.type) + '/>', (controlTypes[layoutType] || '').templates || defaultTemplates);
        var element = template.dom.cloneNode(true);
        var nodes = helper.iterateToArray(helper.createNodeIterator(element, 1));
        var bindedNode = nodes.filter(function (v, i) {
            return template.binds[i];
        });
        var positions = waterpipe.eval('sortby [ ! condition ]', $('controls', element).map(function (i, v) {
            return new UIControlDOMPosition(control, v);
        }).get());

        container.setContext(element, control);
        each(controlTypes[control.type].handlers, function (i, v) {
            container.add(element, v);
        });
        container.add(element, state.options);
        each(template.roles, function (i, v) {
            if (controlTypes[i] && i !== control.type) {
                container.add(nodes[v], i, controlTypes[i]);
            }
        });
        container.add(element, {
            stateChange: function () {
                self.update();
            }
        });
        extend(self, {
            control: control,
            element: element,
            roles: template.roles,
            binds: template.binds,
            bindedNode: bindedNode,
            positions: positions,
            layoutType: layoutType
        });
        if (control.cssClass) {
            $(element).addClass(control.cssClass);
        }
    }
    definePrototype(UIControlDOM, {
        update: function () {
            var self = this;
            var control = self.control;
            var element = control.element;
            if (control.parent) {
                appendControlToDOM(control, control.parent);
            }
            var position = _(control).position;
            if (!position) {
                return;
            }

            var reBold = /\*\*(([^*]|\*(?!\*))+)\*\*/g;
            var reItalic = /\*([^*]+)\*/g;
            var context = getContextForTemplate(control);
            var index = 0;
            each(self.binds, function (i, v) {
                var node = self.bindedNode[index++];
                var globals = extend({}, position.context);
                each(v.context, function (i, v) {
                    globals[i] = !v.expression ? v : evalTemplate(v.expression, context, null, v.evalAsObject);
                });
                each(v, function (i, v) {
                    var value = evalTemplate(v.expression, context, globals, v.type === 'class' || v.type === 'prop');
                    switch (v.type) {
                        case 'class':
                            return setState(node, v.name, value);
                        case 'style':
                            return $(node).css(v.name, value);
                        case 'prop':
                            node[v.name] = !!value;
                            return;
                        case 'attr':
                            value = value.replace(reBold, '$1').replace(reItalic, '$1');
                            return $(node).attr(v.name, value || null);
                    }
                    value = value.replace(reBold, '<b>$1</b>').replace(reItalic, '<i>$1</i>').replace(/\n/g, '<br>');
                    if (value !== node.innerHTML) {
                        node.innerHTML = value;
                    }
                });
            });
            setState(element, {
                active: context.active,
                loading: context.pending,
                error: context.errors,
                disabled: !context.enabled,
                hidden: !context.visible,
                focused: context.focused && context.focusBy
            });
            element.disabled = !context.enabled;

            if (control.controls[1]) {
                var map = new Map();
                each(control.controls, function (i, v) {
                    map.set(v.element, i);
                });
                // perform bubble sort for controls in each position
                each(self.positions, function (k, v) {
                    for (var j = v.count - 1; j > 0; j--) {
                        for (var i = 0, cur = v.start; i < j; i++ , cur = cur.nextSibling) {
                            if (map.get(cur) > map.get(cur.nextSibling)) {
                                $(cur.nextSibling).insertBefore(cur);
                                cur = cur.previousSibling;
                                if (i === 0) {
                                    v.start = cur;
                                } else if (i === v.count - 1) {
                                    v.end = cur.nextSibling;
                                }
                            }
                        }
                    }
                });
            }
            each(control.controls, function (i, v) {
                appendControlToDOM(v, control);
            });
        }
    });

    function ArgumentIterator(args) {
        this.args = args;
        this.done = false;
    }
    definePrototype(ArgumentIterator, {
        next: function (type) {
            var arr = this.args;
            if (type === 'object' ? isPlainObject(arr[0]) : typeof type === 'string' ? typeof arr[0] === type : is(arr[0], type)) {
                this.value = arr.shift();
                this.done = !arr.length;
                return true;
            }
        },
        nextAll: function (type) {
            var arr = [];
            while (this.next(type) && arr.push(this.value));
            return arr;
        },
        fn: function () {
            return this.next('function') && this.value;
        },
        string: function () {
            return this.next('string') && this.value;
        }
    });

    function defineControlType(type, specs, layoutOnly) {
        specs = extend({}, specs);
        specs.templates = inheritTemplates({}, specs);
        specs.handlers = [specs];
        defaultTemplates[type] = specs.template || '';
        controlTypes[type] = specs;

        var defaultOptions = {};
        each(specs, function (i, v) {
            if (!isFunction(v) && !matchWord(i, 'templates template handlers')) {
                defaultOptions[i] = v;
                delete specs[i];
            }
        });
        specs.defaultOptions = defaultOptions;

        if (!layoutOnly) {
            definePrototype(UIToolset, kv(type, function () {
                for (var i = 0, len = arguments.length, arr = new Array(len); i < len; i++) {
                    arr[i] = arguments[i];
                }
                var iter = new ArgumentIterator(arr);
                var name = iter.string();
                var options = {};
                if (specs.parseOptions) {
                    specs.parseOptions(options, iter);
                }
                extend(options, iter.next('object') && iter.value);
                return new UIControlSpecies(this, type, name, extend({}, defaultOptions, options));
            }));
        }
    }

    extend(UIToolset, {
        define: defineControlType,
        on: function (type, event, handler) {
            controlTypes[type].handlers.push(isPlainObject(event) || kv(event, handler));
        },
        i18n: function (toolset, language, key, value) {
            addLabels(objGet(exportedLabels, toolset, Object), language, key, value);
        },
        hasRole: function (element, role) {
            var context = is(dom.getContext(element), UIContext);
            return context && _(context).container.getContext(element).hasRole(role);
        }
    });
    zeta.UI = UIToolset;

    /* ********************************
     * Built-in control types
     * ********************************/

    function parseExecute(options, iter) {
        options.execute = iter.fn();
    }

    function parseControlsAndExecute(options, iter) {
        options.controls = iter.nextAll(UIControlSpecies);
        parseExecute(options, iter);
    }

    function parseIconAndExecute(options, iter) {
        options.icon = iter.string();
        parseExecute(options, iter);
    }

    function buttonExecute(e, self) {
        if (self.type === 'button' || self.type === 'submit') {
            return self.execute();
        }
    }

    defineControlType('button', {
        template: '<button class="danger:{{danger}}"><z:label/><children/></button>',
        danger: false,
        defaultExport: 'execute',
        parseOptions: parseIconAndExecute,
        enter: buttonExecute,
        click: buttonExecute
    });

    defineControlType('submit', {
        template: '<z:button class="zeta-submit"/>',
        defaultExport: 'execute',
        parseOptions: function (options, iter) {
            options.icon = iter.string();
            options.execute = function (self) {
                for (var cur = self; cur && !cur.hasRole('form'); cur = cur.parent);
                return cur && cur.execute();
            };
        },
        enter: buttonExecute,
        click: buttonExecute
    });

    var T_SHOWICON = '[ @global.showIcon ?? showIcon ]';
    var T_SHOWTEXT = '[ @global.showText ?? showText ]';
    var T_ICON = '[ @global.icon ?? icon ]';

    defineControlType('label', {
        template: '<span class="zeta-label hidden:{{[ ! ' + T_SHOWICON + ' || ! ' + T_ICON + ' ] && ! ' + T_SHOWTEXT + '}}" title="{{tooltip || label}}"><i class="material-icons hidden:{{[ ! ' + T_ICON + ' && ' + T_SHOWICON + ' != true ] || ! ' + T_SHOWICON + '}}">{{' + T_ICON + '}}</i>{{? ' + T_SHOWTEXT + ' [ @global.label ?? label ] ""}}</span>',
        showIcon: 'auto',
        showText: true,
        defaultExport: 'label'
    });

    function checkboxToggleValue(e, self) {
        self.value = !self.value;
        return self.type === 'checkbox' ? self.execute() : undefined;
    }

    defineControlType('checkbox', {
        template: '<z:button class="zeta-checkbox checked:{{value}}" show-icon="false" show-text="true"/>',
        value: false,
        preventLeave: true,
        parseOptions: parseExecute,
        click: checkboxToggleValue,
        enter: checkboxToggleValue,
        space: checkboxToggleValue
    });

    function dropdownSetValue(dropdown, value, forceUpdate) {
        var choices = _(dropdown).ddToolset.all(dropdown);
        var defaultChoice;
        var match = any(choices, function (v) {
            defaultChoice = defaultChoice || v;
            return v.value === value;
        });
        if (!match && !dropdown.allowEmpty) {
            match = defaultChoice;
        }
        if (dropdown.setValue(match ? match.value : '') || forceUpdate) {
            dropdown.hintValue = value;
            dropdown.selectedText = (match && dropdown.valueAsLabel ? match : dropdown).label;
            each(dropdown.controls, function (i, v) {
                v.selected = v === match;
            });
        }
    }

    function dropdownUpdateChoices(dropdown) {
        var isArray = helper.isArray(dropdown.choices);
        var choices = [];
        each(dropdown.choices, function (i, v) {
            choices[choices.length] = isArray && isPlainObject(v) ? v : {
                value: isArray ? v : parseConstant(i),
                label: v
            };
        });

        var toolset = _(dropdown).ddToolset;
        var newButtons = [];
        for (var i = 0, len = choices.length - Object.keys(toolset.all(dropdown)).length; i < len; i++) {
            newButtons[i] = toolset.choiceButton;
        }
        dropdown.append(newButtons);
        each(toolset.all(dropdown), function (i, v) {
            v.enabled = v.visible = !!choices[0];
            extend(v, choices.shift());
        });
        dropdownSetValue(dropdown, dropdown.hintValue, true);
    }

    defineControlType('dropdown', {
        template: '<label class="zeta-dropdown"><z:button label="{{selectedText}}" show-text="true"/><z:menu/></label>',
        requireChildControls: true,
        hideCalloutOnBlur: true,
        hideCalloutOnExecute: true,
        preventLeave: true,
        allowEmpty: true,
        valueAsLabel: true,
        value: '',
        parseOptions: function (options, iter) {
            options.icon = iter.string();
            if (iter.next(Array) || iter.next(Map)) {
                options.choices = iter.value;
                options.value = iter.next('string') || iter.next('number') ? iter.value : '';
            }
            parseControlsAndExecute(options, iter);
        },
        init: function (e, self) {
            var toolset = new UIToolset(_(self).toolset.name);
            toolset.choiceButton = toolset.button({
                template: '<z:button class="selected:{{selected}}" show-icon="true" show-text="true"/>',
                execute: function (choice) {
                    dropdownSetValue(self, choice.value);
                    self.execute();
                }
            });
            _(self).ddToolset = toolset;
            self.hintValue = self.value;
            self.selectedText = self.label;
            self.watch('choices', dropdownUpdateChoices);
            dropdownUpdateChoices(self);
        },
        setValue: function (e, self) {
            dropdownUpdateChoices(self);
            dropdownSetValue(self, e.newValue);
            e.handled();
        }
    });

    defineControlType('callout', {
        template: '<label class="zeta-callout"><controls of="not parent.alwaysShowCallout && parent.controls where enabled as _enabled && _enabled.length == 1 && _enabled.0.id == id"/><z:button class="hidden:{{[ not alwaysShowCallout ] && controls where enabled length == 1}}"/><z:menu/></button>',
        requireChildControls: true,
        hideCalloutOnExecute: true,
        hideCalloutOnBlur: true,
        alwaysShowCallout: true,
        parseOptions: function (options, iter) {
            options.icon = iter.string();
            options.controls = iter.nextAll(UIControlSpecies);
        }
    });

    defineControlType('buttonlike', {
        template: '<label class="has-clickeffect"><children/></label>'
    }, true);

    defineControlType('link', {
        template: '<z:buttonlike><a href="{{value}}" target="{{target}}"><z:label show-icon="auto"/></a></z:buttonlike>',
        parseOptions: function (options, iter) {
            options.icon = iter.string();
            options.value = iter.string();
            options.target = iter.string();
        }
    });

    function fileInputReset(e) {
        var input = $(':file', e.target)[0];
        var originalParent = input.parentNode;
        var form = document.createElement('form');
        form.appendChild(input);
        form.reset();
        $(input).prependTo(originalParent);
    }

    defineControlType('file', {
        template: '<z:buttonlike><z:label show-icon="auto"/><input type="file" multiple="{{multiple}}"/></z:buttonlike>',
        autoReset: true,
        multiple: false,
        parseOptions: parseIconAndExecute,
        init: function (e, self) {
            $(':file', e.target).change(function (e) {
                self.execute(makeArray(e.target.files));
            });
        },
        afterExecute: function (e, self) {
            if (self.autoReset) {
                fileInputReset(e);
            }
        },
        reset: function (e, self) {
            fileInputReset(e);
        }
    });

    var PRESET_KEY = '__preset__';
    var DEFAULT_PRESET = {
        overrides: {
            getValue: function () {
                return this.extractText();
            }
        }
    };

    function textboxInitOptions(preset, options) {
        var presetDefinition = {};
        var originalInit = (options || '').init;

        options = extend({
            inline: true,
            defaultOptions: false,
            disallowedElement: '*'
        }, kv(PRESET_KEY, extend({}, options)));
        each(preset, function (i, v) {
            (isFunction(v) || i === 'options' || i === 'commands' ? presetDefinition : options)[i] = v;
        });
        each(options[PRESET_KEY], function (i, v) {
            if (!presetDefinition.options || !(i in presetDefinition.options)) {
                options[i] = v;
                delete options[PRESET_KEY][i];
            }
        });
        options.widgets = extend(options.widgets, kv(PRESET_KEY, presetDefinition));
        options.init = function (e) {
            var presetWidget = e.typer.getStaticWidget(PRESET_KEY);
            each(preset.overrides, function (i, v) {
                e.typer[i] = function (value) {
                    return v.call(this, presetWidget, value);
                };
            });
            if (isFunction(originalInit)) {
                originalInit.call(options, e);
            }
        };
        return options;
    }

    function textboxSetValue(control, value) {
        var editor = control.editor;
        if (!editor.focused(true) && value !== editor.getValue()) {
            editor.setValue(value);
        }
        control.setValue(editor.getValue());
    }

    defineControlType('textbox', {
        template: '<z:textboxlike><z:contenteditable spellcheck="false"/></z:textboxlike>',
        hideCalloutOnExecute: false,
        preventLeave: true,
        value: '',
        placeholder: '',
        parseOptions: parseExecute,
        init: function (e, self) {
            self.editorOptions = textboxInitOptions(self.preset || DEFAULT_PRESET, self.options);
            self.watch('editor', function (a, b, c, typer) {
                self.options = typer.getStaticWidget(PRESET_KEY).options;
                self.editorOptions.options = extend({}, self.options);
            });
        },
        reset: function (e, self) {
            self.options = self.editor.getStaticWidget(PRESET_KEY).options;
            extend(self.options, self.editorOptions.options);
        }
    });

    defineControlType('textboxlike', {
        template: '<label class="zeta-textbox keep-placeholder:{{showPlaceholder == always && ! $placeholder}}"><z:label show-text="false" show-icon="auto"/><div class="zeta-textbox-wrapper" data-label="{{? $placeholder label}}"><div class="zeta-textbox-inner"><children/><div class="zeta-textbox-placeholder">{{placeholder || label}}</div></div><div class="zeta-textbox-error"></div><div class="zeta-textbox-clear"></div></div></label>',
        click: function (e, self) {
            if (is(e.target, '.zeta-textbox-clear')) {
                self.execute('');
                self.editor.focus();
            }
        }
    }, true);

    defineControlType('richtext', {
        template: '<div class="zeta-richtext"><div class="zeta-richtext-toolbar"></div><label class="zeta-textbox"><z:contenteditable/><div class="zeta-textbox-placeholder"><p>{{label}}</p></div></label></div>',
        hideCalloutOnExecute: false,
        preventLeave: true,
        value: '',
        parseOptions: parseExecute,
        init: function (e, self) {
            self.editorOptions = self.options || {};
            self.editorOptions.toolbar = {
                container: $('.zeta-richtext-toolbar', e.target)[0]
            };
        }
    });

    defineControlType('contenteditable', {
        template: '<div class="zeta-editable" contenteditable spellcheck="{{spellcheck}}"></div>',
        init: function (e, self) {
            self.editor = new zeta.Editor(e.target, self.editorOptions);
            self.editor.enable('stateclass', {
                target: self.element,
                focused: ''
            });
            self.editor.on('contentChange', function () {
                if (self.setValue(self.editor.getValue())) {
                    self.execute();
                }
            });
            textboxSetValue(self, self.value);
        },
        stateChange: function (e, self) {
            if (self.editor.enabled() ^ self.enabled) {
                self.editor[self.enabled ? 'enable' : 'disable']();
            }
        },
        focusin: function (e, self) {
            if (!self.editor.focused()) {
                self.editor.focus();
            }
        },
        setValue: function (e, self) {
            textboxSetValue(self, e.newValue);
            e.handled();
        },
        validate: function (e, self) {
            return self.editor.validate();
        }
    }, true);

    function formInit(self) {
        var deferred = formEnsureDeferred(self, 'deferred');
        defineHiddenProperty(self.context, self.name, deferred.promise());
        formUpdateDeferred(self, 'guard', true);
    }

    function formEnsureDeferred(self, name) {
        return self[name] || (self[name] = $.Deferred());
    }

    function formUpdateDeferred(self, name, resolveOrReject, data) {
        if (self[name]) {
            self[name][resolveOrReject ? 'resolve' : 'reject'](data);
            delete self[name];
        }
    }

    defineControlType('form', {
        template: '<div class="zeta-form"><children controls/></div>',
        templates: {
            buttonset: '<z:buttonset><children controls show-text="true"/></z:buttonset>',
            textbox: '<z:textbox show-placeholder="always"/>'
        },
        parseOptions: parseControlsAndExecute,
        preventLeave: true,
        init: function (e, self) {
            formInit(self);
        },
        childExecuted: function (e, self) {
            if (e.source !== 'script' && e.control.preventLeave && !self.guard) {
                dom.lock(self.element, formEnsureDeferred(self, 'guard'), function () {
                    return self.preventLeave ? _(self).toolset.confirm('leaveForm') : when();
                });
            }
        },
        beforeExecute: function (e, self) {
            formUpdateDeferred(self, 'guard', true);
        },
        executed: function (e, self) {
            formUpdateDeferred(self, 'deferred', true, e.data !== null ? e.data : self.value !== undefined ? self.value : self.context.toJSON());
            self.reset();
        },
        cancelled: function (e, self) {
            formUpdateDeferred(self, 'deferred', false);
        },
        destroy: function (e, self) {
            formUpdateDeferred(self, 'deferred', false);
        },
        reset: function (e, self) {
            if (!self.deferred) {
                formInit(self);
            }
        }
    });

    function fieldsetUpdateFlag(self) {
        self.value = self.optional ? !!self.value : undefined;
        self.enableChildren = !self.optional || self.value;
    }

    defineControlType('fieldset', {
        template: '<div class="zeta-fieldset optional:{{optional && [ ? value checked [ ! value ] ]}}"><div class="zeta-fieldset-title"><z:checkbox/><p>{{description}}</p></div><div class="zeta-form hidden:{{not enableChildren}}"><children controls/></div></div>',
        templates: {
            textbox: '<z:textbox show-placeholder="always"/>'
        },
        value: false,
        optional: false,
        parseOptions: parseControlsAndExecute,
        init: function (e, self) {
            fieldsetUpdateFlag(self);
        },
        propertyChange: function (e, self) {
            if ('optional' in e.newValues || 'value' in e.newValues) {
                fieldsetUpdateFlag(self);
            }
        }
    });

    defineControlType('buttonset', {
        template: '<div class="zeta-buttonset"><children controls/></div>',
        templates: {
            textbox: '<z:textbox show-placeholder="auto"/>'
        },
        requireChildControls: true,
        hiddenWhenDisabled: true,
        parseOptions: parseControlsAndExecute
    });

    defineControlType('buttonlist', {
        template: '<div class="zeta-buttonlist"><children show-text="true" show-icon="true" controls/></div>',
        templates: {
            button: '<z:button><span class="zeta-label zeta-label-description">{{description ?? [ shortcut :zeta-shortcut ]}}</span></z:button>',
        },
        showIcon: true,
        showText: true,
        requireChildControls: true,
        hiddenWhenDisabled: true,
        parseOptions: parseControlsAndExecute,
        stateChange: function (e, self) {
            each(self.controls, function (i, v) {
                if (v.type === 'buttonlist') {
                    var getNextVisible = function (fn) {
                        for (var cur = v[fn]; cur && !cur.visible; cur = cur[fn]);
                        return cur;
                    };
                    var prevVisible = getNextVisible('previousSibling');
                    var nextVisible = getNextVisible('nextSibling');
                    setState(v.element, 'sep', {
                        before: prevVisible,
                        after: nextVisible && nextVisible.type !== 'buttonlist'
                    });
                }
            });
        }
    });

    function menuGetNextItem(self, cur, dir) {
        var arr = [];
        (function getButtonList(control) {
            each(control.controls, function (i, v) {
                if (v.hasRole('buttonlist')) {
                    getButtonList(v);
                } else if (v.hasRole('button') && v.enabled) {
                    arr[arr.length] = v;
                }
            });
        }(self));
        var i = arr.indexOf(cur);
        return arr[i < 0 ? 0 : i + dir];
    }

    defineControlType('menu', {
        template: '<div class="zeta-ui zeta-float is:{{type}} hidden:{{not showCallout}}"><z:buttonlist/></div>',
        showCallout: false,
        waitForExecution: false,
        parseOptions: parseControlsAndExecute,
        init: function (e, self) {
            var callout = e.target;
            if (!self.parent && callout === self.element) {
                defineHiddenProperty(self.context, 'element', callout);
                self.watch('showCallout', function (a, b, c, value) {
                    if (value) {
                        dom.focus(callout);
                    } else {
                        removeNode(callout);
                    }
                });
            } else if (!self.parent || !self.parent.hasRole('buttonlist')) {
                var snapTo = callout.parentNode;
                dom.retainFocus(self.element, callout);
                self.watch('showCallout', function (a, b, c, value) {
                    if (value) {
                        dom.snap(callout, snapTo);
                        dom.focus(callout);
                    } else {
                        removeNode(callout);
                    }
                });
                removeNode(callout);
            } else {
                helper.bind(self.element, 'mouseover mouseout mousemove', function (e) {
                    self.showCallout = e.type !== 'mouseout';
                    if (self.showCallout) {
                        var winRect = helper.getRect();
                        var rect = helper.getRect(callout);
                        var cur = helper.getState(callout, 'float') || [];
                        setState(callout, 'float', {
                            top: rect.bottom > winRect.height || (rect.top < 0 ? false : cur.indexOf('top') >= 0),
                            left: rect.right > winRect.width || (rect.left < 0 ? false : cur.indexOf('left') >= 0)
                        });
                    }
                });
            }
            self.callout = callout;

            var suffix = helper.ucfirst(self.name);
            defineHiddenProperty(self.context, 'show' + suffix, function (to, dir, within) {
                self.showCallout = true;
                (is(to, Node) ? dom.snap : helper.position)(callout, to, dir, within);
            });
            defineHiddenProperty(self.context, 'hide' + suffix, function () {
                self.showCallout = false;
            });
        },
        focusin: function (e, self) {
            if (e.source === 'keyboard') {
                self.activeButton = menuGetNextItem(self, self, 1);
                if (self.activeButton) {
                    self.activeButton.active = true;
                }
            }
        },
        focusout: function (e, self) {
            if (self.activeButton) {
                self.activeButton.active = false;
                self.activeButton = null;
            }
            if (self.hideCalloutOnBlur) {
                self.showCallout = true;
                self.showCallout = false;
            }
        },
        keystroke: function (e, self) {
            var cur = self.activeButton;
            switch (e.data) {
                case 'upArrow':
                case 'downArrow':
                    var next = menuGetNextItem(self, cur, e.data[0] === 'u' ? -1 : 1);
                    if (next) {
                        (cur || {}).active = false;
                        next.active = true;
                        self.activeButton = next;
                        next.focus();
                    }
                    return next || cur;
                case 'leftArrow':
                    if (cur && self.parent) {
                        cur.active = false;
                        self.activeButton = null;
                        self.parent.focus();
                    }
                    return cur;
                case 'rightArrow':
                    var child = cur && cur.controls[0];
                    if (child && cur.hasRole('menu')) {
                        cur.showCallout = true;
                        child.focus();
                    }
                    return child;
            }
        },
        click: function (e, self) {
            if (!helper.containsOrEquals(self.callout, e.target)) {
                self.showCallout = true;
            }
        },
        childExecuted: function (e, self) {
            self.activeButton = null;
            for (var cur = e.control; cur && cur !== self.parent; cur = cur.parent) {
                if (!cur.hideCalloutOnExecute) {
                    return;
                }
            }
            self.showCallout = true;
            self.showCallout = false;
        }
    });

    function dialogClose(e, self) {
        self.destroy();
    }

    defineControlType('dialog', {
        template: '<div class="zeta-ui zeta-dialog"><z:anim class="zeta-float zeta-dialog-inner"><div class="zeta-dialog-content"><h2>{{title}}</h2><z:form><p>{{description}}</p><controls/></z:form></div><div class="zeta-dialog-error error hidden:{{not errorMessage}}">{{errorMessage}}</div><controls of="type == buttonset"/></z:anim></div>',
        templates: {
            buttonset: '<z:buttonset class="zeta-dialog-buttonset"><controls of="danger" show-text="true"/><div class="zeta-buttonset-pad"></div><controls show-text="true"/></z:buttonset>'
        },
        pinnable: true,
        modal: true,
        title: '',
        description: '',
        errorMessage: '',
        parseOptions: parseControlsAndExecute,
        init: function (e, self) {
            var element = self.element;
            var parentElement = self.parentElement;
            var snapTo = parentElement && self.pinnable && screen.availWidth >= 600 && screen.availHeight >= 600 && UIToolset.hasRole(parentElement, 'button buttonlike') ? parentElement : window;

            $(element).appendTo(document.body);
            if (parentElement) {
                dom.retainFocus(parentElement, element);
            }
            if (self.modal) {
                dom.setModal(element);
            }
            dom.snap(element, snapTo, 'auto');
            helper.setZIndexOver(element, parentElement || document.activeElement);
            setTimeout(function () {
                dom.focus(element, true);
            });
        },
        error: function (e, self) {
            self.errorMessage = (e.error || '').message || e.error || '';
            e.handled();
        },
        focusout: dialogClose,
        escape: dialogClose,
        afterExecute: function (e, self) {
            if (e.data) {
                dialogClose(e, self);
            }
        },
        enter: function (e, self) {
            return self.execute();
        }
    });

    defineControlType('anim', {
        template: '<div><children controls/></div>',
        init: function (e, self) {
            runCSSTransition(e.target, 'open');
        },
        focusreturn: function (e, self) {
            runCSSTransition(e.target, 'pop').then(function () {
                $(e.target).removeClass('pop');
            });
        },
        beforeDestroy: function (e, self) {
            return runCSSTransition(e.target, 'closing');
        }
    }, true);

    defineControlType('generic', {
        parseOptions: parseControlsAndExecute
    });

    /* ********************************
     * Built-in dialogs
     * ********************************/

    function openDefaultDialog(ui, type, value, message, iter) {
        return ui.import('dialog.prompt').render({
            value: value,
            valueEnabled: type === 'prompt',
            valueLabel: message,
            cancelVisible: type !== 'alert',
            action: iter.string(),
            dialogTitle: iter.string(),
            dialogDescription: type === 'prompt' ? iter.string() : message,
            callback: iter.fn()
        }).dialog;
    }

    var ui = new UIToolset('dialog');
    ui.i18n('en', {
        action: 'OK',
        cancel: 'Cancel',
        leaveForm: 'There are unsubmitted information on the page. Are you sure to leave?'
    });
    ui.export('dialog.prompt', ui.dialog({
        preventLeave: false,
        exports: 'title description errorMessage',
        controls: [
            ui.textbox('value', {
                hiddenWhenDisabled: true,
                exports: 'enabled label'
            }),
            ui.buttonset(
                ui.submit('action', 'done', {
                    defaultExport: 'label',
                    exports: 'icon'
                }),
                ui.button('cancel', 'close', {
                    exports: 'visible',
                    execute: function (self) {
                        return self.all.dialog.destroy();
                    }
                })
            )
        ],
        execute: function (self) {
            return (isFunction(self.context.callback) || when)(self.context.value);
        }
    }));

    var currentNotify;
    ui.export('dialog.notify', ui.generic({
        template: '<z:anim class="zeta-ui zeta-snackbar notify:{{kind}}"><div class="zeta-float"><z:buttonset><z:label/><z:button icon="close" show-text="false" show-icon="true"/></z:buttonset></div></z:anim>',
        init: function (e, self) {
            if (currentNotify) {
                currentNotify.destroy();
            }
            extend(self, self.context);
            dom.snap(e.target, self.within || document.body, 'top center inset');
            if (self.timeout) {
                setTimeout(function () {
                    self.destroy();
                }, self.timeout);
            }
            currentNotify = self;
        },
        click: function (e, self) {
            self.destroy();
        }
    }));

    each('alert confirm prompt notify', function (i, v) {
        UIToolset[v] = ui[v].bind(ui);
    });

    /* ********************************
     * Built-in formatters
     * ********************************/

    function formatShortcutWin(value) {
        return waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
            return helper.ucfirst(v) + '+';
        });
    }

    function formatShortcutMac(value) {
        var flag = {};
        var str = waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
            v = helper.lcfirst(v);
            flag[v] = MAC_CTRLKEY[v];
            return '';
        });
        return (flag.alt || '') + (flag.shift || '') + (flag.ctrl || '') + (MAC_CTRLKEY[helper.lcfirst(str)] || str);
    }

    waterpipe.pipes[':zeta-shortcut'] = zeta.IS_MAC ? formatShortcutMac : formatShortcutWin;

})(jQuery, zeta);
