(function () {
    'use strict';

    var ANIMATION_END = 'animationend oanimationend webkitAnimationEnd';
    var TRANSITION_END = 'transitionend otransitionend webkitTransitionEnd';
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

    var elementsFromPoint_ = document.msElementsFromPoint || document.elementsFromPoint;
    var compareDocumentPosition_ = document.compareDocumentPosition;
    var compareBoundaryPoints_ = Range.prototype.compareBoundaryPoints;
    var defineProperty = Object.defineProperty;
    var keys = Object.keys;
    var getComputedStyle = window.getComputedStyle;
    var when = jQuery.when;

    var root = document.documentElement;
    var selection = window.getSelection();
    var wsDelimCache = {};
    var originDiv = $('<div style="position:fixed; top:0; left:0;">')[0];

    function noop() { }

    function isArray(obj) {
        return Array.isArray(obj) && obj;
    }

    function isFunction(obj) {
        return typeof obj === 'function' && obj;
    }

    function isPlainObject(obj) {
        var proto = typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj);
        return (proto === Object.prototype || proto === null) && obj;
    }

    function extend() {
        var options, name, src, copy, copyIsArray, clone;
        var target = arguments[0] || {};
        var i = 1;
        var length = arguments.length;
        var deep = false;

        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== 'object' && !isFunction(target)) {
            target = {};
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) !== null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }
                        // never move original objects, clone them
                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        // don't bring in undefined values
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    function isArrayLike(obj) {
        if (isFunction(obj) || obj === window) {
            return false;
        }
        var length = !!obj && 'length' in obj && obj.length;
        return isArray(obj) || length === 0 || (typeof length === 'number' && length > 0 && (length - 1) in obj);
    }

    function each(obj, callback) {
        if (obj) {
            var cur, i = 0;
            if (typeof obj === 'string') {
                obj = obj.split(' ');
            } else if (obj instanceof shim.Set) {
                // would be less useful if key and value refers to the same object
                obj = isFunction(obj.values) ? obj.values() : (function (obj, arr) {
                    return obj.forEach(function (v) {
                        arr[arr.length] = v;
                    }), arr;
                }(obj, []));
            }
            if (isArrayLike(obj)) {
                var len = obj.length;
                while (i < len && callback(i, obj[i++]) !== false);
            } else if (isFunction(obj.entries)) {
                obj = obj.entries();
                while (!(cur = obj.next()).done && callback(cur.value[0], cur.value[1]) !== false);
            } else if (isFunction(obj.forEach)) {
                var value;
                obj.forEach(function (v, i) {
                    value = value === false || callback(i, v);
                });
            } else if (isFunction(obj.next)) {
                while (!(cur = obj.next()).done && callback(i++, cur.value) !== false);
            } else if (isFunction(obj.nextNode)) {
                while ((cur = obj.nextNode()) && callback(i++, cur) !== false);
            } else {
                for (i in obj) {
                    if (callback(i, obj[i]) === false) {
                        return;
                    }
                }
            }
        }
    }

    function map(obj, callback) {
        var arr = [];
        each(obj, function (i, v) {
            var result = callback.call(this, v, i);
            if (result !== null && result !== undefined) {
                if (isArray(result)) {
                    arr.push.apply(arr, result);
                } else {
                    arr[arr.length] = result;
                }
            }
        });
        return arr;
    }

    function any(obj, callback) {
        var result;
        each(obj, function (i, v) {
            result = callback.call(this, v, i) && v;
            return !result;
        });
        return result;
    }

    function single(obj, callback) {
        var result;
        each(obj, function (i, v) {
            result = callback.call(this, v, i);
            return !result;
        });
        return result;
    }

    function kv(key, value) {
        var obj = {};
        obj[key] = value;
        return obj;
    }

    function makeArray(obj) {
        if (isArray(obj)) {
            return obj.slice(0);
        }
        if (typeof obj === 'string') {
            return [obj];
        }
        if (obj && (isArrayLike(obj) || isFunction(obj.forEach))) {
            var arr = [];
            each(obj, function (i, v) {
                arr[arr.length] = v;
            });
            return arr;
        }
        return obj !== null && obj !== undefined ? [obj] : [];
    }

    function waitAll(promises) {
        if (!promises[0]) {
            return when();
        }
        var deferred = $.Deferred();
        var count = promises.length;
        var failed;
        each(promises, function (i, v) {
            always(v, function (resolved) {
                failed |= !resolved;
                if (--count === 0) {
                    deferred[failed ? 'reject' : 'resolve']();
                }
            });
        });
        return deferred.promise();
    }

    function reject(reason) {
        return $.Deferred().reject(reason).promise();
    }

    function always(promise, callback) {
        promise.then(function (v) {
            callback(true, v);
        }, function (v) {
            callback(false, v);
        });
    }

    function acceptNode(iterator, node) {
        node = node || iterator.currentNode;
        if (!node || !(iterator.whatToShow & (is(node, Node) ? (1 << (node.nodeType - 1)) : node.nodeType))) {
            return 3;
        }
        return !iterator.filter ? 1 : (iterator.filter.acceptNode || iterator.filter).call(iterator.filter, node);
    }

    function iterate(iterator, callback, from, until) {
        var i = 0;
        iterator.currentNode = from = from || iterator.currentNode;
        callback = callback || noop;
        switch (acceptNode(iterator)) {
            case 2:
                return;
            case 1:
                callback(from, i++);
        }
        for (var cur; (cur = iterator.nextNode()) && (!until || (isFunction(until) ? until(cur) : cur !== until || void callback(cur, i++))); callback(cur, i++));
    }

    function iterateToArray(iterator, callback, from, until) {
        var result = [];
        iterate(iterator, function (v) {
            result[result.length] = v;
        }, from, until);
        return callback ? map(result, callback) : result;
    }

    function createPrivateStore() {
        var map = new shim.WeakMap();
        return function (obj, value) {
            if (value) {
                map.set(obj, value);
            }
            return value || map.get(obj);
        };
    }

    function mapGet(map, key, fn) {
        return map.get(key) || fn && (map.set(key, new fn()), map.get(key));
    }

    function getOwnPropertyDescriptors(obj) {
        var props = {};
        each(Object.getOwnPropertyNames(obj || {}), function (i, v) {
            props[v] = Object.getOwnPropertyDescriptor(obj, v);
        });
        return props;
    }

    function defineGetterProperty(obj, name, get, set) {
        defineProperty(obj, name, {
            configurable: true,
            enumerable: true,
            get: get,
            set: set
        });
    }

    function defineHiddenProperty(obj, name, value) {
        defineProperty(obj, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: value
        });
    }

    function definePrototype(fn, prototype) {
        each(getOwnPropertyDescriptors(prototype), function (i, v) {
            v.enumerable = !isFunction(v.value);
            defineProperty(fn.prototype, i, v);
        });
    }

    function inherit(proto, props) {
        var obj = Object.create(isFunction(proto) ? proto.prototype : proto || Object.prototype);
        each(getOwnPropertyDescriptors(props), function (i, v) {
            defineProperty(obj, i, v);
        });
        return obj;
    }

    function randomId() {
        return Math.random().toString(36).substr(2, 8);
    }

    function repeat(str, count) {
        return new Array(count + 1).join(str);
    }

    function camel(str) {
        return String(str).replace(/-([a-z])/g, function (v, a) {
            return a.toUpperCase();
        });
    }

    function hyphenate(str) {
        return String(str).replace(/[A-Z](?![A-Z])|[A-Z]{2,}(?=[A-Z])/g, function (v, a) {
            return (a ? '-' : '') + v.toLowerCase();
        });
    }

    function ucfirst(v) {
        v = String(v || '');
        return v.charAt(0).toUpperCase() + v.slice(1);
    }

    function lcfirst(v) {
        v = String(v || '');
        return v.charAt(0).toLowerCase() + v.slice(1);
    }

    function trim(v) {
        return String(v || '').replace(/^(?:\u200b|[^\S\u00a0])+|(?:\u200b|[^\S\u00a0])+$/g, '');
    }

    function matchWord(haystack, needle) {
        var re = wsDelimCache[needle] || (wsDelimCache[needle] = new RegExp('(?:^|\\s)(' + needle.replace(/\s+/g, '|') + ')(?=$|\\s)'));
        return re.test(String(haystack || '')) && RegExp.$1;
    }

    function tagName(element) {
        return element && element.tagName && element.tagName.toLowerCase();
    }

    function is(element, selector) {
        if (!element || !selector) {
            return false;
        }
        // constructors of native DOM objects in Safari refuse to be functions
        // use a fairly accurate but fast checking instead of isFunction
        if (selector.prototype) {
            return element instanceof selector && element;
        }
        if (selector.toFixed) {
            return (element.nodeType & selector) && element;
        }
        return (selector === '*' || tagName(element) === selector || $(element).is(selector)) && element;
    }

    function sameElementSpec(a, b) {
        if (tagName(a) !== tagName(b)) {
            return false;
        }
        var thisAttr = a.attributes;
        var prevAttr = b.attributes;
        return thisAttr.length === prevAttr.length && !any(thisAttr, function (v) {
            return !prevAttr[v.nodeName] || v.value !== prevAttr[v.nodeName].value;
        });
    }

    function comparePosition(a, b, strict) {
        if (a === b) {
            return 0;
        }
        var v = a && b && compareDocumentPosition_.call(a, b);
        if (v & 2) {
            return (strict && v & 8) || (v & 1) ? NaN : 1;
        }
        if (v & 4) {
            return (strict && v & 16) || (v & 1) ? NaN : -1;
        }
        return NaN;
    }

    function connected(a, b) {
        return a && b && !(compareDocumentPosition_.call(a.commonAncestorContainer || a, b.commonAncestorContainer || b) & 1);
    }

    function containsOrEquals(container, contained) {
        container = (container || '').element || container;
        contained = (contained || '').element || contained;
        return container === contained || $.contains(container, contained);
    }

    function getCommonAncestor(a, b) {
        for (b = b || a; a && a !== b && compareDocumentPosition_.call(a, b) !== 20; a = a.parentNode);
        return a;
    }

    function getOffset(node, offset) {
        var len = node.length || node.childNodes.length;
        return 1 / offset < 0 ? Math.max(0, len + offset) : Math.min(len, offset);
    }

    function createRange(startNode, startOffset, endNode, endOffset) {
        if (startNode && isFunction(startNode.getRange)) {
            return startNode.getRange();
        }
        var range;
        if (is(startNode, Node)) {
            range = document.createRange();
            if (+startOffset !== startOffset) {
                range[(startOffset === 'contents' || !startNode.parentNode) ? 'selectNodeContents' : 'selectNode'](startNode);
                if (typeof startOffset === 'boolean') {
                    range.collapse(startOffset);
                }
            } else {
                range.setStart(startNode, getOffset(startNode, startOffset));
            }
            if (is(endNode, Node) && connected(startNode, endNode)) {
                range.setEnd(endNode, getOffset(endNode, endOffset));
            }
        } else if (is(startNode, Range)) {
            range = startNode.cloneRange();
            if (!range.collapsed && typeof startOffset === 'boolean') {
                range.collapse(startOffset);
            }
        }
        if (is(startOffset, Range) && connected(range, startOffset)) {
            var inverse = range.collapsed && startOffset.collapsed ? -1 : 1;
            if (compareBoundaryPoints_.call(range, 0, startOffset) * inverse < 0) {
                range.setStart(startOffset.startContainer, startOffset.startOffset);
            }
            if (compareBoundaryPoints_.call(range, 2, startOffset) * inverse > 0) {
                range.setEnd(startOffset.endContainer, startOffset.endOffset);
            }
        }
        return range;
    }

    function rangeIntersects(a, b) {
        a = is(a, Range) || createRange(a);
        b = is(b, Range) || createRange(b);
        return connected(a, b) && compareBoundaryPoints_.call(a, 3, b) <= 0 && compareBoundaryPoints_.call(a, 1, b) >= 0;
    }

    function rangeCovers(a, b) {
        a = is(a, Range) || createRange(a);
        b = is(b, Range) || createRange(b);
        return connected(a, b) && compareBoundaryPoints_.call(a, 0, b) <= 0 && compareBoundaryPoints_.call(a, 2, b) >= 0;
    }

    function rangeEquals(a, b) {
        a = is(a, Range) || createRange(a);
        b = is(b, Range) || createRange(b);
        return connected(a, b) && compareBoundaryPoints_.call(a, 0, b) === 0 && compareBoundaryPoints_.call(a, 2, b) === 0;
    }

    function compareRangePosition(a, b, strict) {
        a = is(a, Range) || createRange(a);
        b = is(b, Range) || createRange(b);
        var value = !connected(a, b) ? NaN : compareBoundaryPoints_.call(a, 0, b) + compareBoundaryPoints_.call(a, 2, b);
        return (strict && ((value !== 0 && rangeIntersects(a, b)) || (value === 0 && !rangeEquals(a, b)))) ? NaN : value && value / Math.abs(value);
    }

    function makeSelection(b, e) {
        // for newer browsers that supports setBaseAndExtent
        // avoid undesirable effects when direction of editor's selection direction does not match native one
        if (selection.setBaseAndExtent && is(e, Range)) {
            selection.setBaseAndExtent(b.startContainer, b.startOffset, e.startContainer, e.startOffset);
            return;
        }

        var range = createRange(b, e);
        try {
            selection.removeAllRanges();
        } catch (e) {
            // IE fails to clear ranges by removeAllRanges() in occasions mentioned in
            // http://stackoverflow.com/questions/22914075
            var r = document.body.createTextRange();
            r.collapse();
            r.select();
            selection.removeAllRanges();
        }
        try {
            selection.addRange(range);
        } catch (e) {
            // IE may throws unspecified error even though the selection is successfully moved to the given range
            // if the range is not successfully selected retry after selecting other range
            if (!selection.rangeCount) {
                selection.addRange(createRange(document.body));
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    function getRect(elm, includeMargin) {
        var rect;
        elm = elm || root;
        if (elm.getRect) {
            return elm.getRect();
        }
        elm = elm.element || elm;
        if (elm === root || elm === window) {
            if (!containsOrEquals(document.body, originDiv)) {
                document.body.appendChild(originDiv);
            }
            // origin used by CSS, DOMRect and properties like clientX/Y may move away from the top-left corner of the window
            // when virtual keyboard is shown on mobile devices
            var o = getRect(originDiv);
            rect = toPlainRect(0, 0, root.offsetWidth, root.offsetHeight).translate(o.left, o.top);
        } else if (!containsOrEquals(root, elm)) {
            // IE10 throws Unspecified Error for detached elements
            rect = toPlainRect(0, 0, 0, 0);
        } else {
            rect = toPlainRect(elm.getBoundingClientRect());
            if (includeMargin) {
                var style = getComputedStyle(elm);
                rect.top -= Math.max(0, parseFloat(style.marginTop));
                rect.left -= Math.max(0, parseFloat(style.marginLeft));
                rect.right += Math.max(0, parseFloat(style.marginRight));
                rect.bottom += Math.max(0, parseFloat(style.marginBottom));
            }
        }
        return rect;
    }

    function getRects(range) {
        return map((is(range, Range) || createRange(range, 'contents')).getClientRects(), toPlainRect);
    }

    function toPlainRect(l, t, r, b) {
        function clip(v) {
            // IE provides precision up to 0.05 but with floating point errors that hinder comparisons
            return Math.round(v * 1000) / 1000;
        }
        if (l.top !== undefined) {
            return new Rect(clip(l.left), clip(l.top), clip(l.right), clip(l.bottom));
        }
        if (r === undefined) {
            return new Rect(l, t, l, t);
        }
        return new Rect(l, t, r, b);
    }

    function rectEquals(a, b) {
        function check(prop) {
            return Math.abs(a[prop] - b[prop]) < 1;
        }
        return check('left') && check('top') && check('bottom') && check('right');
    }

    function rectCovers(a, b) {
        return b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom;
    }

    function pointInRect(x, y, rect, within) {
        within = within || 0;
        return rect.width && rect.height && x - rect.left >= -within && x - rect.right <= within && y - rect.top >= -within && y - rect.bottom <= within;
    }

    function mergeRect(a, b) {
        return toPlainRect(Math.min(a.left, b.left), Math.min(a.top, b.top), Math.max(a.right, b.right), Math.max(a.bottom, b.bottom));
    }

    function elementFromPoint(x, y, container) {
        container = container || document.body;
        if (elementsFromPoint_) {
            return any(elementsFromPoint_.call(document, x, y), function (v) {
                return containsOrEquals(container, v) && getComputedStyle(v).pointerEvents !== 'none';
            }) || null;
        }
        var element = document.elementFromPoint(x, y);
        if (!containsOrEquals(container, element) && pointInRect(x, y, getRect(container))) {
            var tmp = [];
            try {
                while (comparePosition(container, element, true)) {
                    var target = $(element).parentsUntil(getCommonAncestor(container, element)).slice(-1)[0] || element;
                    if (target === tmp[tmp.length - 1]) {
                        return null;
                    }
                    target.style.pointerEvents = 'none';
                    tmp[tmp.length] = target;
                    element = document.elementFromPoint(x, y);
                }
            } finally {
                $(tmp).css('pointer-events', '');
            }
        }
        return containsOrEquals(container, element) ? element : null;
    }

    function createDocumentFragment(node) {
        return is(node, DocumentFragment) || $(document.createDocumentFragment()).append(node)[0];
    }

    function createTextNode(text) {
        return document.createTextNode(text || '\u200b');
    }

    function createElement(name) {
        return document.createElement(name);
    }

    function createNodeIterator(root, whatToShow, filter) {
        return document.createNodeIterator(root, whatToShow, isFunction(filter) || null, false);
    }

    function addOrRemoveEventListener(method, element, event, listener, useCapture) {
        if (isPlainObject(event)) {
            each(event, function (i, v) {
                element[method](i, v, listener);
            });
        } else {
            each(event.split(' '), function (i, v) {
                element[method](v, listener, useCapture);
            });
        }
    }

    function bind(element, event, listener, useCapture) {
        addOrRemoveEventListener('addEventListener', element, event, listener, useCapture);
        return function () {
            unbind(element, event, listener);
        };
    }

    function unbind(element, event, listener) {
        addOrRemoveEventListener('removeEventListener', element, event, listener);
    }

    function removeNode(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    function getState(element, className) {
        var re = new RegExp('(?:^|\\s)\\s*' + className + '(?:-(\\S+)|\\b)$', 'ig');
        var t = [false];
        (element.className || '').replace(re, function (v, a) {
            t[a ? t.length : 0] = a || true;
        });
        return t[1] ? t.slice(1) : t[0];
    }

    function setState(element, className, values) {
        var re = new RegExp('(^|\\s)\\s*' + className + '(?:-(\\S+)|\\b)|\\s*$', 'ig');
        var replaced = 0;
        if (isPlainObject(values)) {
            values = map(values, function (v, i) {
                return v ? i : null;
            });
        }
        element.className = (element.className || '').replace(re, function () {
            return replaced++ || !values || values.length === 0 ? '' : (' ' + className + (values[0] ? [''].concat(values).join(' ' + className + '-') : ''));
        });
    }

    function isVisible(element) {
        if (!connected(root, element)) {
            return false;
        }
        var rect = getRect(element);
        if (!rect.top && !rect.left && !rect.width && !rect.height) {
            for (var cur = element; cur; cur = cur.parentNode) {
                if (getComputedStyle(cur).display === 'none') {
                    return false;
                }
            }
        }
        return true;
    }

    function getZIndex(element, pseudo) {
        var style = getComputedStyle(element, pseudo || null);
        return matchWord(style.position, 'absolute fixed relative') && style.zIndex !== 'auto' ? parseInt(style.zIndex) : -1;
    }

    function getZIndexOver(over) {
        var maxZIndex = -1;
        var iterator = document.createTreeWalker(document.body, 1, function (v) {
            if (comparePosition(v, over, true)) {
                return 2;
            }
            var zIndex = getZIndex(v);
            if (zIndex >= 0) {
                maxZIndex = Math.max(maxZIndex, zIndex);
                return 2;
            }
            maxZIndex = Math.max(maxZIndex, getZIndex(v, '::before'), getZIndex(v, '::after'));
            return 1;
        }, false);
        iterate(iterator);
        return maxZIndex + 1;
    }

    function setZIndexOver(element, over) {
        element.style.zIndex = getZIndexOver(over);
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
    }

    function cssFromPoint(x, y, origin, parent) {
        var refRect = getRect(is(parent || origin, Node) || window);
        var dirX = matchWord(origin || y, 'left right') || 'left';
        var dirY = matchWord(origin || y, 'top bottom') || 'top';
        var style = {};
        y = (((x.top || x.clientY || x.y || y) | 0) - refRect.top);
        x = (((x.left || x.clientX || x.x || x) | 0) - refRect.left);
        style[dirX] = (dirX === 'left' ? x : refRect.width - x) + 'px';
        style[dirY] = (dirY === 'top' ? y : refRect.height - y) + 'px';
        style[FLIP_POS[dirX]] = 'auto';
        style[FLIP_POS[dirY]] = 'auto';
        return style;
    }

    function cssFromRect(rect, parent) {
        var style = cssFromPoint(rect, null, parent);
        style.width = (rect.width | 0) + 'px';
        style.height = (rect.height | 0) + 'px';
        return style;
    }

    function position(element, to, dir, within) {
        if (!containsOrEquals(root, element)) {
            document.body.appendChild(element);
        }
        $(element).css({
            position: 'fixed',
            maxWidth: '',
            maxHeight: ''
        });

        var refRect = isPlainObject(to) || !to ? {} : getRect(to);
        if (!('left' in refRect)) {
            refRect.left = refRect.right = (to.left || to.clientX || to.x) | 0;
            refRect.top = refRect.bottom = (to.right || to.clientY || to.y) | 0;
        }
        var inset = matchWord(dir, 'inset-x inset-y inset') || 'inset-x';
        var winRect = inset === 'inset' ? refRect : getRect(within);
        var elmRect = getRect(element, true);
        var margin = {};
        var point = {};
        var style = {
            transform: ''
        };
        var fn = function (dir, inset, p, pSize, pMax, sTransform) {
            style[pMax] = winRect[pSize] + margin[p] - margin[FLIP_POS[p]];
            if (!FLIP_POS[dir]) {
                var center = (refRect[FLIP_POS[p]] + refRect[p]) / 2;
                dir = center - winRect[p] < elmRect[pSize] / 2 ? p : winRect[FLIP_POS[p]] - center < elmRect[pSize] / 2 ? FLIP_POS[p] : '';
                if (!dir) {
                    style.transform += ' ' + sTransform;
                }
                point[p] = dir ? winRect[dir] : center + margin[p];
                return dir;
            }
            // determine cases of 'normal', 'flip' and 'fit' by available rooms
            var rDir = inset ? FLIP_POS[dir] : dir;
            if (refRect[dir] * DIR_SIGN[rDir] + elmRect[pSize] <= winRect[rDir] * DIR_SIGN[rDir]) {
                point[p] = refRect[dir] + margin[FLIP_POS[rDir]];
            } else if (refRect[FLIP_POS[dir]] * DIR_SIGN[rDir] - elmRect[pSize] > winRect[FLIP_POS[rDir]] * DIR_SIGN[rDir]) {
                dir = FLIP_POS[dir];
                point[p] = refRect[dir] + margin[rDir];
            } else {
                point[p] = winRect[dir];
                style[pMax] = inset ? style[pMax] : Math.abs(refRect[dir] - point[p]) - (DIR_SIGN[dir] * margin[dir]);
                return dir;
            }
            if (!inset) {
                dir = FLIP_POS[dir];
            }
            style[pMax] = Math.abs(winRect[FLIP_POS[dir]] - point[p]);
            return dir;
        };

        var elmRectNoMargin = getRect(element);
        keys(FLIP_POS).forEach(function (v) {
            margin[v] = elmRect[v] - elmRectNoMargin[v];
        });
        var oDirX = matchWord(dir, 'left right center') || 'left';
        var oDirY = matchWord(dir, 'top bottom center') || 'bottom';
        var dirX = fn(oDirX, FLIP_POS[oDirY] && inset === 'inset-x', 'left', 'width', 'maxWidth', 'translateX(-50%)');
        var dirY = fn(oDirY, FLIP_POS[oDirX] && inset === 'inset-y', 'top', 'height', 'maxHeight', 'translateY(-50%)');
        $(element).css(extend(style, cssFromPoint(point, dirX + ' ' + dirY)));
    }

    function styleToJSON(style) {
        var t = {};
        each(style, function (i, v) {
            t[v] = style[v];
        });
        return t;
    }

    function animatableValue(v, allowNumber) {
        return /\b(?:[+-]?(\d+(?:\.\d+)?)(px|%)?|#[0-9a-f]{3,}|(rgba?|hsla?|matrix|calc)\(.+\))\b/.test(v) && (allowNumber || !RegExp.$1 || RegExp.$2);
    }

    function removeVendorPrefix(name) {
        return name.replace(/^-(webkit|moz|ms|o)-/, '');
    }

    function runCSSTransition(element, className) {
        setState(element, className, true);
        var arr = iterateToArray(createNodeIterator(element, 1, function (v) {
            var style = getComputedStyle(v);
            return style.transitionDuration !== '0s' || style.animationName != 'none';
        }));
        if (!arr[0]) {
            return when();
        }

        setState(element, className, false);
        $(arr).css('transition', 'none');
        setState(element, className, true);
        var newStyle = arr.map(function (v) {
            return styleToJSON(getComputedStyle(v));
        });
        setState(element, className, false);

        var map = new shim.Map();
        each(arr, function (i, v) {
            var curStyle = getComputedStyle(v);
            var dict = {};
            each(curStyle, function (j, v) {
                var curValue = curStyle[v];
                var newValue = newStyle[i][v];
                if (curValue !== newValue) {
                    var prop = removeVendorPrefix(v);
                    var allowNumber = matchWord(v, 'opacity line-height');
                    if (prop === 'animation-name') {
                        var prevAnim = curValue.replace(/,/g, '');
                        each(newValue.split(/,\s*/), function (i, v) {
                            if (v !== 'none' && !matchWord(prevAnim, v)) {
                                dict['@' + v] = true;
                            }
                        });
                    } else if (animatableValue(curValue, allowNumber) && animatableValue(newValue, allowNumber) && !/^scroll-limit/.test(prop)) {
                        dict[prop] = true;
                    }
                }
            });
            if (keys(dict)[0]) {
                map.set(v, dict);
            }
        });
        $(arr).css('transition', '');
        setState(element, className, true);
        if (!map.size) {
            return when();
        }

        var deferred = $.Deferred();
        var ontransitionend = function (e) {
            var dict = map.get(e.target) || {};
            delete dict[matchWord(e.type, TRANSITION_END) ? removeVendorPrefix(e.propertyName) : '@' + e.animationName];
            if (!keys(dict)[0] && map.delete(e.target) && !map.size) {
                unbind(element, ANIMATION_END + ' ' + TRANSITION_END, ontransitionend);
                deferred.resolveWith(element, [element]);
            }
        };
        bind(element, ANIMATION_END + ' ' + TRANSITION_END, ontransitionend);
        return deferred.promise();
    }

    function Rect(l, t, r, b) {
        var self = this;
        self.left = l;
        self.top = t;
        self.right = r;
        self.bottom = b;
    }

    definePrototype(Rect, {
        get width() {
            return this.right - this.left;
        },
        get height() {
            return this.bottom - this.top;
        },
        get centerX() {
            return (this.left + this.right) / 2;
        },
        get centerY() {
            return (this.top + this.bottom) / 2;
        },
        collapse: function (side) {
            var rect = this;
            return side === 'left' || side === 'right' ? toPlainRect(rect[side], rect.top, rect[side], rect.bottom) : toPlainRect(rect.left, rect[side], rect.right, rect[side]);
        },
        translate: function (x, y) {
            var self = this;
            return toPlainRect(self.left + x, self.top + y, self.right + x, self.bottom + y);
        }
    });

    var zeta = {
        IS_IOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        IS_IE10: !!window.ActiveXObject,
        IS_IE: !!window.ActiveXObject || root.style.msTouchAction !== undefined || root.style.msUserSelect !== undefined,
        IS_MAC: navigator.userAgent.indexOf('Macintosh') >= 0,
        IS_TOUCH: 'ontouchstart' in window
    };
    zeta.shim = {
        MutationObserver: shim.MutationObserver,
        WeakMap: shim.WeakMap,
        Map: shim.Map,
        Set: shim.Set
    };
    zeta.helper = {
        extend: extend,
        noop: noop,
        isArray: isArray,
        isFunction: isFunction,
        isPlainObject: isPlainObject,
        each: each,
        map: map,
        any: any,
        single: single,
        kv: kv,
        makeArray: makeArray,
        iterate: iterate,
        iterateToArray: iterateToArray,
        mapGet: mapGet,
        createPrivateStore: createPrivateStore,
        getOwnPropertyDescriptors: getOwnPropertyDescriptors,
        defineGetterProperty: defineGetterProperty,
        defineHiddenProperty: defineHiddenProperty,
        definePrototype: definePrototype,
        inherit: inherit,
        randomId: randomId,
        repeat: repeat,
        camel: camel,
        hyphenate: hyphenate,
        ucfirst: ucfirst,
        lcfirst: lcfirst,
        trim: trim,
        matchWord: matchWord,
        tagName: tagName,
        is: is,
        isVisible: isVisible,
        sameElementSpec: sameElementSpec,
        comparePosition: comparePosition,
        connected: connected,
        containsOrEquals: containsOrEquals,
        getCommonAncestor: getCommonAncestor,
        createRange: createRange,
        rangeCovers: rangeCovers,
        rangeEquals: rangeEquals,
        rangeIntersects: rangeIntersects,
        compareRangePosition: compareRangePosition,
        makeSelection: makeSelection,
        getRect: getRect,
        getRects: getRects,
        toPlainRect: toPlainRect,
        rectEquals: rectEquals,
        rectCovers: rectCovers,
        pointInRect: pointInRect,
        mergeRect: mergeRect,
        elementFromPoint: elementFromPoint,
        createDocumentFragment: createDocumentFragment,
        createTextNode: createTextNode,
        createElement: createElement,
        createNodeIterator: createNodeIterator,
        getState: getState,
        setState: setState,
        getZIndex: getZIndex,
        getZIndexOver: getZIndexOver,
        setZIndexOver: setZIndexOver,
        cssFromPoint: cssFromPoint,
        cssFromRect: cssFromRect,
        runCSSTransition: runCSSTransition,
        position: position,
        removeNode: removeNode,
        bind: bind,
        unbind: unbind,
        when: when,
        waitAll: waitAll,
        reject: reject,
        always: always
    };
    window.zeta = zeta;

}());
