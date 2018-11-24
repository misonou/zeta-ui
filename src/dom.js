(function ($, zeta) {
    'use strict';

    var KEYNAMES = JSON.parse('{"8":"backspace","9":"tab","13":"enter","16":"shift","17":"ctrl","18":"alt","19":"pause","20":"capsLock","27":"escape","32":"space","33":"pageUp","34":"pageDown","35":"end","36":"home","37":"leftArrow","38":"upArrow","39":"rightArrow","40":"downArrow","45":"insert","46":"delete","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","91":"leftWindow","92":"rightWindowKey","93":"select","96":"numpad0","97":"numpad1","98":"numpad2","99":"numpad3","100":"numpad4","101":"numpad5","102":"numpad6","103":"numpad7","104":"numpad8","105":"numpad9","106":"multiply","107":"add","109":"subtract","110":"decimalPoint","111":"divide","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"f9","121":"f10","122":"f11","123":"f12","144":"numLock","145":"scrollLock","186":"semiColon","187":"equalSign","188":"comma","189":"dash","190":"period","191":"forwardSlash","192":"backtick","219":"openBracket","220":"backSlash","221":"closeBracket","222":"singleQuote"}');
    var EVENT_SOURCES = 'script mouse touch keyboard input drop cut copy paste';
    var SELECTOR_FOCUSABLE = ':input, [contenteditable], a[href], area[href], iframe';
    var META_KEYS = [16, 17, 18, 91, 93];
    var OFFSET_ZERO = {
        x: 0,
        y: 0
    };

    var MutationObserver = shim.MutationObserver;
    var WeakMap = shim.WeakMap;
    var Map = shim.Map;
    var Set = shim.Set;
    var helper = zeta.helper;
    var getComputedStyle = window.getComputedStyle;

    var any = helper.any;
    var bind = helper.bind;
    var containsOrEquals = helper.containsOrEquals;
    var definePrototype = helper.definePrototype;
    var each = helper.each;
    var extend = helper.extend;
    var getRect = helper.getRect;
    var is = helper.is;
    var isFunction = helper.isFunction;
    var isPlainObject = helper.isPlainObject;
    var isVisible = helper.isVisible;
    var kv = helper.kv;
    var makeArray = helper.makeArray;
    var map = helper.map;
    var mapGet = helper.mapGet;
    var matchWord = helper.matchWord;
    var reject = helper.reject;
    var single = helper.single;
    var when = helper.when;

    var root = document.documentElement;
    var containers = new WeakMap();
    var focusFriends = new WeakMap();
    var focusPath = [];
    var focusElements = new Set();
    var modalElements = new Map();
    var lockedElements = new WeakMap();
    var snaps = new Map();
    var mixinHandlers = [];
    var mixins = new WeakMap();
    var handledErrors = new WeakMap();
    var shortcuts = {};
    var commandKeys = {};
    var domEventTrap;
    var domContainer;
    var lastEventSource;
    var eventSource;
    var windowFocusedOut;
    var scrollbarWidth;
    var _ = helper.createPrivateStore();

    function textInputAllowed(v) {
        return v.isContentEditable || is(v, 'input,textarea,select');
    }

    function parentsAndSelf(element) {
        for (var arr = []; element && element !== document && arr.push(element); element = element.parentNode || element.parent);
        return arr;
    }

    function getEventSource() {
        var type = window.event && window.event.type;
        return (type && matchWord(type[0] === 'k' ? 'keyboard' : type[0] === 't' ? 'touch' : type[0] === 'm' || matchWord(type, 'wheel click dblclick contextmenu') ? 'mouse' : type, EVENT_SOURCES)) || 'script';
    }

    function getEventScope(element) {
        var source = new ZetaEventSource(element);
        return {
            source: source.source,
            sourceKeyName: source.sourceKeyName,
            wrap: function (callback) {
                return function () {
                    var prev = eventSource;
                    try {
                        eventSource = source;
                        return callback.apply(this, arguments);
                    } finally {
                        eventSource = prev;
                    }
                };
            }
        };
    }

    function getContainer(element) {
        for (var cur = element; cur && !containers.has(cur); cur = cur.parentNode);
        return mapGet(containers, cur) || domContainer;
    }

    function focused(element, strict) {
        return element === window ? !windowFocusedOut : focusElements.has(element) && (!strict || containsOrEquals(element, document.activeElement));
    }

    function focusable(element) {
        var friends = map(parentsAndSelf(element), function (v) {
            return focusFriends.get(v);
        });
        return any(focusPath, function (v) {
            return containsOrEquals(v, element) || friends.indexOf(v) >= 0;
        });
    }

    function focusLockedWithin(element) {
        return single(modalElements, function (v, i) {
            return $(v).find(element)[0] && i;
        });
    }

    function triggerDOMEvent(eventName, nativeEvent, target, data, bubbles, source) {
        var event = new ZetaEventEmitter(eventName, domContainer, target, data, nativeEvent, bubbles, source);
        return event.emit(domEventTrap, 'tap', getContainer(target).element, false) || event.emit();
    }

    function triggerUIEvent(eventName, nativeEvent, elements, data, bubbles) {
        var prev = null;
        return any(makeArray(elements), function (v) {
            var container = getContainer(v);
            if (prev !== container) {
                prev = container;
                if (triggerDOMEvent(eventName, nativeEvent, v, data, bubbles)) {
                    return true;
                }
                if (eventName === 'keystroke') {
                    return triggerDOMEvent(data, nativeEvent, v, null, true) || (data === 'space' && textInputAllowed(v) && triggerDOMEvent('textInput', nativeEvent, v, ' ', true));
                }
            }
        });
    }

    function triggerFocusEvent(eventName, elements, relatedTarget, source) {
        each(elements, function (i, v) {
            if (containers.has(v)) {
                triggerDOMEvent(eventName, null, v, {
                    relatedTarget: relatedTarget
                }, false, source);
            }
        });
    }

    function setFocus(element, focusOnInput, source, path) {
        path = path || focusPath;
        if (path[0]) {
            var within = path !== focusPath ? element : focusable(element);
            if (!within) {
                var lockParent = focusLockedWithin(element);
                element = focused(lockParent) ? path[0] : lockParent;
                within = focusable(element);
            }
            if (!within) {
                return false;
            }
            var removed = path.splice(0, path.indexOf(within));
            each(removed, function (i, v) {
                focusElements.delete(v);
            });
            triggerFocusEvent('focusout', removed, element, source);
        }
        // check whether the element is still attached in ROM
        // which can be detached while dispatching focusout event above
        if (containsOrEquals(root, element)) {
            if (focusOnInput && !is(element, SELECTOR_FOCUSABLE)) {
                element = $(SELECTOR_FOCUSABLE, element).filter(':visible:not(:disabled,.disabled)')[0] || element;
            }
            var added = parentsAndSelf(element).filter(function (v) {
                return !focusElements.has(v);
            });
            var friend = map(added, function (v) {
                return focusFriends.get(v);
            })[0];
            if (friend && !focused(friend)) {
                var result = setFocus(friend);
                if (result !== undefined) {
                    return result && setFocus(element);
                }
            }
            if (added[0]) {
                path.unshift.apply(path, added);
                each(added, function (i, v) {
                    focusElements.add(v);
                });
                triggerFocusEvent('focusin', added, null, source || new ZetaEventSource(added[0], path));
            }
            var activeElement = document.activeElement;
            if (path[0] !== activeElement) {
                new ZetaMixin(path[0]).focus();
                // ensure previously focused element is properly blurred
                // in case the new element is not focusable
                if (document.activeElement === activeElement) {
                    activeElement.blur();
                }
            }
            return true;
        }
    }

    function getScrollParent(element) {
        for (; element !== root && getComputedStyle(element).overflow === 'visible'; element = element.parentNode);
        return element;
    }

    function scrollIntoView(element, rect) {
        var parent = getScrollParent(element);
        var mixin = new ZetaMixin(parent);
        var parentRect = mixin.getUnobscuredRect(element);
        rect = rect || getRect(element);

        var deltaX = Math.max(0, rect.right - parentRect.right) || Math.min(rect.left - parentRect.left, 0);
        var deltaY = Math.max(0, rect.bottom - parentRect.bottom) || Math.min(rect.top - parentRect.top, 0);
        var result = deltaX || deltaY ? mixin.scrollBy(deltaX, deltaY) : OFFSET_ZERO;
        if (parent !== root) {
            var parentResult = scrollIntoView(parent.parentNode, rect.translate(result.x, result.y));
            if (parentResult) {
                result = {
                    x: result.x + parentResult.x,
                    y: result.y + parentResult.y
                };
            }
        }
        return (result.x || result.y) ? result : false;
    }

    function snapToElement(element, options) {
        if (isVisible(element) && (options.to === window || isVisible(options.to))) {
            var dir = options.dir;
            if (dir === 'auto') {
                if (options.to === window) {
                    dir = 'center inset';
                } else {
                    var winRect = getRect();
                    var rect = getRect(getScrollParent(options.to));
                    var area = [winRect.height * (rect.left - winRect.left), winRect.height * (winRect.right - rect.right), winRect.width * (rect.top - winRect.top), winRect.width * (winRect.bottom - rect.bottom)];
                    dir = 'left right top bottom'.split(' ')[area.indexOf(Math.max.apply(null, area))] + ' center';
                }
            }
            helper.position(element, options.to, dir);
        }
    }

    function drag(event, within, callback) {
        var deferred = $.Deferred();
        var lastPos = event;
        var scope = getEventScope(event.target);
        var progress = isFunction(callback || within) || helper.noop;
        var scrollParent = getScrollParent(is(within, Node) || event.target);
        var scrollTimeout;
        var unbind1, unbind2;

        function finish(accept) {
            clearInterval(scrollTimeout);
            unbind1();
            unbind2();
            deferred[accept ? 'resolve' : 'reject']();
        }

        var handlers = {
            keydown: function (e) {
                if (e.which === 27) {
                    finish(false);
                }
            },
            mousemove: function (e) {
                e.preventDefault();
                if (!e.which) {
                    finish(true);
                } else if (e.clientX !== lastPos.clientX || e.clientY !== lastPos.clientY) {
                    lastPos = e;
                    progress(e.clientX, e.clientY);
                }
            },
            mouseup: function (e) {
                finish(true);
            },
            touchend: function (e) {
                finish(true);
            }
        };
        var scrollParentHandlers = {
            mouseout: function (e) {
                if (!scrollTimeout && (!containsOrEquals(scrollParent, e.relatedTarget) || (scrollParent === root && e.relatedTarget === root))) {
                    scrollTimeout = setInterval(function () {
                        if (scrollIntoView(scrollParent, helper.toPlainRect(lastPos.clientX - 50, lastPos.clientY - 50, lastPos.clientX + 50, lastPos.clientY + 50))) {
                            progress(lastPos.clientX, lastPos.clientY);
                        } else {
                            clearInterval(scrollTimeout);
                            scrollTimeout = null;
                        }
                    }, 20);
                }
            },
            mouseover: function (e) {
                if (e.target !== root) {
                    clearInterval(scrollTimeout);
                    scrollTimeout = null;
                }
            }
        };
        unbind1 = bind(document.body, handlers);
        unbind2 = bind(scrollParent, scrollParentHandlers);
        return {
            then: function (a, b) {
                return deferred.then(a && scope.wrap(a), b && scope.wrap(b));
            },
            catch: function (a) {
                return deferred.catch(a && scope.wrap(a));
            }
        };
    }

    function ZetaMixin(element) {
        this.element = element;
    }

    function defineMixinMethod(method) {
        if (!new ZetaMixin()[method]) {
            ZetaMixin.prototype[method] = function () {
                var fn = this.support(method);
                return fn ? fn.apply(null, arguments) : console.warn('Method ' + method + ' not handled', this.element);
            };
        }
    }

    function defineMixin(mixin) {
        mixinHandlers.push(mixin);
        each(mixin, function (i, v) {
            if (isFunction(v) && i !== 'canHandle' && i !== 'support') {
                defineMixinMethod(i);
            }
        });
    }

    function getMixinMethod(element, method) {
        var mixin = (mapGet(containers, element) || '').context;
        var fn = mixin && (isFunction(mixin[method]) || (isFunction(mixin.support) && isFunction(mixin.support(method))));
        if (fn) {
            return fn.bind(mixin);
        }
        fn = mapGet(mixins, element, function () {
            var obj = {};
            each(mixinHandlers, function (i, v) {
                if ((!v.element || is(element, v.element)) && (!v.canHandle || v.canHandle(element))) {
                    extend(obj, v);
                }
            });
            return obj;
        })[method];
        return fn ? fn.bind(element, element) : false;
    }

    definePrototype(ZetaMixin, {
        support: function (method) {
            return getMixinMethod(this.element, method);
        }
    });

    function ZetaEventSource(target, path) {
        var self = this;
        path = path || (eventSource ? eventSource.path : focusPath.slice(0));
        self.path = path;
        self.source = 'script';
        if (containsOrEquals(path[0] || root, target) || path.indexOf(target) >= 0) {
            self.source = eventSource ? eventSource.source : getEventSource();
        }
        self.sourceKeyName = self.source !== 'keyboard' ? null : (eventSource || lastEventSource || '').sourceKeyName;
    }

    function ZetaEvent(event, eventName, state, data) {
        var self = extend(this, event.properties);
        self.eventName = eventName;
        self.context = state.context;
        self.target = containsOrEquals(event.target, state.element) ? state.element : event.target;
        self.data = null;
        if (self.context.typer) {
            self.typer = self.context.typer;
            self.widget = self.context;
        }
        if (isPlainObject(data)) {
            extend(self, data);
        } else if (data !== undefined) {
            self.data = data;
        }
        _(self, event);
    }

    definePrototype(ZetaEvent, {
        handled: function (promise) {
            var event = _(this);
            if (!event.handled) {
                event.handled = when(promise);
            }
        },
        isHandled: function () {
            return !!_(this).handled;
        },
        preventDefault: function () {
            var event = this.originalEvent;
            if (event) {
                event.preventDefault();
            } else {
                _(this).defaultPrevented = true;
            }
        },
        isDefaultPrevented: function () {
            return !!(this.originalEvent || _(this)).defaultPrevented;
        }
    });

    function ZetaEventHandlerState(element, context, handlers) {
        var self = this;
        var copy = {};
        each(handlers, function (i, v) {
            if (isFunction(v)) {
                copy[i] = v;
            }
        });
        self.element = element;
        self.context = context;
        self.handlers = copy;
    }

    function ZetaEventEmitter(eventName, container, target, data, originalEvent, bubbles, source) {
        target = target || container.element;
        source = source || new ZetaEventSource(target);
        var properties = {
            source: source.source,
            sourceKeyName: source.sourceKeyName,
            timestamp: performance.now(),
            originalEvent: originalEvent || null
        };
        extend(this, {
            container: container,
            eventName: eventName,
            target: target,
            data: data,
            bubbles: bubbles,
            properties: properties,
            sourceObj: source
        }, properties);
    }

    definePrototype(ZetaEventEmitter, {
        emit: function (container, eventName, target, bubbles) {
            var self = this;
            container = container || self.container;
            bubbles = bubbles === undefined ? self.bubbles : bubbles;

            var callHandler = function (state, handlerName, eventName, data) {
                if (handlerName === 'init' || handlerName === 'destroy') {
                    // prevent init and destroy event from called consecutively twice
                    if (state.lastEvent === handlerName) {
                        return false;
                    }
                    state.lastEvent = handlerName;
                }
                var handler = state.handlers[handlerName || eventName];
                if (!handler) {
                    return false;
                }
                var contextContainer = is(state.context, ZetaContainer) || container;
                var event = new ZetaEvent(self, eventName, state, data === undefined ? containerRemoveAsyncEvent(container, eventName, state) : data);
                var prevEventSource = eventSource;
                var prevEvent = contextContainer.event;
                contextContainer.event = event;
                eventSource = self.sourceObj;
                try {
                    var returnValue = handler.call(event.context, event, event.context);
                    if (returnValue !== undefined) {
                        self.handled = when(returnValue);
                    }
                } catch (e) {
                    console.error(e);
                    self.handled = reject(e);
                }
                eventSource = prevEventSource;
                contextContainer.event = prevEvent;

                // return focus after execution where focus is likely
                // temporarily changed to current element by mouse event
                if (self.handled && self.source === 'mouse') {
                    var activeElement = focusPath[0];
                    helper.always(self.handled, function () {
                        if (activeElement === focusPath[0]) {
                            var activeContainer = getContainer(activeElement);
                            for (var i = 1, len = focusPath.length; i < len; i++) {
                                if (!containsOrEquals(focusPath[i], focusPath[i - 1]) && getContainer(focusPath[i]) !== activeContainer) {
                                    setFocus(focusPath[i]);
                                    break;
                                }
                            }
                        }
                    });
                }
                return self.handled;
            };
            if (is(target, ZetaEventHandlerState)) {
                return callHandler(target, eventName, self.eventName, self.data);
            }
            // find the nearest ancestor that has widget or context set
            var context = container.getContext(target || self.target);
            return single((bubbles ? parentsAndSelf : makeArray)(context), function (v) {
                var component = container.components.get(v.element || v);
                return component && single(component.states, function (v) {
                    return callHandler(v, eventName, self.eventName, self.data);
                });
            });
        }
    });

    function ZetaComponent() {
        this.states = {};
    }

    function ZetaContainer(element, context) {
        var self = this;
        if (element) {
            containers.set(element, self);
        }
        self.element = element || root;
        self.context = context || null;
        self.components = new Map();
        self.asyncEvents = new Map();
        self.autoDestroy = containsOrEquals(root, element);
        if (element) {
            containers.set(element, self);
        }
    }

    function containerEmitAsyncEvents(inst) {
        inst.timeout = null;
        while (inst.asyncEvents.size) {
            var map = inst.asyncEvents;
            inst.asyncEvents = new Map();
            each(map, function (i, v) {
                each(v, function (j, v) {
                    if (!isPlainObject(i) || i.handlers[j]) {
                        v.emit(null, null, i);
                    }
                });
            });
            each(map, function (i, v) {
                var obj = mapGet(inst.components, i.element || i);
                if (obj && !obj.attached) {
                    inst.components.delete(i.element || i);
                }
            });
        }
    }

    function containerRemoveAsyncEvent(inst, eventName, target) {
        var obj = mapGet(inst.asyncEvents, target);
        if (obj && obj[eventName]) {
            var data = obj[eventName].data;
            delete obj[eventName];
            return data || {
                data: data
            };
        }
    }

    function containerRegisterAsyncEvent(inst, eventName, target, data, bubbles, mergeData) {
        var obj = mapGet(inst.asyncEvents, target, Object);
        obj[eventName] = new ZetaEventEmitter(eventName, inst, target.element || target, mergeData && obj[eventName] ? mergeData(obj[eventName].data, data) : data, null, bubbles);
        inst.timeout = inst.timeout || setTimeout(containerEmitAsyncEvents, null, inst);
    }

    function containerRegisterWidgetEvent(container, state, isInit) {
        var event = ['destroy', 'init'];
        if (state.attached ^ isInit && !containerRemoveAsyncEvent(container, event[+!isInit], state)) {
            containerRegisterAsyncEvent(container, event[+isInit], state);
        }
        state.attached = isInit;
    }

    function containerValidTarget(container, element) {
        return container === domEventTrap || (containers.get(element) || container) === container;
    }

    function containerCreateObserver(container, callback, options) {
        function handleMutations(mutations) {
            var changes = [];
            var orphans = new Map();
            each(mutations, function (i, v) {
                // filter out changes due to sizzle engine
                // to prevent excessive invocation due to querying elements through jQuery
                if (v.attributeName !== 'id' || ((v.oldValue || '').slice(0, 6) !== 'sizzle' && (v.target.id !== (v.oldValue || '')))) {
                    if (!containsOrEquals(container.element, v.target)) {
                        mapGet(orphans, v.target, Array).push(v);
                    } else if (containerValidTarget(container, v.target)) {
                        each(v.removedNodes, function (i, v) {
                            if (orphans.has(v)) {
                                changes.push.apply(changes, orphans.get(v));
                            }
                        });
                        changes.push(v);
                    }
                }
            });
            changes = changes.filter(function (v) {
                return options[v.type];
            });
            if (changes[0]) {
                callback(changes);
            }
        }

        var moptions = extend({}, options);
        moptions.subtree = true;
        moptions.childList = true;
        moptions.attributeOldValue |= options.attributes;

        var observer = new MutationObserver(handleMutations);
        observer.observe(container.element, moptions);
        return function () {
            handleMutations(observer.takeRecords());
        };
    }

    function containerGetContext(inst, element) {
        var component;
        for (var cur = element; cur && !component; cur = cur.parentNode) {
            component = inst.components.get(cur);
        }
        return component || null;
    }

    function containerSetContext(inst, element, context) {
        var cur = mapGet(inst.components, element, ZetaComponent);
        if ((cur.context || context) !== context) {
            throw new Error('Element has already been set to another context');
        }
        cur.element = element;
        cur.context = context;
        return cur;
    }

    definePrototype(ZetaContainer, {
        event: null,
        tap: function (handler) {
            domEventTrap.setContext(this.element, this);
            domEventTrap.add(this.element, {
                tap: handler
            });
        },
        getContext: function (element) {
            return (containerGetContext(this, element) || '').context;
        },
        setContext: function (element, context) {
            containerSetContext(this, element, context);
            if (this !== domEventTrap && is(element, Node)) {
                containers.set(element, this);
            }
        },
        add: function (element, key, handlers) {
            if (typeof key !== 'string') {
                handlers = key;
                key = helper.randomId();
            }
            var self = this;
            var target = is(element, Node) || element.element || element;
            var component = is(target, Node) ? containerGetContext(self, target) : containerSetContext(self, element, element);
            if (component) {
                var state = component.states[key] || new ZetaEventHandlerState(target, is(element, Node) ? component.context : element, handlers);
                component.attached = true;
                component.states[key] = state;
                containerRegisterWidgetEvent(self, state, true);
            }
        },
        delete: function (element, key) {
            var self = this;
            var component = mapGet(self.components, element);
            if (component) {
                if (key) {
                    var state = component.states[key];
                    if (state) {
                        delete component.states[key];
                        containerRegisterWidgetEvent(self, state, false);
                    }
                } else {
                    component.attached = false;
                    each(component.states, function (i, v) {
                        containerRegisterWidgetEvent(self, v, false);
                    });
                }
            }
        },
        observe: function (callback, options) {
            return containerCreateObserver(this, callback, options);
        },
        emit: function (eventName, target, data, bubbles) {
            var event = is(eventName, ZetaEvent) ? _(eventName) : new ZetaEventEmitter(eventName, this, target, data, null, bubbles);
            return event.emit(this, null, target, bubbles);
        },
        emitAsync: function (event, target, data, bubbles, mergeData) {
            containerRegisterAsyncEvent(this, event, target || this.element, data, bubbles, mergeData);
        },
        flushEvents: function () {
            containerEmitAsyncEvents(this);
        },
        destroy: function () {
            var self = this;
            domEventTrap.delete(self.element);
            containers.delete(self.element);
            each(self.components, function (i, v) {
                containers.delete(i);
                self.emit('destroy', i);
            });
        }
    });

    function ZetaDOMLock(element) {
        this.element = element;
        lockedElements.set(element, this);
        _(this, {
            promises: new Map()
        });
    }

    function createCancelHandler(fn, done) {
        var promise;
        return function () {
            return promise || (promise = when(fn()).then(done, function () {
                // user has rejected the cancellation
                // remove the promise object so that user will be prompted again
                promise = null;
                return reject('user_cancelled');
            }));
        };
    }

    definePrototype(ZetaDOMLock, {
        get locked() {
            return _(this).promises.size > 0;
        },
        cancel: function (force) {
            var self = this;
            var state = _(self);
            var promises = state.promises;
            if (force || !promises.size) {
                if (promises.size) {
                    triggerDOMEvent('cancelled', null, self.element);
                }
                // remove all promises from the dictionary so that
                // filtered promise from lock.wait() will be rejected by cancellation
                promises.clear();
                state.handler = null;
                if (state.deferred) {
                    state.deferred.resolve();
                }
                return when();
            }
            return (state.handler || (state.handler = createCancelHandler(function () {
                // request user cancellation for each async task in sequence
                return makeArray(promises).reduce(function (a, v) {
                    return a.then(v);
                }, when()).then(function () {
                    self.cancel(true);
                });
            })))();
        },
        wait: function (promise, oncancel) {
            var self = this;
            var state = _(self);
            var promises = state.promises;
            var finish = function () {
                if (promises.delete(promise) && !promises.size) {
                    triggerDOMEvent('asyncEnd', null, self.element);
                    self.cancel(true);
                }
            };
            promises.set(promise, createCancelHandler(oncancel === true ? when : oncancel || reject, finish));
            if (promises.size === 1) {
                state.deferred = $.Deferred();
                for (var parent = self.element.parentNode; parent && !lockedElements.has(parent); parent = parent.parentNode);
                if (parent) {
                    lockedElements.get(parent).wait(state.deferred, self.cancel.bind(self));
                }
                triggerDOMEvent('asyncStart', null, self.element);
            }
            promise.catch(function (error) {
                if (error && !handledErrors.has(error)) {
                    triggerDOMEvent('error', null, self.element, {
                        error: error
                    }, true);
                    // avoid firing error event for the same error for multiple target
                    // while propagating through the promise chain
                    if (typeof error === 'object') {
                        handledErrors.set(error, true);
                    }
                }
                finish();
            });
            return promise.then(function (value) {
                var cancelled = !promises.has(promise);
                finish();
                // the returned promise will be rejected
                // if the current lock has been released or cancelled
                return cancelled ? reject('user_cancelled') : value;
            });
        }
    });

    domEventTrap = new ZetaContainer();
    domContainer = new ZetaContainer();

    var dom = {
        drag: drag,
        getEventScope: getEventScope,
        scrollIntoView: scrollIntoView,
        focused: focused,
        get activeElement() {
            return focusPath[0];
        },
        get eventSource() {
            return getEventSource();
        },
        getEventSource: function (element) {
            return new ZetaEventSource(element).source;
        },
        getContext: function (element) {
            return getContainer(element || focusPath[0]).context;
        },
        focus: function (element) {
            if (helper.isArray(element)) {
                var minY = Infinity;
                element = any(element, function (v) {
                    var rect = getRect(v);
                    return rect.width && rect.height && (minY = Math.min(minY, rect.top)) === rect.top;
                });
            }
            setFocus(element, true);
        },
        setModal: function (element, within) {
            var focusWithin = is(within, Node) || root;
            if (!focused(focusWithin)) {
                setFocus(focusWithin);
            }
            modalElements.set(element, focusPath.splice(0, focusWithin === root || document.body ? focusPath.length : focusPath.indexOf(focusWithin)));
            setFocus(element);
        },
        lock: function (element, promise, oncancel) {
            var lock = lockedElements.get(element) || new ZetaDOMLock(element);
            return promise ? lock.wait(promise, oncancel) : when();
        },
        locked: function (element, parents) {
            return !!any(parents ? parentsAndSelf(element) : [element], function (v) {
                return (lockedElements.get(v) || '').locked;
            });
        },
        cancel: function (element, force) {
            var lock = lockedElements.get(element);
            return lock ? lock.cancel(force) : when();
        },
        emit: function (eventName, element, data, bubbles) {
            return triggerDOMEvent(eventName, null, element, data, bubbles);
        },
        on: function (element, event, handler) {
            if (!is(element, Node)) {
                handler = event;
                event = element;
                element = root;
            }
            domContainer.setContext(element, element);
            domContainer.add(element, isPlainObject(event) || kv(event, handler));
        },
        retainFocus: function (a, b) {
            focusFriends.set(b, a);
        },
        releaseFocus: function (a, b) {
            focusFriends.delete(b);
        },
        mixin: function (element) {
            return is(element, Node) ? new ZetaMixin(element) : defineMixin(element);
        },
        support: function (method, skipCurrent) {
            var container = getContainer(focusPath[0]);
            return single(focusPath, function (v) {
                return (!skipCurrent || getContainer(v) !== container) && getMixinMethod(v, method);
            });
        },
        snap: function (element, to, dir) {
            to = to || root;
            var prop = {
                to: to,
                dir: dir || 'left bottom'
            };
            snaps.set(element, prop);
            if (!containsOrEquals(root, element)) {
                document.body.appendChild(element);
            }
            helper.setZIndexOver(element, to === window ? document.body : to);
            snapToElement(element, prop);
        },
        unsnap: function (element) {
            snaps.delete(element);
        },
        getShortcut: function (command) {
            return commandKeys[command] ? commandKeys[command].slice(0) : [];
        },
        setShortcut: function (command, keys) {
            if (isPlainObject(command)) {
                each(command, dom.setShortcut);
                return;
            }
            var current = commandKeys[command] || (commandKeys[command] = []);
            var before = current.slice(0);
            each(keys, function (i, v) {
                var index = before.indexOf(v);
                if (index >= 0) {
                    before.splice(index, 1);
                } else {
                    current[current.length] = v;
                    (shortcuts[v] || (shortcuts[v] = {}))[command] = true;
                }
            });
            each(before, function (i, v) {
                current.splice(current.indexOf(v), 1);
                delete shortcuts[v][command];
            });
        }
    };
    zeta.Container = ZetaContainer;
    zeta.dom = dom;

    dom.setShortcut({
        undo: 'ctrlZ',
        redo: 'ctrlY ctrlShiftZ',
        selectAll: 'ctrlA'
    });
    dom.on('keystroke', function (e) {
        var fn = single(shortcuts[e.data], function (v, i) {
            return dom.support(i);
        });
        return fn && e.handled(fn());
    });
    dom.on('escape', function (e) {
        setFocus(document.body);
    });

    dom.lock(document);
    window.onbeforeunload = function (e) {
        if (dom.locked(document)) {
            e.returnValue = '';
            e.preventDefault();
        }
    };

    $(function () {
        var selection = window.getSelection();
        var body = document.body;
        var modifierCount;
        var modifiedKeyCode;
        var mousemovedX;
        var mousemovedY;
        var mousedownFocus;
        var previousPoint;
        var imeNode;
        var imeOffset;
        var imeText;

        function getEventName(e, suffix) {
            var mod = ((e.ctrlKey || e.metaKey) ? 'Ctrl' : '') + (e.altKey ? 'Alt' : '') + (e.shiftKey ? 'Shift' : '');
            return mod ? helper.lcfirst(mod + helper.ucfirst(suffix)) : suffix;
        }

        function updateIMEState() {
            var element = document.activeElement;
            if ('selectionEnd' in element) {
                imeNode = element;
                imeOffset = element.selectionEnd;
            } else {
                imeNode = selection.anchorNode;
                imeOffset = selection.anchorOffset;
                if (imeNode.nodeType === 1) {
                    // IE puts selection at element level
                    // however it will insert text in the previous text node
                    var child = imeNode.childNodes[imeOffset - 1];
                    if (child && child.nodeType === 3) {
                        imeNode = child;
                        imeOffset = child.length;
                    } else {
                        imeNode = imeNode.childNodes[imeOffset];
                        imeOffset = 0;
                    }
                }
            }
        }

        function triggerKeystrokeEvent(keyName, nativeEvent) {
            lastEventSource.sourceKeyName = keyName;
            if (triggerUIEvent('keystroke', nativeEvent, focusPath, keyName, true)) {
                nativeEvent.preventDefault();
                return true;
            }
        }

        function triggerMouseEvent(eventName, nativeEvent) {
            var point = nativeEvent.touches ? nativeEvent.touches[0] : nativeEvent;
            return triggerDOMEvent(eventName, nativeEvent, nativeEvent.target, {
                target: nativeEvent.target,
                clientX: point.clientX,
                clientY: point.clientY,
                metakey: getEventName(nativeEvent)
            });
        }

        function unmount(mutations) {
            var mapRemove = function (map, key) {
                var value = map.get(key);
                map.delete(key);
                return value;
            };
            // automatically free resources when DOM nodes are removed from document
            each(mutations, function (i, v) {
                each(v.removedNodes, function (i, v) {
                    if (v.nodeType === 1 && !containsOrEquals(root, v)) {
                        var container = containers.get(v);
                        if (container && container.autoDestroy && container.element === v) {
                            container.destroy();
                        }
                        var lock = mapRemove(lockedElements, v);
                        if (lock) {
                            lock.cancel(true);
                        }
                        var modalPath = mapRemove(modalElements, v);
                        if (modalPath && focused(v)) {
                            var path = any(modalElements, function (w) {
                                return w.indexOf(v) >= 0;
                            }) || focusPath;
                            path.push.apply(path, modalPath);
                            setFocus(modalPath[0], false, null, path);
                        }
                        var index = focusPath.indexOf(v);
                        if (index >= 0) {
                            setFocus(focusPath[index + 1] || body);
                        }
                        each(snaps, function (i, w) {
                            if (containsOrEquals(v, i) || containsOrEquals(v, w.to)) {
                                snaps.delete(i);
                            }
                        });
                    }
                });
            });
            updateSnaps();
        }

        if (zeta.IS_IE10) {
            // polyfill for pointer-events: none for IE10
            bind(body, 'mousedown mouseup mousemove click', function (e) {
                if (getComputedStyle(e.target).pointerEvents === 'none') {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    var event = document.createEvent('MouseEvent');
                    event.initMouseEvent(e.type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
                    helper.elementFromPoint(e.clientX, e.clientY).dispatchEvent(event);
                }
            }, true);
        }

        // document.activeElement or FocusEvent.relatedTarget does not report non-focusable element
        bind(body, 'mousedown mouseup wheel keydown keyup keypress touchstart touchend cut copy paste drop click dblclick contextmenu', function (e) {
            var moveFocus = matchWord(e.type, 'mousedown keydown');
            lastEventSource = null;
            if (!focusable(e.target)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                if (moveFocus) {
                    triggerDOMEvent('focusreturn', null, focusPath.slice(-1)[0]);
                }
            } else if (moveFocus) {
                setFocus(e.target);
            }
            lastEventSource = new ZetaEventSource(e.target);
        }, true);

        // detect blur to other page
        bind(window, 'blur', function (e) {
            if (e.target === window) {
                windowFocusedOut = true;
            }
        }, true);

        bind(body, {
            compositionstart: function (e) {
                updateIMEState();
                imeText = '';
            },
            compositionupdate: function (e) {
                imeText = e.data;
            },
            compositionend: function (e) {
                var isInputElm = 'selectionEnd' in imeNode;
                var prevText = imeText;
                var prevOffset = imeOffset;
                updateIMEState();

                var curText = imeNode.value || imeNode.data || '';
                imeText = e.data;
                // some IME lacks inserted character sequence when selecting from phrase candidate list
                // also legacy Microsoft Changjie IME reports full-width spaces (U+3000) instead of actual characters
                if (!imeText || /^\u3000+$/.test(imeText)) {
                    imeText = curText.slice(prevOffset, imeOffset);
                }

                // some old mobile browsers fire compositionend event before replacing final character sequence
                // need to compare both to truncate the correct range of characters
                var o1 = imeOffset - imeText.length;
                var o2 = imeOffset - prevText.length;
                var startOffset = curText.slice(o1, imeOffset) === imeText ? o1 : o2;
                var newText = curText.substr(0, startOffset) + curText.slice(imeOffset);
                if (isInputElm) {
                    imeNode.value = newText;
                    imeNode.setSelectionRange(startOffset, startOffset);
                } else {
                    imeNode.data = newText;
                    helper.makeSelection(imeNode, startOffset);
                }
                if (!triggerUIEvent('textInput', e, focusPath[0], imeText)) {
                    if (isInputElm) {
                        imeNode.value = curText;
                        imeNode.setSelectionRange(imeOffset, imeOffset);
                    } else {
                        imeNode.data = curText;
                        helper.makeSelection(imeNode, imeOffset);
                    }
                }
                imeNode = null;
                setTimeout(function () {
                    imeText = null;
                });
            },
            textInput: function (e) {
                // required for older mobile browsers that do not support beforeinput event
                // ignore in case browser fire textInput before/after compositionend
                if (!imeNode && (e.data === imeText || triggerUIEvent('textInput', e, focusPath[0], e.data))) {
                    e.preventDefault();
                }
            },
            keydown: function (e) {
                if (!imeNode) {
                    var keyCode = e.keyCode;
                    var isModifierKey = (META_KEYS.indexOf(keyCode) >= 0);
                    if (isModifierKey && keyCode !== modifiedKeyCode) {
                        triggerUIEvent('metakeychange', e, focusPath, getEventName(e), true);
                    }
                    var isSpecialKey = !isModifierKey && (KEYNAMES[keyCode] || '').length > 1 && !(keyCode >= 186 || (keyCode >= 96 && keyCode <= 111));
                    modifierCount = e.ctrlKey + e.shiftKey + e.altKey + e.metaKey + !isModifierKey;
                    modifierCount *= isSpecialKey || ((modifierCount > 2 || (modifierCount > 1 && !e.shiftKey)) && !isModifierKey);
                    modifiedKeyCode = keyCode;
                    if (modifierCount) {
                        triggerKeystrokeEvent(getEventName(e, KEYNAMES[keyCode] || e.key), e);
                    }
                }
            },
            keyup: function (e) {
                var isModifierKey = (META_KEYS.indexOf(e.keyCode) >= 0);
                if (!imeNode && (isModifierKey || modifiedKeyCode === e.keyCode)) {
                    modifiedKeyCode = null;
                    modifierCount--;
                    if (isModifierKey) {
                        triggerUIEvent('metakeychange', e, focusPath, getEventName(e) || '', true);
                    }
                }
            },
            keypress: function (e) {
                var data = e.char || e.key || String.fromCharCode(e.charCode);
                if (!imeNode && !modifierCount && (e.synthetic || !('onbeforeinput' in e.target))) {
                    if (textInputAllowed(e.target)) {
                        lastEventSource.sourceKeyName = KEYNAMES[modifiedKeyCode] || data;
                        triggerUIEvent('textInput', e, focusPath[0], data);
                    } else {
                        triggerKeystrokeEvent(data, e);
                    }
                }
            },
            beforeinput: function (e) {
                if (!imeNode && e.cancelable) {
                    switch (e.inputType) {
                        case 'insertText':
                            return triggerUIEvent('textInput', e, focusPath[0], e.data);
                        case 'deleteContent':
                        case 'deleteContentBackward':
                            return triggerKeystrokeEvent('backspace', e);
                        case 'deleteContentForward':
                            return triggerKeystrokeEvent('delete', e);
                    }
                }
            },
            mousedown: function (e) {
                mousemovedX = 0;
                mousemovedY = 0;
                previousPoint = e;
                if ((e.buttons || e.which) === 1) {
                    triggerMouseEvent('mousedown', e);
                }
                mousedownFocus = document.activeElement;
            },
            mousemove: function (e) {
                if (previousPoint) {
                    mousemovedX = Math.max(mousemovedX, Math.abs(previousPoint.clientX - e.clientX));
                    mousemovedY = Math.max(mousemovedY, Math.abs(previousPoint.clientY - e.clientY));
                }
            },
            mouseup: function (e) {
                if (mousedownFocus && document.activeElement !== mousedownFocus) {
                    mousedownFocus.focus();
                }
            },
            wheel: function (e) {
                if (containsOrEquals(e.target, focusPath[0]) || !textInputAllowed(e.target)) {
                    var dir = e.deltaY || e.detail;
                    if (triggerUIEvent('mousewheel', e, e.target, dir / Math.abs(dir) * (zeta.IS_MAC ? -1 : 1), true)) {
                        e.preventDefault();
                    }
                }
                for (var cur = e.target; cur !== body; cur = cur.parentNode) {
                    var style = getComputedStyle(cur);
                    if ((cur.scrollHeight > cur.offsetHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll')) || (cur.scrollWidth > cur.offsetWidth && (style.overflowX === 'auto' || style.overflowX === 'scroll'))) {
                        break;
                    }
                }
                if (!focusable(cur)) {
                    e.preventDefault();
                }
            },
            click: function (e) {
                if (mousemovedX <= 5 && mousemovedY <= 5) {
                    triggerMouseEvent('click', e);
                }
            },
            contextmenu: function (e) {
                triggerMouseEvent('rightClick', e);
            },
            dblclick: function (e) {
                triggerMouseEvent('dblclick', e);
            },
            focusin: function (e) {
                windowFocusedOut = false;
                if (focusable(e.target)) {
                    setFocus(e.target, false, lastEventSource);
                } else {
                    e.target.blur();
                }
            }
        }, true);

        new MutationObserver(unmount).observe(root, {
            subtree: true,
            childList: true
        });
        setFocus(document.activeElement);

        // detect native scrollbar size
        // height being picked because scrollbar may not be shown if container is too short
        var $dummy = $('<div style="overflow:scroll;height:80px"><div style="height:100px"></div></div>').appendTo(body);
        scrollbarWidth = $dummy.outerWidth() - $dummy.children().width();
        $dummy.remove();

        var timeout;

        function updateSnaps() {
            timeout = timeout || setTimeout(function () {
                timeout = null;
                each(snaps, snapToElement);
            });
        }
        bind(window, 'resize scroll orientationchange', updateSnaps, {
            passive: true
        });
        bind(body, 'mousemove wheel keyup touchend transitionend MSTransitionEnd', updateSnaps, {
            passive: true
        });
    });

    // define common mixin methods that is not mentioned in this file
    'undo redo canUndo canRedo enable disable enabled'.split(' ').forEach(defineMixinMethod);

    defineMixin({
        focus: function (element) {
            element.focus();
        },
        scrollBy: function (element, x, y) {
            var winOrElm = element === root || element === document.body ? window : element;
            var origX = $(winOrElm).scrollLeft();
            var origY = $(winOrElm).scrollTop();
            if (winOrElm.scrollBy) {
                winOrElm.scrollBy(x, y);
            } else {
                winOrElm.scrollLeft = origX + x;
                winOrElm.scrollTop = origY + y;
            }
            return {
                x: $(winOrElm).scrollLeft() - origX,
                y: $(winOrElm).scrollTop() - origY
            };
        },
        getUnobscuredRect: function (element) {
            var style = getComputedStyle(element);
            var hasOverflowX = element.offsetWidth < element.scrollWidth;
            var hasOverflowY = element.offsetHeight < element.scrollHeight;
            var parentRect = getRect(element === document.body ? root : element);
            if ((style.overflow !== 'visible' || element === document.body) && (hasOverflowX || hasOverflowY)) {
                if (style.overflowY === 'scroll' || ((style.overflowY !== 'hidden' || element === document.body) && hasOverflowY)) {
                    parentRect.right -= scrollbarWidth;
                }
                if (style.overflowX === 'scroll' || ((style.overflowX !== 'hidden' || element === document.body) && hasOverflowX)) {
                    parentRect.bottom -= scrollbarWidth;
                }
            }
            return parentRect;
        }
    });
    defineMixin({
        element: ':input',
        getValue: function (element) {
            return element.value;
        },
        setValue: function (element, value) {
            element.value = value;
        }
    });

}(jQuery, zeta));
