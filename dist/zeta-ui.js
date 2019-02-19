/*!
 * zeta UI v1.0.0-beta
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('zeta-ui', ['jquery', 'waterpipe'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('waterpipe'));
    } else {
        root.zeta = factory(root.jQuery, root.waterpipe);
    }
}(typeof self !== 'undefined' ? self : this, function ($, waterpipe, zeta) {

(function (window, document, Object, String, Array, Math, Date, Node, Range, DocumentFragment, RegExp, parseFloat, setTimeout, clearTimeout, getComputedStyle, shim) {
'use strict';

// source: src/helper.js
(function () {
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
    var when = $.when;

    var root = document.documentElement;
    var selection = window.getSelection();
    var wsDelimCache = {};
    var originDiv = $('<div style="position:fixed; top:0; left:0;">')[0];

    function noop() { }

    function readArgs(args) {
        return new ArgumentIterator(makeArray(args));
    }

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
        var re = new RegExp('(?:^|\\s+)' + className + '(?:-(\\S+)|\\b)', 'ig');
        var t = [false];
        (element.className || '').replace(re, function (v, a) {
            t[a ? t.length : 0] = a || true;
        });
        return t[1] ? t.slice(1) : t[0];
    }

    function setState(element, className, values) {
        var value = element.className || '';
        each(isPlainObject(className) || kv(className, values), function (i, v) {
            var re = new RegExp('(^|\\s)\\s*' + i + '(?:-(\\S+)|\\b)|\\s*$', 'ig');
            var replaced = 0;
            if (isPlainObject(v)) {
                v = map(v, function (v, i) {
                    return v ? i : null;
                });
            }
            value = value.replace(re, function () {
                return replaced++ || !v || v.length === 0 ? '' : (' ' + i + (v[0] ? [''].concat(v).join(' ' + i + '-') : ''));
            });
        });
        element.className = value;
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

    function runCSSTransition(element, className, callback) {
        if (getState(element, className)) {
            return reject();
        }
        callback = callback || noop;
        if (callback === true) {
            callback = setState.bind(null, element, className, false);
        }
        setState(element, className, true);
        var arr = iterateToArray(createNodeIterator(element, 1, function (v) {
            var style = getComputedStyle(v);
            return style.transitionDuration !== '0s' || style.animationName != 'none';
        }));
        if (!arr[0]) {
            callback();
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
            callback();
            return when();
        }

        var deferred = $.Deferred();
        var unbind = bind(element, 'animationend transitionend', function (e) {
            var dict = map.get(e.target) || {};
            delete dict[e.propertyName ? removeVendorPrefix(e.propertyName) : '@' + e.animationName];
            if (!keys(dict)[0] && map.delete(e.target) && !map.size) {
                var accept = getState(element, className);
                unbind();
                if (accept) {
                    callback();
                }
                deferred[accept ? 'resolve' : 'reject'](element);
            }
        });
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
        collapse: function (side, offset) {
            var rect = this;
            var pos = rect[side] + (offset || 0);
            return side === 'left' || side === 'right' ? toPlainRect(pos, rect.top, pos, rect.bottom) : toPlainRect(rect.left, pos, rect.right, pos);
        },
        translate: function (x, y) {
            var self = this;
            return toPlainRect(self.left + x, self.top + y, self.right + x, self.bottom + y);
        }
    });

    function ArgumentIterator(args) {
        this.value = null;
        this.args = args;
        this.done = !args.length;
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

    zeta = {
        IS_IOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        IS_IE10: !!window.ActiveXObject,
        IS_IE: !!window.ActiveXObject || root.style.msTouchAction !== undefined || root.style.msUserSelect !== undefined,
        IS_MAC: navigator.userAgent.indexOf('Macintosh') >= 0,
        IS_TOUCH: 'ontouchstart' in window,
        shim: shim
    };
    zeta.helper = {
        extend: extend,
        noop: noop,
        readArgs: readArgs,
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

})();

// source: src/dom.js
(function () {
    var KEYNAMES = JSON.parse('{"8":"backspace","9":"tab","13":"enter","16":"shift","17":"ctrl","18":"alt","19":"pause","20":"capsLock","27":"escape","32":"space","33":"pageUp","34":"pageDown","35":"end","36":"home","37":"leftArrow","38":"upArrow","39":"rightArrow","40":"downArrow","45":"insert","46":"delete","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","91":"leftWindow","92":"rightWindowKey","93":"select","96":"numpad0","97":"numpad1","98":"numpad2","99":"numpad3","100":"numpad4","101":"numpad5","102":"numpad6","103":"numpad7","104":"numpad8","105":"numpad9","106":"multiply","107":"add","109":"subtract","110":"decimalPoint","111":"divide","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"f9","121":"f10","122":"f11","123":"f12","144":"numLock","145":"scrollLock","186":"semiColon","187":"equalSign","188":"comma","189":"dash","190":"period","191":"forwardSlash","192":"backtick","219":"openBracket","220":"backSlash","221":"closeBracket","222":"singleQuote"}');
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
    var currentEvent;
    var scrollbarWidth;
    var _ = helper.createPrivateStore();

    function approxMultipleOf(a, b) {
        return Math.abs(Math.round(a / b) - a / b) < 0.2;
    }

    function textInputAllowed(v) {
        return v.isContentEditable || is(v, 'input,textarea,select');
    }

    function rendered(elm) {
        if (!containsOrEquals(document, elm)) {
            return false;
        }
        for (; elm !== document && getComputedStyle(elm).display !== 'none'; elm = elm.parentNode);
        return elm === document;
    }

    function parentsAndSelf(element) {
        for (var arr = []; element && element !== document && arr.push(element); element = element.parentNode || element.parent);
        return arr;
    }

    function getEventSource() {
        var type = (currentEvent || window.event || '').type || '';
        return type[0] === 'k' || type.substr(0, 3) === 'com' ? 'keyboard' : type[0] === 't' ? 'touch' : type[0] === 'm' || matchWord(type, 'wheel click dblclick contextmenu') ? 'mouse' : matchWord(type, 'drop cut copy paste') || 'script';
    }

    function prepEventSource(promise) {
        var source = eventSource || new ZetaEventSource(focusPath[0]);
        var wrap = function (callback) {
            return function () {
                var prev = eventSource;
                try {
                    eventSource = source;
                    return callback.apply(this, arguments);
                } finally {
                    eventSource = prev;
                }
            };
        };
        return {
            then: function (a, b) {
                return promise.then(a && wrap(a), b && wrap(b));
            },
            catch: function (a) {
                return promise.catch(a && wrap(a));
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
                if (data.char && textInputAllowed(v)) {
                    return triggerDOMEvent('textInput', nativeEvent, v, data.char, true);
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
        if (focusOnInput && !is(element, SELECTOR_FOCUSABLE)) {
            element = $(SELECTOR_FOCUSABLE, element).filter(':visible:not(:disabled,.disabled)')[0] || element;
        }
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
        for (var s; element !== root && (s = getComputedStyle(element)) && s.overflow === 'visible' && matchWord(s.position, 'static relative'); element = element.parentNode);
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

    function measureLine(p1, p2) {
        var dx = p1.clientX - p2.clientX;
        var dy = p1.clientY - p2.clientY;
        return {
            dx: dx,
            dy: dy,
            deg: Math.atan2(dy, dx) / Math.PI * 180,
            length: Math.sqrt(dx * dx + dy * dy)
        };
    }

    function drag(event, within, callback) {
        var deferred = $.Deferred();
        var points = event.touches || [event];
        var lastX = points[0].clientX;
        var lastY = points[0].clientY;
        var m0 = points[1] && measureLine(points[0], points[1]);
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
            mouseup: finish,
            touchend: finish,
            keydown: function (e) {
                if (e.which === 27) {
                    finish(false);
                }
            },
            mousemove: function (e) {
                e.preventDefault();
                if (!e.which && !event.touches) {
                    finish(true);
                } else if (e.clientX !== lastX || e.clientY !== lastY) {
                    lastX = e.clientX;
                    lastY = e.clientY;
                    progress(lastX, lastY);
                }
            },
            touchmove: function (e) {
                var points = e.touches;
                if (m0) {
                    var m1 = measureLine(points[0], points[1]);
                    progress((m1.deg - m0.deg + 540) % 360 - 180, m1.length / m0.length, points[0].clientX - lastX + (m0.dx - m1.dx) / 2, points[0].clientY - lastY + (m0.dy - m1.dy) / 2);
                } else {
                    progress(points[0].clientX, points[0].clientY);
                }
            }
        };
        var scrollParentHandlers = {
            mouseout: function (e) {
                if (!scrollTimeout && (!containsOrEquals(scrollParent, e.relatedTarget) || (scrollParent === root && e.relatedTarget === root))) {
                    scrollTimeout = setInterval(function () {
                        if (scrollIntoView(scrollParent, helper.toPlainRect(lastX - 50, lastY - 50, lastX + 50, lastY + 50))) {
                            progress(lastX, lastY);
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
        unbind1 = bind(window, handlers);
        unbind2 = bind(scrollParent, scrollParentHandlers);
        return prepEventSource(deferred);
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
        self.type = eventName;
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
                if (matchWord(handlerName || eventName, 'keystroke gesture') && callHandler(state, null, data.data, null)) {
                    return self.handled;
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
        prepEventSource: prepEventSource,
        scrollIntoView: scrollIntoView,
        focused: focused,
        get event() {
            return currentEvent;
        },
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
        var mouseInitialPoint;
        var mousedownFocus;
        var pressTimeout;
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

        function triggerKeystrokeEvent(keyName, char, nativeEvent) {
            var data = {
                data: keyName,
                char: char
            };
            lastEventSource.sourceKeyName = keyName;
            if (triggerUIEvent('keystroke', nativeEvent, focusPath, data, true)) {
                nativeEvent.preventDefault();
                return true;
            }
        }

        function triggerMouseEvent(eventName, nativeEvent) {
            var point = mouseInitialPoint || nativeEvent;
            return triggerDOMEvent(eventName, nativeEvent, nativeEvent.target, {
                target: nativeEvent.target,
                clientX: point.clientX,
                clientY: point.clientY,
                metakey: getEventName(nativeEvent)
            });
        }

        function triggerGestureEvent(gesture, nativeEvent) {
            mouseInitialPoint = null;
            return triggerUIEvent('gesture', nativeEvent, focusPath.slice(-1), gesture);
        }

        function dispatchDOMMouseEvent(eventName, point, e) {
            var event = document.createEvent('MouseEvent');
            event.initMouseEvent(eventName, e.bubbles, e.cancelable, e.view, e.detail, point.screenX, point.screenY, point.clientX, point.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
            return helper.elementFromPoint(point.clientX, point.clientY).dispatchEvent(event);
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
            bind(body, 'mousedown mouseup mousemove mouseenter mouseleave click dblclick contextmenu wheel', function (e) {
                if (getComputedStyle(e.target).pointerEvents === 'none') {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (!e.bubbles || !dispatchDOMMouseEvent(e.type, e, e)) {
                        e.preventDefault();
                    }
                }
            }, true);
        }

        bind(window, 'mousedown mouseup wheel compositionstart compositionend beforeinput textInput keydown keyup keypress touchstart touchend cut copy paste drop click dblclick contextmenu', function (e) {
            currentEvent = e;
            setTimeout(function () {
                currentEvent = null;
            });
            lastEventSource = null;
            if (!focusable(e.target)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                if (matchWord(e.type, 'touchstart mousedown keydown')) {
                    triggerDOMEvent('focusreturn', null, focusPath.slice(-1)[0]);
                }
            }
            lastEventSource = new ZetaEventSource(e.target);
        }, true);

        bind(root, {
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
                // three cases has been observed: XXX{imeText}|, XXX{prevText}| and XXX|{imeText}
                var o1 = imeOffset - imeText.length;
                var o2 = imeOffset - prevText.length;
                var startOffset = imeOffset;
                if (curText.slice(o1, imeOffset) === imeText) {
                    startOffset = o1;
                } else if (curText.slice(o2, imeOffset) === prevText) {
                    startOffset = o2;
                } else if (curText.substr(imeOffset, imeText.length) === imeText) {
                    imeOffset += imeText.length;
                }
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
                        triggerKeystrokeEvent(getEventName(e, KEYNAMES[keyCode] || e.key), keyCode === 32 ? ' ' : '', e);
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
                    triggerKeystrokeEvent(getEventName(e, KEYNAMES[modifiedKeyCode] || data), data, e);
                }
            },
            beforeinput: function (e) {
                if (!imeNode && e.cancelable) {
                    switch (e.inputType) {
                        case 'insertText':
                            return triggerUIEvent('textInput', e, focusPath[0], e.data);
                        case 'deleteContent':
                        case 'deleteContentBackward':
                            return triggerKeystrokeEvent('backspace', '', e);
                        case 'deleteContentForward':
                            return triggerKeystrokeEvent('delete', '', e);
                    }
                }
            },
            touchstart: function (e) {
                mouseInitialPoint = extend({}, e.touches[0]);
                if (!e.touches[1]) {
                    if (focused(getContainer(e.target).element)) {
                        triggerMouseEvent('mousedown', e);
                    }
                    pressTimeout = setTimeout(function () {
                        if (mouseInitialPoint) {
                            triggerMouseEvent('longPress', e);
                            mouseInitialPoint = null;
                        }
                    }, 1000);
                }
            },
            touchmove: function (e) {
                clearTimeout(pressTimeout);
                pressTimeout = null;
                if (mouseInitialPoint) {
                    if (!e.touches[1]) {
                        var line = measureLine(e.touches[0], mouseInitialPoint);
                        if (line.length > 50 && approxMultipleOf(line.deg, 90)) {
                            triggerGestureEvent('swipe' + (approxMultipleOf(line.deg, 180) ? (line.dx > 0 ? 'Right' : 'Left') : (line.dy > 0 ? 'Bottom' : 'Top')), e);
                        }
                    } else if (!e.touches[2]) {
                        triggerGestureEvent('pinchZoom', e);
                    }
                }
            },
            touchend: function (e) {
                clearTimeout(pressTimeout);
                if (mouseInitialPoint && pressTimeout) {
                    setFocus(e.target);
                    triggerMouseEvent('click', e);
                    dispatchDOMMouseEvent('click', mouseInitialPoint, e);
                    e.preventDefault();
                }
            },
            mousedown: function (e) {
                setFocus(e.target);
                if ((e.buttons || e.which) === 1) {
                    triggerMouseEvent('mousedown', e);
                }
                mouseInitialPoint = e;
                mousedownFocus = document.activeElement;
            },
            mousemove: function (e) {
                if (mouseInitialPoint && measureLine(e, mouseInitialPoint).length > 5) {
                    mouseInitialPoint = null;
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
                    if (dir && triggerUIEvent('mousewheel', e, e.target, dir / Math.abs(dir) * (zeta.IS_MAC ? -1 : 1), true)) {
                        e.preventDefault();
                    }
                }
            },
            click: function (e) {
                if (!zeta.IS_TOUCH && mouseInitialPoint) {
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
            },
            focusout: function (e) {
                // browser set focus to body if the focused element is no longer visible
                // which is not a desirable behavior in many cases
                // find the first visible element in focusPath to focus
                if (!e.relatedTarget && !rendered(e.target)) {
                    var cur = any(focusPath.slice(focusPath.indexOf(e.target) + 1), rendered);
                    if (cur) {
                        setFocus(cur, false, lastEventSource);
                    }
                }
            }
        }, true);

        bind(window, {
            wheel: function (e) {
                // scrolling will happen on first scrollable element up the DOM tree
                // prevent scrolling if interaction on such element should be blocked by modal element
                var deltaX = -e.deltaX;
                var deltaY = -e.deltaY;
                for (var cur = e.target; cur !== body; cur = cur.parentNode) {
                    var style = getComputedStyle(cur);
                    if (cur.scrollWidth > cur.offsetWidth && matchWord(style.overflowX, 'auto scroll') && ((deltaX > 0 && cur.scrollLeft > 0) || (deltaX < 0 && cur.scrollLeft + cur.offsetWidth < cur.scrollWidth))) {
                        break;
                    }
                    if (cur.scrollHeight > cur.offsetHeight && matchWord(style.overflowY, 'auto scroll') && ((deltaY > 0 && cur.scrollTop > 0) || (deltaY < 0 && cur.scrollTop + cur.offsetHeight < cur.scrollHeight))) {
                        break;
                    }
                }
                if (!focusable(cur)) {
                    e.preventDefault();
                }
            },
            blur: function (e) {
                if (e.target === window) {
                    windowFocusedOut = true;
                }
            }
        });

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
        bind(window, 'resize scroll orientationchange mousemove wheel keyup touchend transitionend', updateSnaps, {
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

})();

// source: src/editor.js
(function () {
    var INNER_PTAG = 'h1,h2,h3,h4,h5,h6,p,q,blockquote,pre,code,li,caption,figcaption,summary,dt,th';
    var ZWSP = '\u200b';
    var ZWSP_ENTITIY = '&#8203;';
    var WIDGET_ROOT = '__root__';
    var WIDGET_UNKNOWN = '__unknown__';
    var NODE_WIDGET = 1;
    var NODE_EDITABLE = 2;
    var NODE_EDITABLE_PARAGRAPH = 32;
    var NODE_PARAGRAPH = 4;
    var NODE_INLINE = 16;
    var NODE_INLINE_WIDGET = 64;
    var NODE_INLINE_EDITABLE = 128;
    var NODE_SHOW_HIDDEN = 8192;
    var NODE_ANY_BLOCK_EDITABLE = NODE_EDITABLE | NODE_EDITABLE_PARAGRAPH;
    var NODE_ANY_BLOCK = NODE_WIDGET | NODE_PARAGRAPH | NODE_ANY_BLOCK_EDITABLE;
    var NODE_ANY_INLINE = NODE_INLINE | NODE_INLINE_WIDGET | NODE_INLINE_EDITABLE;
    var NODE_ANY_ALLOWTEXT = NODE_PARAGRAPH | NODE_EDITABLE_PARAGRAPH | NODE_INLINE | NODE_INLINE_EDITABLE;

    var WeakMap = shim.WeakMap;
    var Set = shim.Set;
    var helper = zeta.helper;
    var dom = zeta.dom;

    var any = helper.any;
    var comparePosition = helper.comparePosition;
    var containsOrEquals = helper.containsOrEquals;
    var createDocumentFragment = helper.createDocumentFragment;
    var createElement = helper.createElement;
    var createNodeIterator = helper.createNodeIterator;
    var createRange = helper.createRange;
    var createTextNode = helper.createTextNode;
    var defineHiddenProperty = helper.defineHiddenProperty;
    var definePrototype = helper.definePrototype;
    var each = helper.each;
    var extend = helper.extend;
    var getRect = helper.getRect;
    var getRects = helper.getRects;
    var is = helper.is;
    var isFunction = helper.isFunction;
    var iterate = helper.iterate;
    var iterateToArray = helper.iterateToArray;
    var noop = helper.noop;
    var rangeCovers = helper.rangeCovers;
    var rangeIntersects = helper.rangeIntersects;
    var rectEquals = helper.rectEquals;
    var removeNode = helper.removeNode;
    var sameElementSpec = helper.sameElementSpec;
    var tagName = helper.tagName;
    var toPlainRect = helper.toPlainRect;
    var trim = helper.trim;

    var FLIP_POS = {
        top: 'bottom',
        left: 'right',
        right: 'left',
        bottom: 'top'
    };
    var WRITING_MODES = {
        'horizontal-tb': 0,
        'vertical-rl': 5,
        'vertical-lr': 1,
        'sideways-rl': 5,
        'sideways-lr': 11,
        'lr': 0,
        'rl': 0,
        'tb': 5,
        'lr-tb': 0,
        'lr-bt': 4,
        'rl-tb': 0,
        'rl-bt': 4,
        'tb-rl': 5,
        'bt-rl': 5,
        'tb-lr': 1,
        'bt-lr': 1
    };

    // each element represent two masks for each abstract box side pair
    // incicate writing modes that the abstract start side maps to side with larger coordinate (right or bottom)
    var RECT_COLLAPSE_MASK = [0x0f0, 0xccc, 0x5aa, 0xf00];
    var RECT_SIDE = 'block-start block-end inline-start inline-end over under line-left line-right'.split(' ');

    var CHARSET_RTL = '\u0590-\u07ff\u200f\u202b\u202e\ufb1d-\ufdfd\ufe70-\ufefc';
    var RE_RTL = new RegExp('([' + CHARSET_RTL + '])');
    var RE_LTR = new RegExp('([^\\s' + CHARSET_RTL + '])');
    var RE_N_RTL = new RegExp('(\\s|[' + CHARSET_RTL + '])');
    var RE_N_LTR = new RegExp('(\\s|[^' + CHARSET_RTL + '])');

    // unicode codepoints that caret position should not anchored on
    // ZWSP, lower surrogates, diacritical and half marks, and combining marks (Arabic, Hebrew and Japanese)
    var RE_SKIP = /[\u200b\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f\udc00-\udcff\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u08d4-\u08e1\u08e3-\u08ff\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u3099\u309a]/;

    var selection = window.getSelection();
    var clipboard = {};
    var defaultOptions = {};
    var definedWidgets = {};
    var fontCache = {};
    var composingEditor = null;
    var detachedElements = new WeakMap();
    var dirtySelections = new Set();
    var _ = helper.createPrivateStore();

    function TyperSelection(typer, range) {
        var self = this;
        _(self, {});
        self.typer = typer;
        self.baseCaret = new TyperCaret(typer, self);
        self.extendCaret = new TyperCaret(typer, self);
        if (range) {
            self.select(range);
        }
    }

    function TyperWidget(typer, id, element, options) {
        var self = this;
        self.id = id;
        self.typer = typer;
        self.element = element || typer.element;
        self.options = options;
    }

    function TyperNode(typer, nodeType, element, widget) {
        var self = this;
        self.typer = typer;
        self.childNodes = [];
        self.nodeType = nodeType;
        self.element = element;
        self.widget = widget;
    }

    function TyperTreeWalker(root, whatToShow, filter) {
        var self = this;
        self.whatToShow = whatToShow;
        self.filter = filter || null;
        self.currentNode = root;
        self.root = root;
    }

    function TyperDOMNodeIterator(iterator, whatToShow, filter) {
        var self = this;
        self.whatToShow = whatToShow;
        self.filter = filter || null;
        nodeIteratorInit(self, iterator);
    }

    function TyperCaret(typer, selection) {
        this.typer = typer;
        this.selection = selection || null;
    }

    function TyperTransaction(typer, widget, commandName) {
        this.typer = typer;
        this.selection = typer.getSelection();
        this.widget = widget || null;
        this.commandName = commandName || null;
    }

    function transaction(finalize) {
        var count = 0;
        return function run(callback, args, thisArg) {
            try {
                count++;
                return callback.apply(thisArg || this, args);
            } finally {
                if (--count === 0) {
                    finalize();
                }
            }
        };
    }

    function acceptNode(iterator, node) {
        node = node || iterator.currentNode;
        if (!node || !(iterator.whatToShow & (is(iterator, TyperTreeWalker) ? node.nodeType : (1 << (node.nodeType - 1))))) {
            return 3;
        }
        return !iterator.filter ? 1 : (iterator.filter.acceptNode || iterator.filter).call(iterator.filter, node);
    }

    function next(iterator, direction) {
        return iterator[direction < 0 ? 'previousNode' : 'nextNode']();
    }

    function collapseWS(v) {
        return String(v || '').replace(/[^\S\u00a0]+/g, ' ').replace(/\u200b/g, '');
    }

    function isElm(v) {
        return v && v.nodeType === 1 && v;
    }

    function isText(v) {
        return v && v.nodeType === 3 && v;
    }

    function isBR(v) {
        return tagName(v) === 'br' && v;
    }

    function isInlineElm(v) {
        return /^inline-?/.test(getComputedStyle(v).display) && v;
    }

    function isTextNodeRendered(node, pSib) {
        if (/[\S\u00a0]/.test(node.data)) {
            return true;
        }
        var test = function (node, pSib) {
            while (!node[pSib]) {
                node = node.parentNode;
                if (!node || !isInlineElm(node)) {
                    return false;
                }
            }
            return isText(node[pSib]) ? isTextNodeRendered(node[pSib], pSib) : isInlineElm(node[pSib]);
        };
        return test(node, pSib || 'previousSibling') && !pSib && test(node, 'nextSibling');
    }

    function isTextNodeEnd(v, offset, dir) {
        var str = v.data;
        return !isTextNodeRendered(v) || ((dir >= 0 && (offset === v.length || str.slice(offset) === ZWSP)) ? 1 : (dir <= 0 && (!offset || str.slice(0, offset) === ZWSP)) ? -1 : 0);
    }

    function isRTL(ch, baseRTL) {
        return RE_RTL.test(ch) ? true : /[^\s!-\/:-@\[\]^_`{|}~]/.test(ch) ? false : baseRTL;
    }

    function getWritingMode(elm) {
        var style = getComputedStyle(isElm(elm) || elm.parentNode);
        return WRITING_MODES[style.getPropertyValue('writing-mode')] ^ (style.direction === 'rtl' ? 2 : 0);
    }

    function closest(node, type) {
        for (; node && !is(node, type); node = node.parentNode);
        return is(node, NODE_WIDGET) ? node.typer.getNode(node.widget.element) : node;
    }

    function getOffset(node, offset) {
        var len = node.length || node.childNodes.length;
        return 1 / offset < 0 ? Math.max(0, len + offset) : Math.min(len, offset);
    }

    function getWholeTextOffset(node, textNode) {
        var iterator = new TyperDOMNodeIterator(new TyperTreeWalker(node, NODE_ANY_ALLOWTEXT), 5);
        for (var offset = 0, cur; (cur = iterator.nextNode()) && cur !== textNode; offset += cur.length || 0);
        return offset;
    }

    function getAbstractRect(rect, mode) {
        var sign = mode / Math.abs(mode);
        mode /= sign;
        var signX = mode & 2 ? -1 : 1;
        var signY = mode & 4 ? -1 : 1;
        if (sign > 0 && (mode & 1)) {
            signX ^= signY;
            signY ^= signX;
            signX ^= signY;
        }
        var propX = signX < 0 ? 'right' : 'left';
        var propY = signY < 0 ? 'bottom' : 'top';
        if (mode & 1) {
            rect = toPlainRect(rect[propY] * signY, rect[propX] * signX, rect[FLIP_POS[propY]] * signY, rect[FLIP_POS[propX]] * signX);
        } else {
            rect = toPlainRect(rect[propX] * signX, rect[propY] * signY, rect[FLIP_POS[propX]] * signX, rect[FLIP_POS[propY]] * signY);
        }
        return rect;
    }

    function getAbstractSide(side, mode) {
        mode = +mode === mode ? mode : getWritingMode(mode);
        side = +side === side ? side : RECT_SIDE.indexOf(side);
        var prop = (side >> 1 & 1) ^ (mode & 1) ? 'left' : 'top';
        return !!(RECT_COLLAPSE_MASK[side >> 1] & (1 << mode)) ^ (side & 1) ? FLIP_POS[prop] : prop;
    }

    function getActiveRange(container) {
        if (selection.rangeCount) {
            var range = selection.getRangeAt(0);
            return containsOrEquals(container, range.commonAncestorContainer) && range;
        }
    }

    function transformText(text, transform) {
        switch (transform) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'capitalize':
                return text.replace(/\b(.)/g, function (v) {
                    return v.toUpperCase();
                });
        }
        return text;
    }

    function updateTextNodeData(node, text) {
        if (node.data !== text) {
            node.data = text;
        }
    }

    function wrapNode(content, parentNodes) {
        each(parentNodes, function (i, v) {
            content = $(v.cloneNode(false)).append(content)[0];
        });
        return is(content, Node) || createDocumentFragment(content);
    }

    function getFontMetric(elm) {
        var style = getComputedStyle(isElm(elm) || elm.parentNode);
        var key = [style.fontFamily, style.fontWeight, style.fontStyle].join('|');
        if (!fontCache[key]) {
            var $dummy = $('<div style="position:fixed;font-size:1000px;"><span style="display:inline-block;width:0;height:0;"></span>&nbsp;</div>').css({
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle
            }).appendTo(document.body);
            var $img = $dummy.children();
            var offset = getRect($dummy[0]).top;
            fontCache[key] = {
                baseline: (getRect($img.css('vertical-align', 'baseline')[0]).top - offset) / 1000,
                height: (getRect($img.css('vertical-align', 'text-bottom')[0]).top - offset) / 1000,
                middle: (getRect($img.css('vertical-align', 'middle')[0]).top - offset) / 1000,
                wsWidth: $dummy.width() / 1000
            };
            $dummy.remove();
        }
        var fontSize = parseFloat(style.fontSize);
        return {
            fontSize: fontSize,
            baseline: fontCache[key].baseline * fontSize,
            height: fontCache[key].height * fontSize,
            middle: fontCache[key].middle * fontSize,
            wsWidth: fontCache[key].wsWidth * fontSize
        };
    }

    function combineNodeFilters() {
        var args = $.grep(arguments, isFunction);
        return function (node) {
            var result = 1;
            for (var i = 0, len = args.length; i < len; i++) {
                var value = args[i](node);
                if (value === 2) {
                    return 2;
                }
                result |= value;
            }
            return result;
        };
    }

    function Typer(topElement, options) {
        if (!is(topElement, Node)) {
            options = topElement;
            topElement = topElement.element;
        }
        options = extend(true, {}, (!options || options.defaultOptions !== false) && defaultOptions, options);

        var typer = this;
        var topNodeType = options.inline || is(topElement, INNER_PTAG) ? NODE_EDITABLE_PARAGRAPH : NODE_EDITABLE;
        var container = new zeta.Container(topElement, typer);
        var widgetOptions = {};
        var staticWidgets = [];
        var internals = {};
        var currentSelection;
        var triggerDOMChange;
        var enabled;
        var muteChanges = true;
        var needNormalize = true;
        var $self = $(topElement);

        function triggerStateChange() {
            container.emit('stateChange', currentSelection.focusNode.widget.element, null, true);
        }

        function matchWidgetList(id, prop, needle) {
            var options = widgetOptions[id];
            return !(prop in options) || options[prop] === '*' || (' ' + options[prop] + ' ').indexOf(' ' + needle + ' ') >= 0;
        }

        function widgetAllowed(id, node) {
            node = closest(node, NODE_ANY_BLOCK_EDITABLE);
            return widgetOptions[id] && widgetOptions[id].element && (widgetOptions[id].inline || !is(node, NODE_EDITABLE_PARAGRAPH)) && (matchWidgetList(id, 'allowedIn', node.widget.id) && matchWidgetList(node.widget.id, 'allow', id));
        }

        function findWidgetWithCommand(name) {
            var widgets = currentSelection.getWidgets().reverse().concat(staticWidgets);
            return any(widgets, function (v) {
                return widgetOptions[v.id] && isFunction((widgetOptions[v.id].commands || {})[name]);
            });
        }

        function createTyperDocument(rootElement, fireEvent) {
            var self = {};
            var nodeSource = containsOrEquals(topElement, rootElement) ? typer : self;
            var nodeMap = new WeakMap();
            var timeout;

            function snapshotAfterNormalize() {
                timeout = null;
                if (needNormalize) {
                    normalize();
                }
                internals.snapshot();
            }

            function createWidget(element, id) {
                var widget = new TyperWidget(nodeSource, id, element, extend({}, widgetOptions[id].options));
                if (element !== topElement && container.getContext(element)) {
                    container.delete(element);
                }
                if (fireEvent) {
                    container.setContext(element, widget);
                    container.add(element, widget.id, widgetOptions[widget.id]);
                }
                return widget;
            }

            function addChild(parent, node) {
                var arr = parent.childNodes;
                for (var index = arr.length; index && comparePosition(node.element, arr[index - 1].element) <= 0; index--);
                if (arr[index] !== node) {
                    if (node.parentNode) {
                        removeFromParent(node);
                    } else {
                        // revoke any destroy event registered previously when being removed from old parent
                        iterate(new TyperTreeWalker(node, -1), function (v) {
                            var widget = v.widget;
                            detachedElements.delete(v.element);
                            if (widget.element === v.element) {
                                container.add(v.element, widget.id, widgetOptions[widget.id]);
                            }
                        });
                    }
                    arr.splice(index, 0, node);
                    node.parentNode = parent;
                    node.previousSibling = arr[index - 1] || null;
                    node.nextSibling = arr[index + 1] || null;
                    (node.previousSibling || {}).nextSibling = node;
                    (node.nextSibling || {}).previousSibling = node;
                    return true;
                }
            }

            function removeFromParent(node, destroyWidget) {
                var parent = node.parentNode;
                var prev = node.previousSibling;
                var next = node.nextSibling;
                parent.childNodes.splice(parent.childNodes.indexOf(node), 1);
                (prev || {}).nextSibling = next;
                (next || {}).previousSibling = prev;
                node.parentNode = null;
                node.nextSibling = null;
                node.previousSibling = null;
                if (destroyWidget) {
                    iterate(new TyperTreeWalker(node, -1), function (v) {
                        detachedElements.set(v.element, {
                            node: (prev || next || parent).element,
                            offset: prev ? false : next ? true : 0
                        });
                        if (v.widget.element === v.element) {
                            container.delete(v.element);
                        }
                    });
                }
            }

            function updateNode(node) {
                var oldWidget = node.widget;
                var parent = node.parentNode;
                var isWidgetMatched = function (i) {
                    return is(node.element, widgetOptions[i].element) && i;
                };

                node.widget = (oldWidget || '').element !== node.element ? parent.widget : oldWidget;
                if (!is(parent, NODE_WIDGET | NODE_INLINE_WIDGET)) {
                    var matchedId = any(Object.keys(widgetOptions), isWidgetMatched) || isWidgetMatched(WIDGET_UNKNOWN);
                    if (matchedId && (node.widget === parent.widget || node.widget.id !== matchedId)) {
                        node.widget = createWidget(node.element, matchedId);
                    }
                }
                if (oldWidget && oldWidget !== node.widget) {
                    container.delete(node.element, oldWidget.id);
                }
                var widgetOption = widgetOptions[node.widget.id];
                if (node.widget === parent.widget && !is(parent, NODE_WIDGET | NODE_INLINE_WIDGET)) {
                    node.nodeType = is(node.element, INNER_PTAG) ? NODE_PARAGRAPH : NODE_INLINE;
                } else if (is(node.element, widgetOption.editable) || (widgetOption.inline && !widgetOption.editable)) {
                    node.nodeType = widgetOption.inline ? NODE_INLINE_EDITABLE : is(node.element, INNER_PTAG) ? NODE_EDITABLE_PARAGRAPH : NODE_EDITABLE;
                } else {
                    node.nodeType = widgetOption.inline && node.widget !== parent.widget && is(parent, NODE_ANY_ALLOWTEXT) ? NODE_INLINE_WIDGET : NODE_WIDGET;
                }
            }

            function visitNode(thisNode, visitChild) {
                each(thisNode.childNodes.slice(0), function (i, v) {
                    if (!containsOrEquals(thisNode, v)) {
                        removeFromParent(v, true);
                    }
                });
                $(thisNode.element).children().not('br').each(function (i, v) {
                    var node = nodeMap.get(v) || new TyperNode(nodeSource, 0, v);
                    nodeMap.set(v, node);
                    if (addChild(thisNode, node) || visitChild) {
                        updateNode(node);
                        visitNode(node, true);
                    }
                });
            }

            function handleMutations(mutations) {
                var trackChange = currentSelection && !muteChanges;
                var dirtyNodes = new Set();

                each(mutations, function (i, v) {
                    var node = nodeMap.get(isElm(v.target) || v.target.parentNode);
                    if (node) {
                        var attached = containsOrEquals(rootElement, v.target);
                        if ((v.addedNodes[0] || v.removedNodes[0]) && !dirtyNodes.has(node)) {
                            dirtyNodes.add(node);
                            if (attached) {
                                visitNode(node);
                            }
                        }
                        if (trackChange && attached && v.attributeName !== 'style' && (!v.attributeName || v.target !== rootElement)) {
                            if (node.widget.id !== WIDGET_ROOT) {
                                container.emitAsync('contentChange', node.widget.element);
                            }
                            container.emitAsync('contentChange', topElement);
                            needNormalize = true;
                        }
                    }
                });
                if (dirtyNodes.size && currentSelection) {
                    selectionAtomic(function () {
                        var range = currentSelection.getRange();
                        var needUpdate;
                        dirtyNodes.forEach(function (v) {
                            needUpdate |= rangeIntersects(range, v.element);
                        });
                        if (needUpdate) {
                            currentSelection.select(currentSelection);
                        }
                    });
                }
                if (needNormalize && !muteChanges) {
                    timeout = timeout || setTimeout(snapshotAfterNormalize);
                }
            }

            function getNode(element) {
                if (zeta.IS_IE10 && !containsOrEquals(document, rootElement)) {
                    // MutationObserver shim does not work on disconnected element
                    visitNode(rootNode, true);
                } else {
                    triggerDOMChange();
                }
                if (isText(element) || isBR(element)) {
                    element = element.parentNode || element;
                }
                if (containsOrEquals(rootElement, element)) {
                    var node = nodeMap.get(element);
                    return is(node, NODE_WIDGET) ? nodeMap.get(node.widget.element) : node;
                }
            }

            if (fireEvent) {
                triggerDOMChange = container.observe(handleMutations, {
                    childList: true,
                    attributes: true,
                    characterData: true
                });
            }
            if (!rootElement.parentNode) {
                rootElement = is(rootElement, DocumentFragment) || createDocumentFragment(rootElement);
            }
            var rootNode = new TyperNode(nodeSource, topNodeType, rootElement, createWidget(rootElement, WIDGET_ROOT));
            nodeMap.set(rootElement, rootNode);
            visitNode(rootNode);

            return extend(self, {
                rootNode: rootNode,
                getNode: getNode
            });
        }

        function normalizeWhitespace(node) {
            var textNodes = iterateToArray(createNodeIterator(node, 4));
            while (textNodes[0]) {
                var wholeText = '';
                var index = [];
                var len = 0;
                while (++len < textNodes.length && textNodes[len].previousSibling === textNodes[len - 1]);
                each(textNodes.slice(0, len), function (i, v) {
                    if (isTextNodeRendered(v)) {
                        wholeText += v.data;
                    }
                    index[i] = wholeText.length;
                });
                wholeText = wholeText.replace(/(\s+)(\S?)/g, function (v, a, b, c) {
                    var suffix = !b ? '\u00a0' : a[2] ? '\u00a0 ' : '';
                    return helper.repeat(c ? ' \u00a0' : '\u00a0 ', a.length).slice(0, a.length - suffix.length) + suffix + b;
                });
                each(textNodes.splice(0, len), function (i, v) {
                    updateTextNodeData(v, wholeText.slice(index[i - 1] || 0, index[i]));
                });
            }
        }

        function normalize() {
            // flush any previous changes so that they would not be muted away
            triggerDOMChange();
            if (!needNormalize) {
                return;
            }
            muteChanges = true;
            iterate(new TyperTreeWalker(typer.rootNode, NODE_ANY_ALLOWTEXT | NODE_EDITABLE | NODE_SHOW_HIDDEN), function (node) {
                var element = node.element;
                if (is(node, NODE_EDITABLE)) {
                    if (!node.firstChild) {
                        $(element).html('<p>' + (trim(element.textContent) || ZWSP_ENTITIY) + '</p>');
                        return;
                    }
                    $(element).contents().each(function (i, v) {
                        if (v.parentNode === element) {
                            var contents = [];
                            for (; v && (isText(v) || isBR(v) || is(typer.getNode(v), NODE_ANY_INLINE)); v = v.nextSibling) {
                                if (contents.length || isElm(v) || trim(v.data)) {
                                    contents.push(v);
                                }
                            }
                            if (contents.length) {
                                $(contents).wrap('<p>');
                            }
                        }
                    });
                    return;
                }
                if (is(node, NODE_PARAGRAPH | NODE_EDITABLE_PARAGRAPH)) {
                    if (!element.firstChild) {
                        $(createTextNode()).appendTo(element);
                        return;
                    }
                    // WebKit adds dangling <BR> element when a line is empty
                    // normalize it into a ZWSP and continue process
                    var lastBr = $('>br:last-child', element)[0];
                    if (lastBr && !lastBr.nextSibling) {
                        $(createTextNode()).insertBefore(lastBr);
                        removeNode(lastBr);
                    }
                    var firstBr = $('>br:first-child', element)[0];
                    if (firstBr && !firstBr.previousSibling) {
                        removeNode(firstBr);
                    }
                    if (!currentSelection || (currentSelection.startNode !== node && currentSelection.endNode !== node)) {
                        each(iterateToArray(createNodeIterator(element, 4)), function (i, v) {
                            updateTextNodeData(v, collapseWS(v.data) || ZWSP);
                            if (isText(v.nextSibling)) {
                                v.nextSibling.data = collapseWS(v.data + v.nextSibling.data);
                                removeNode(v);
                            }
                        });
                    }
                }
                if (is(node, NODE_INLINE) && (!currentSelection || (currentSelection.startElement !== element && currentSelection.endElement !== element)) && !trim(element.textContent)) {
                    removeNode(element);
                }
                $('>br', element).each(function (i, v) {
                    if (!isText(v.nextSibling)) {
                        $(createTextNode()).insertAfter(v);
                    }
                });
            });
            // Mozilla adds <br type="_moz"> when a container is empty
            $('br[type="_moz"]', topElement).remove();
            // flush any changes due to normalization so that they will not be included nor cause recursion
            triggerDOMChange();
            muteChanges = false;
            needNormalize = false;
            if (currentSelection) {
                currentSelection.select(currentSelection);
            }
        }

        function extractContents(range, mode, callback) {
            var method = mode === 'cut' ? 'extractContents' : mode === 'paste' ? 'deleteContents' : 'cloneContents';
            var cloneNode = mode !== 'paste';
            var clearNode = mode !== 'copy';
            var fragment = createDocumentFragment();
            var state = is(range, TyperSelection) ? range.clone() : new TyperSelection(typer, range);
            var timestamp = currentSelection.timestamp;
            range = state.getRange();

            if (!state.isCaret) {
                var stack = [[topElement, fragment]];
                var shift = function () {
                    var item = stack.shift();
                    if (item[2] && item[2].element === item[0]) {
                        container.emit('extract', item[2].element, {
                            extractedNode: item[1]
                        });
                    }
                };
                iterate(state.createTreeWalker(-1, function (node) {
                    var element = node.element;
                    var handler = is(node, NODE_WIDGET | NODE_EDITABLE | NODE_EDITABLE_PARAGRAPH) && widgetOptions[node.widget.id].extract;
                    var isWidgetHead = node.widget.element === element;

                    if ((!handler || node === state.focusNode) && !isWidgetHead && is(node, NODE_EDITABLE)) {
                        // ignore widget structure if the widget is partially selected
                        // and there is no extract event handler defined
                        return 3;
                    }
                    while (!containsOrEquals(stack[0][0], element)) {
                        shift();
                    }
                    if (handler && (!isWidgetHead || !rangeCovers(range, element))) {
                        (isWidgetHead ? $(element) : $(element).parentsUntil(stack[0][0]).addBack()).each(function (i, v) {
                            stack.unshift([v, v.cloneNode(false), node.widget]);
                            stack[1][1].appendChild(stack[0][1]);
                        });
                    }
                    if (rangeCovers(range, element)) {
                        var appendChild = element === stack[0][0];
                        var clone = clearNode ? element : element.cloneNode(true);
                        if (clearNode && !appendChild && is(node, NODE_EDITABLE_PARAGRAPH)) {
                            // prevent editable paragraph being removed
                            clone = $(element.cloneNode(false)).append(element.childNodes[0]);
                        }
                        $(stack[0][1]).append(appendChild ? clone.childNodes : clone);
                        return 2;
                    }
                    if (is(node, NODE_ANY_ALLOWTEXT)) {
                        var content = createRange(element, range)[method]();
                        var firstChild = is(content, DocumentFragment) ? content.firstChild : content;
                        var hasThisElement = is(firstChild, tagName(element));
                        var reqThisElement = !handler;
                        if (cloneNode && firstChild) {
                            if (!hasThisElement && reqThisElement) {
                                content = wrapNode(content, [is(node, NODE_EDITABLE_PARAGRAPH) ? createElement('p') : element]);
                            } else if (hasThisElement && !reqThisElement) {
                                content = createDocumentFragment(firstChild.childNodes);
                            }
                            $(stack[0][1]).append(content);
                        }
                        return 2;
                    }
                    return 1;
                }));
                for (; stack[0]; shift());
            }
            if (clearNode) {
                // explicitly update the selection
                if (currentSelection.timestamp !== timestamp) {
                    state = currentSelection;
                } else if (state.direction > 0) {
                    state.select(range);
                } else {
                    state.select(createRange(range, false));
                    state.extendCaret.moveTo(createRange(range, true));
                }
                if (!state.isSingleEditable) {
                    var iterator = state.createTreeWalker(NODE_ANY_BLOCK_EDITABLE, function (v) {
                        return widgetOptions[v.widget.id].textFlow ? 1 : 3;
                    });
                    var start = closest(state.baseCaret.node, NODE_ANY_BLOCK_EDITABLE);
                    var until = closest(state.extendCaret.node, NODE_ANY_BLOCK_EDITABLE);
                    iterator.currentNode = start;
                    while (next(iterator, state.direction));
                    if (iterator.currentNode !== until) {
                        if (iterator.currentNode !== start) {
                            state.extendCaret.moveTo(iterator.currentNode.element, 0 * -state.direction);
                        } else {
                            state.collapse();
                        }
                    }
                }
                currentSelection.select(state);
            }
            if (isFunction(callback)) {
                callback(state);
            }
            $(fragment).find('[style]').removeAttr('style');
            normalize();
            return fragment;
        }

        function insertContents(range, content) {
            var textOnly;
            if (is(content, Node)) {
                if (containsOrEquals(topElement, content)) {
                    removeNode(content);
                }
                content = helper.makeArray(createDocumentFragment(content).childNodes);
                textOnly = content.length === 1 && !!is(content[0], 'p:not([class])');
            } else {
                content = $(String(content || '').replace(/\u000d/g, '').replace(/</g, '&lt;').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>').replace(/.*/, '<p>$&</p>').replace(/\s/g, '\u00a0')).get();
                textOnly = true;
            }
            extractContents(range, 'paste', function (state) {
                var startNode = state.startNode;
                var endNode = state.endNode;
                var caretPoint = state.getCaret('start').clone();
                var startPoint = createRange(closest(startNode, NODE_ANY_BLOCK_EDITABLE).element, 0);
                var forcedInline = !!is(startNode, NODE_EDITABLE_PARAGRAPH);
                var insertAsInline = !!is(startNode, NODE_ANY_ALLOWTEXT);
                var paragraphAsInline = true;
                var hasInsertedBlock;
                var formattingNodes = [];

                var cur = typer.getNode(state.startElement);
                if (is(cur, NODE_ANY_INLINE)) {
                    for (; cur !== startNode; cur = cur.parentNode) {
                        if (is(cur, NODE_INLINE)) {
                            formattingNodes.push(cur.element);
                        }
                    }
                    formattingNodes.push(startNode.element);
                } else if (is(cur, NODE_PARAGRAPH)) {
                    formattingNodes[0] = startNode.element;
                } else if (!is(cur, NODE_EDITABLE_PARAGRAPH)) {
                    formattingNodes[0] = createElement('p');
                }

                each(content, function (i, nodeToInsert) {
                    var caretNode = typer.getNode(caretPoint.element);
                    var node = new TyperNode(typer, textOnly ? NODE_PARAGRAPH : NODE_INLINE, nodeToInsert);
                    var isLineBreak = !!isBR(nodeToInsert);
                    var needSplit = false;
                    var incompatParagraph = false;
                    var splitEnd;

                    if (!isLineBreak && isElm(nodeToInsert)) {
                        startPoint.insertNode(nodeToInsert);
                        node = typer.getNode(nodeToInsert);
                        removeNode(nodeToInsert);
                        if (node.widget !== caretNode.widget) {
                            for (var widgetNode = caretNode; is(widgetNode, NODE_ANY_INLINE | NODE_PARAGRAPH) || (is(widgetNode, NODE_EDITABLE_PARAGRAPH) && widgetNode === caretNode); widgetNode = widgetNode.parentNode) {
                                if (content.length === 1 && node.widget.id === widgetNode.widget.id) {
                                    var prop = {
                                        receivedNode: nodeToInsert,
                                        caret: caretPoint.clone()
                                    };
                                    if (container.emit('receive', widgetNode.widget.element, prop)) {
                                        caretPoint = currentSelection.clone();
                                        hasInsertedBlock = true;
                                        return;
                                    }
                                }
                                if (!widgetAllowed(node.widget.id, widgetNode)) {
                                    var text = node.widget.id === WIDGET_UNKNOWN ? collapseWS(trim(nodeToInsert.textContent)) : extractText(nodeToInsert);
                                    if (!text) {
                                        // avoid inserting extra ZWSP text node
                                        return;
                                    }
                                    nodeToInsert = createTextNode(text);
                                    node = new TyperNode(typer, NODE_INLINE, nodeToInsert);
                                    break;
                                }
                            }
                        }
                    }
                    if (!is(caretNode, NODE_ANY_BLOCK_EDITABLE)) {
                        if (isLineBreak) {
                            needSplit = !is(caretNode, NODE_PARAGRAPH);
                            for (; is(caretNode.parentNode, NODE_ANY_INLINE); caretNode = caretNode.parentNode);
                            splitEnd = createRange(caretNode.element, false);
                        } else if (!is(node, NODE_ANY_INLINE)) {
                            caretNode = closest(caretNode, NODE_PARAGRAPH) || caretNode;
                            splitEnd = createRange(caretNode.element, false);
                            if (is(node, NODE_PARAGRAPH)) {
                                incompatParagraph = !textOnly && !forcedInline && is(caretNode, NODE_PARAGRAPH) && !sameElementSpec(node.element, caretNode.element) && !!trim(nodeToInsert.textContent);
                                needSplit = !paragraphAsInline || (incompatParagraph && !!trim(createRange(createRange(caretNode.element, true), createRange(caretPoint))));
                                paragraphAsInline = !incompatParagraph;
                                insertAsInline = insertAsInline && paragraphAsInline;
                            } else if (trim(createRange(createRange(caretNode.element, true), createRange(caretPoint)))) {
                                needSplit = trim(createRange(splitEnd, createRange(caretPoint)));
                                if (!needSplit) {
                                    caretNode = caretNode.nextSibling || caretNode.parentNode;
                                    caretPoint.moveTo(splitEnd);
                                }
                            }
                        }
                        if (needSplit) {
                            var splitContent = createRange(createRange(caretPoint), splitEnd).extractContents();
                            if (!trim(splitContent.textContent)) {
                                // avoid unindented empty elements when splitting at end of line
                                splitContent = createDocumentFragment(wrapNode(createTextNode(), formattingNodes));
                            }
                            var splitFirstNode = splitContent.firstChild;
                            splitEnd.insertNode(splitContent);

                            for (var cur1 = typer.getNode(splitFirstNode); cur1 && !trim(cur1.element.textContent); cur1 = cur1.firstChild) {
                                if (is(cur1, NODE_INLINE_WIDGET | NODE_INLINE_EDITABLE)) {
                                    // avoid empty inline widget at the start of inserted line
                                    $(cur1.element.childNodes).insertBefore(cur1.element);
                                    removeNode(cur1.element);
                                    break;
                                }
                            }
                            if (is(caretNode, NODE_ANY_ALLOWTEXT) && !(caretNode.element.firstChild || '').length) {
                                $(createTextNode()).appendTo(caretNode.element);
                            }
                            if (trim(caretNode.element.textContent) && caretNode.element.textContent.slice(-1) === ' ') {
                                normalizeWhitespace(caretNode.element);
                            }
                            if (trim(splitFirstNode.textContent) && splitFirstNode.textContent.charAt(0) === ' ') {
                                normalizeWhitespace(splitFirstNode);
                            }
                            if (isLineBreak) {
                                createRange(splitFirstNode, true).insertNode(nodeToInsert);
                                caretPoint.moveTo(splitFirstNode, 0);
                                return;
                            }
                            caretNode = typer.getNode(splitFirstNode);
                            caretPoint.moveTo(splitFirstNode, 0);
                            hasInsertedBlock = true;
                        }
                    }
                    insertAsInline = insertAsInline && !!is(node, NODE_ANY_ALLOWTEXT | NODE_ANY_INLINE);
                    if (insertAsInline) {
                        var nodes = helper.makeArray(paragraphAsInline && !is(node, NODE_ANY_INLINE) ? nodeToInsert.childNodes : nodeToInsert);
                        if (nodes[0]) {
                            caretPoint.getRange().insertNode(createDocumentFragment(nodes));
                            normalizeWhitespace(caretNode.element);
                            caretPoint.moveTo(nodes[nodes.length - 1], -0);
                        }
                        paragraphAsInline = forcedInline;
                    } else {
                        if (is(node, NODE_ANY_INLINE)) {
                            nodeToInsert = wrapNode(nodeToInsert, formattingNodes);
                        }
                        // check for the first block either if there is content or the insert point is a paragraph
                        // to avoid two empty lines inserted before block widget
                        if (hasInsertedBlock || !is(startNode, NODE_WIDGET) || trim(nodeToInsert.textContent)) {
                            if (is(caretNode, NODE_ANY_BLOCK_EDITABLE) && !is(caretNode.parentNode, NODE_ANY_BLOCK_EDITABLE)) {
                                $(nodeToInsert).appendTo(caretNode.element);
                            } else {
                                $(nodeToInsert).insertBefore(caretNode.element);
                            }
                            insertAsInline = !!is(node, NODE_ANY_ALLOWTEXT | NODE_ANY_INLINE);
                            paragraphAsInline = incompatParagraph || !insertAsInline;
                            caretPoint.moveTo(nodeToInsert, paragraphAsInline ? false : -0);
                        }
                        hasInsertedBlock = true;
                    }
                });
                if (!hasInsertedBlock && startNode !== endNode) {
                    if (!extractText(startNode.element)) {
                        caretPoint.moveTo(endNode.element, is(endNode, NODE_ANY_ALLOWTEXT) ? 0 : true);
                        removeNode(startNode.element);
                    } else if (is(startNode, NODE_PARAGRAPH) && is(endNode, NODE_PARAGRAPH)) {
                        var glueContent = createDocumentFragment(createRange(endNode.element, 'contents').extractContents());
                        var glueFirstNode = glueContent.firstChild;
                        caretPoint.moveTo(startNode.element, -0);
                        createRange(startNode.element, -0).insertNode(glueContent);
                        removeNode(endNode.element);
                        while (isElm(glueFirstNode) && sameElementSpec(glueFirstNode, glueFirstNode.previousSibling)) {
                            var nodeToRemove = glueFirstNode;
                            glueFirstNode = $(glueFirstNode.childNodes).appendTo(glueFirstNode.previousSibling)[0];
                            removeNode(nodeToRemove);
                        }
                        normalizeWhitespace(startNode.element);
                    }
                }
                currentSelection.select(caretPoint);
            });
        }

        function extractText(content) {
            var range = createRange(content || topElement, 'contents');
            var iterator, doc;
            if (is(content, Node) && !helper.connected(topElement, content)) {
                doc = createTyperDocument(content);
                iterator = new TyperDOMNodeIterator(new TyperTreeWalker(doc.rootNode, -1), 5);
            } else {
                iterator = new TyperDOMNodeIterator((is(content, TyperSelection) || new TyperSelection(typer, range)).createTreeWalker(-1), 5, function (v) {
                    return rangeIntersects(range, createRange(v, 'contents')) ? 1 : 2;
                });
            }

            var lastNode, textTransform, handler, text = '', innerText = '';
            iterate(iterator, function (v) {
                var node = (doc || typer).getNode(v);
                handler = widgetOptions[node.widget.id].text;
                if (node !== lastNode) {
                    if (lastNode) {
                        text += transformText(innerText, textTransform);
                        innerText = '';
                        if (is(lastNode, NODE_ANY_BLOCK) && is(node, NODE_ANY_BLOCK) && text.slice(-2) !== '\n\n') {
                            text += '\n\n';
                        }
                        if (node.widget !== lastNode.widget && handler) {
                            text += handler(node.widget);
                        }
                    }
                    lastNode = node;
                    textTransform = $.css(node.element, 'text-transform');
                }
                if (is(node, NODE_ANY_ALLOWTEXT) && !handler) {
                    if (isText(v)) {
                        var value = v.data;
                        if (v === range.endContainer) {
                            value = value.slice(0, range.endOffset);
                        }
                        if (v === range.startContainer) {
                            value = value.slice(range.startOffset);
                        }
                        innerText += value.replace(/\u200b/g, '').replace(' ', '\u00a0');
                    } else if (isBR(v)) {
                        innerText += '\n';
                    }
                }
            });
            text += handler ? handler(lastNode.widget) : transformText(innerText, textTransform);
            return trim(text).replace(/\u00a0/g, ' ');
        }

        function initUndoable() {
            var snapshots = [];
            var currentIndex = 0;
            var suppressUntil = 0;
            var timeout;

            function saveCaret(caret) {
                var arr = [];
                for (var node = caret.node; node.parentNode; node = node.parentNode) {
                    arr.unshift(node.parentNode.childNodes.indexOf(node));
                }
                arr[arr.length] = caret.textNode ? caret.wholeTextOffset : caret.offset;
                return arr.join(' ');
            }

            function restoreCaret(caret, pos) {
                var arr = pos.split(' ');
                var element = topElement;
                var offset = arr.splice(-1)[0];
                arr.forEach(function (v) {
                    element = element.children[+v];
                });
                if (isNaN(offset)) {
                    caret.moveTo(element, offset === 'true');
                } else {
                    caret.moveToText(element, +offset);
                }
            }

            function takeSnapshot() {
                var value = typer.getValue();
                if (!snapshots[0] || value !== snapshots[currentIndex].value) {
                    snapshots.splice(0, currentIndex, {
                        value: value
                    });
                    snapshots.splice(typer.historyLevel);
                    currentIndex = 0;
                }
                snapshots[currentIndex].basePos = saveCaret(currentSelection.baseCaret);
                snapshots[currentIndex].extendPos = saveCaret(currentSelection.extendCaret);
                snapshots[currentIndex].html = topElement.innerHTML;
                triggerStateChange();
                clearTimeout(timeout);
            }

            function applySnapshot(state) {
                $self.html(state.html);
                restoreCaret(currentSelection, state.basePos);
                restoreCaret(currentSelection.extendCaret, state.extendPos);
                triggerStateChange();
                clearTimeout(timeout);
            }

            extend(internals, {
                canUndo: function () {
                    return currentIndex < snapshots.length - 1;
                },
                canRedo: function () {
                    return currentIndex > 0;
                },
                undo: function () {
                    if (internals.canUndo()) {
                        applySnapshot(snapshots[++currentIndex]);
                    }
                },
                redo: function () {
                    if (internals.canRedo()) {
                        applySnapshot(snapshots[--currentIndex]);
                    }
                },
                snapshot: function (ms) {
                    var cur = +new Date();
                    clearTimeout(timeout);
                    if (ms === true) {
                        takeSnapshot();
                    } else {
                        suppressUntil = Math.max(suppressUntil, cur + (ms || 0));
                        timeout = setTimeout(takeSnapshot, suppressUntil - cur);
                    }
                }
            });
        }

        function normalizeInputEvent() {
            var MIME_TYPER = 'application/x-typer';
            var MIME_TEXT = 'text/plain';
            var MIME_HTML = 'text/html';

            function deleteNextContent(e) {
                if (!currentSelection.isCaret) {
                    insertContents(currentSelection, '');
                    return true;
                }
                if (currentSelection.extendCaret.moveByCharacter(e.data === 'backspace' ? -1 : 1)) {
                    insertContents(currentSelection, '');
                    return true;
                }
            }

            function handleTextInput(inputText) {
                if (!currentSelection.startTextNode || !currentSelection.isCaret) {
                    insertContents(currentSelection, inputText);
                } else if (inputText) {
                    var curTextNode = currentSelection.startTextNode;
                    var curOffset = currentSelection.startOffset;
                    curTextNode.data = curTextNode.data.substr(0, curOffset) + inputText + curTextNode.data.slice(curOffset);
                    normalizeWhitespace(currentSelection.startNode.element);
                    currentSelection.moveToText(curTextNode, curOffset + inputText.length);
                    internals.snapshot(200);
                }
            }

            function handleDataTransfer(clipboardData) {
                var currentWidget = currentSelection.focusNode.widget;
                var allowHtml = widgetOptions[currentWidget.id].disallowedElement !== '*';
                var textContent = clipboardData.getData(zeta.IS_IE ? 'Text' : MIME_TEXT);

                if (allowHtml && $.inArray(MIME_TYPER, clipboardData.types) >= 0) {
                    var htmlContent = createDocumentFragment($(clipboardData.getData(MIME_HTML)).filter('#Typer').contents());
                    insertContents(currentSelection, htmlContent);
                } else if (allowHtml && textContent === clipboard.textContent) {
                    insertContents(currentSelection, clipboard.htmlContent.cloneNode(true));
                } else {
                    // do not call handleTextInput directly so that widget can receive textInput event
                    dom.emit('textInput', currentWidget.element, textContent, false);
                }
            }

            function handleClipboardExtract(e) {
                var clipboardData = e.clipboardData || window.clipboardData;
                var textContent = extractText(currentSelection);
                var htmlContent = extractContents(currentSelection, e.type);

                if (zeta.IS_IE) {
                    clipboardData.setData('Text', textContent);
                } else {
                    clipboardData.setData(MIME_TEXT, textContent);
                    clipboardData.setData(MIME_HTML, $('<div id="Typer">').append(htmlContent.cloneNode(true))[0].outerHTML);
                    clipboardData.setData(MIME_TYPER, 'true');
                }
                clipboard.textContent = textContent;
                clipboard.htmlContent = htmlContent;
                e.preventDefault();
            }

            var domEvents = {
                compositionstart: function () {
                    muteChanges = true;
                    composingEditor = typer;
                    container.emitAsync('stateChange');
                },
                compositionend: function () {
                    muteChanges = false;
                    composingEditor = false;
                    // forcibly update the selection
                    // because selection update is not reflected during composition
                    currentSelection.focus();
                    container.emitAsync('stateChange');
                },
                cut: handleClipboardExtract,
                copy: handleClipboardExtract,
                paste: function (e) {
                    handleDataTransfer(e.clipboardData || window.clipboardData);
                    e.preventDefault();
                    if (zeta.IS_IE) {
                        // IE put the caret in the wrong position after user code
                        // need to reposition the caret
                        var selection = currentSelection.clone();
                        setTimeout(function () {
                            currentSelection.select(selection);
                        });
                    }
                },
                drop: function (e) {
                    if (currentSelection.moveToPoint(e.clientX, e.clientY)) {
                        handleDataTransfer(e.dataTransfer);
                    }
                    currentSelection.focus();
                    e.preventDefault();
                },
                dragstart: function (e) {
                    e.preventDefault();
                }
            };
            container.add(topElement, {
                destroy: helper.bind(topElement, domEvents)
            });

            var defaultAction = {
                backspace: deleteNextContent,
                delete: deleteNextContent,
                enter: function () {
                    if (is(currentSelection.startNode, NODE_EDITABLE_PARAGRAPH)) {
                        return typer.invoke('insertLineBreak');
                    }
                    if (!typer.invoke('insertLine')) {
                        insertContents(currentSelection, '\n\n');
                    }
                    return true;
                },
                upArrow: function () {
                    return typer.invoke('stepUp');
                },
                downArrow: function () {
                    return typer.invoke('stepDown');
                },
                mousewheel: function (e) {
                    return typer.invoke(e.data < 0 ? 'stepUp' : 'stepDown');
                },
                textInput: function (e) {
                    handleTextInput(e.data);
                    return true;
                }
            };
            each({
                moveByLine: 'upArrow downArrow shiftUpArrow shiftDownArrow',
                moveByWord: 'ctrlLeftArrow ctrlRightArrow ctrlShiftLeftArrow ctrlShiftRightArrow',
                moveToLineEnd: 'home end shiftHome shiftEnd',
                moveByCharacter: 'leftArrow rightArrow shiftLeftArrow shiftRightArrow'
            }, function (i, v) {
                each(v, function (j, v) {
                    var direction = (j & 1) ? 1 : -1;
                    var extend = !!(j & 2);
                    var fn = defaultAction[v];
                    defaultAction[v] = function () {
                        if (fn && fn()) {
                            return true;
                        }
                        if (!extend && !currentSelection.isCaret) {
                            currentSelection.collapse(direction < 0 ? 'start' : 'end');
                        } else {
                            (extend ? currentSelection.extendCaret : currentSelection)[i](direction);
                        }
                    };
                });
            });

            var beforeEmit = {
                keystroke: function (e) {
                    // suppress browser native behavior on content editing shortcut (e.g. bold)
                    // common browser shortcuts that has no effect on content are excluded
                    if (!/ctrl(?=[acfnprstvwx]|f5|shift[nt]$)|^((shift)?tab|f5|f12)$/i.test(e.data)) {
                        e.preventDefault();
                    }
                },
                textInput: function (e) {
                    // unmute so that text input from composition events can trigger contentChange
                    muteChanges = false;
                },
                mousedown: function (e) {
                    (e.metakey === 'shift' ? currentSelection.extendCaret : currentSelection).moveToPoint(e.clientX, e.clientY);
                    currentSelection.focus();
                    dom.drag(e, function (x, y) {
                        internals.snapshot(200);
                        currentSelection.extendCaret.moveToPoint(x, y);
                    });
                    // browsers update selection range after mousedown event
                    setTimeout(function () {
                        currentSelection.focus();
                    });
                },
                click: function (e) {
                    var node = typer.getNode(e.target);
                    if (is(node, NODE_WIDGET | NODE_INLINE_WIDGET)) {
                        currentSelection.select(node.widget.element);
                    }
                    currentSelection.focus();
                },
                dblclick: function (e) {
                    currentSelection.select('word');
                },
                rightClick: function (e) {
                    var caret = new TyperCaret(typer);
                    caret.moveToPoint(e.clientX, e.clientY);
                    if (currentSelection.isCaret || !rangeIntersects(currentSelection, caret)) {
                        currentSelection.select(caret);
                    }
                }
            };

            container.tap(function (e) {
                var eventName = e.eventName;
                var target = currentSelection.focusNode.element;
                if (enabled) {
                    if (helper.matchWord(eventName, 'focusin focusout focusreturn')) {
                        // only fire focus related events for static widgets
                        if (e.target !== topElement) {
                            return;
                        }
                        target = topElement;
                    } else if (eventName === 'rightClick') {
                        target = topElement;
                    } else if (eventName === 'click') {
                        target = e.target;
                    }
                    (beforeEmit[eventName] || noop)(e);
                    if (container.emit(e, target) || (defaultAction[eventName === 'keystroke' ? e.data : eventName] || noop)(e)) {
                        e.handled();
                    }
                    if (e.originalEvent && e.isHandled()) {
                        e.preventDefault();
                    }
                }
            });
        }

        function setEnable(bool) {
            enabled = bool;
            $self.attr('contenteditable', bool ? 'true' : null);
            if (!bool && getActiveRange(topElement)) {
                topElement.blur();
            }
        }

        function setWidgetOption(id, base, options) {
            widgetOptions[id] = extend({}, base);
            widgetOptions[id].options = !options || helper.isPlainObject(options) ? extend({}, base.options, options) : options;
        }

        function registerStaticWidget(id) {
            var widget = new TyperWidget(typer, id, topElement, widgetOptions[id].options);
            container.add(widget, id, widgetOptions[id]);
            staticWidgets.push(widget);
        }

        function initWidgets() {
            each(options.widgets, function (i, v) {
                setWidgetOption(i, v, options[i]);
            });
            each(definedWidgets, function (i, v) {
                if (options[i]) {
                    setWidgetOption(i, v, options[i]);
                }
            });
            defineHiddenProperty(widgetOptions, WIDGET_ROOT, options);
            defineHiddenProperty(widgetOptions, WIDGET_UNKNOWN, {
                // make all other tags that are not considered paragraphs and inlines to be widgets
                // to avoid unknown behavior while editing
                element: options.disallowedElement || ':not(' + INNER_PTAG + ',br,b,em,i,u,strike,small,strong,sub,sup,ins,del,mark,span)',
                allowedIn: ''
            });
            options.textFlow = true;

            extend(internals, createTyperDocument(topElement, true));
            each(widgetOptions, function (i, v) {
                if (!v.element || v.element === topElement) {
                    registerStaticWidget(i);
                } else if (isFunction(v.setup)) {
                    container.add(new TyperWidget(typer, i, topElement), i, {
                        init: v.setup
                    });
                }
            });
        }

        initUndoable();
        initWidgets();
        normalizeInputEvent();
        setEnable(true);
        if (zeta.IS_IOS) {
            // remove formatting options from iOS popout
            $self.css('-webkit-user-modify', 'read-write-plaintext-only');
        }

        _(typer, extend(internals, {
            on: function (event, handler) {
                container.add(topElement, helper.isPlainObject(event) || helper.kv(event, handler));
            },
            enabled: function () {
                return enabled;
            },
            enable: function (id, options) {
                if (!id) {
                    setEnable(true);
                    container.emitAsync('stateChange');
                } else if (!widgetOptions[id] && definedWidgets[id] && !definedWidgets[id].element) {
                    setWidgetOption(id, definedWidgets[id], options);
                    registerStaticWidget(id);
                }
            },
            disable: function () {
                setEnable(false);
                container.emitAsync('stateChange');
            },
            destroy: function () {
                setEnable(false);
                container.destroy();
            },
            hasCommand: function (command) {
                return !!findWidgetWithCommand(command);
            },
            widgetEnabled: function (id) {
                return !!widgetOptions[id];
            },
            widgetAllowed: function (id, node) {
                node = is(node, TyperNode) || typer.getNode(node || topElement);
                return !!widgetAllowed(id, node);
            },
            getWidgetOption: function (id, name) {
                return widgetOptions[id] && widgetOptions[id][name];
            },
            getStaticWidget: function (id) {
                return any(staticWidgets, function (v) {
                    return v.id === id;
                });
            },
            getStaticWidgets: function () {
                return staticWidgets.slice(0);
            },
            getSelection: function () {
                return currentSelection;
            },
            extractText: function (selection) {
                return extractText(selection);
            },
            invoke: function (command, value) {
                var commandName;
                var widget;
                if (typeof command === 'string') {
                    widget = findWidgetWithCommand(command);
                    commandName = command;
                    command = widget && widgetOptions[widget.id].commands[command];
                }
                if (!isFunction(command)) {
                    return false;
                }
                var tx = new TyperTransaction(typer, widget, commandName);
                command.call(typer, tx, value);
                normalize();
                internals.snapshot();
                if (typer.focused(true)) {
                    currentSelection.focus();
                }
                return true;
            },
            insertText: function (text) {
                insertContents(currentSelection, text);
            },
            insertHtml: function (content) {
                insertContents(currentSelection, is(content, Node) || createDocumentFragment(content));
            },
            insertWidget: function (name, options) {
                var handler = (widgetOptions[name] || '').create;
                if (isFunction(handler)) {
                    handler.call(typer, this, options);
                }
            },
            removeWidget: function (widget) {
                var handler = widgetOptions[widget.id].remove;
                if (isFunction(handler)) {
                    handler.call(typer, new TyperTransaction(typer, widget));
                } else if (handler === 'keepText') {
                    var textContent = extractText(widget.element);
                    insertContents(createRange(widget.element, true), textContent);
                    removeNode(widget.element);
                } else {
                    insertContents(createRange(widget.element), '');
                }
            }
        }));
        typer.element = topElement;
        typer.rootNode = internals.rootNode;

        normalize();
        currentSelection = new TyperSelection(typer, createRange(topElement, 0));
        container.emit('init');
    }

    extend(Typer, {
        NODE_WIDGET: NODE_WIDGET,
        NODE_PARAGRAPH: NODE_PARAGRAPH,
        NODE_EDITABLE: NODE_EDITABLE,
        NODE_EDITABLE_PARAGRAPH: NODE_EDITABLE_PARAGRAPH,
        NODE_INLINE: NODE_INLINE,
        NODE_INLINE_WIDGET: NODE_INLINE_WIDGET,
        NODE_INLINE_EDITABLE: NODE_INLINE_EDITABLE,
        NODE_ANY_ALLOWTEXT: NODE_ANY_ALLOWTEXT,
        NODE_ANY_BLOCK_EDITABLE: NODE_ANY_BLOCK_EDITABLE,
        NODE_ANY_INLINE: NODE_ANY_INLINE,
        ZWSP: ZWSP,
        ZWSP_ENTITIY: ZWSP_ENTITIY,
        defaultOptions: defaultOptions,
        widgets: definedWidgets,
    });
    zeta.Editor = Typer;

    definePrototype(Typer, {
        historyLevel: 100,
        closest: closest,
        getAbstractSide: getAbstractSide,
        createCaret: function (node, offset) {
            var caret = new TyperCaret(this);
            if (node) {
                caret.moveTo(node, offset);
            }
            return caret;
        },
        createSelection: function (startNode, startOffset, endNode, endOffset) {
            return new TyperSelection(this, createRange(startNode, startOffset, endNode, endOffset));
        },
        createTreeWalker: function (root, whatToShow, filter) {
            return new TyperTreeWalker(root || this.rootNode, whatToShow, filter);
        },
        nodeFromPoint: function (x, y, whatToShow) {
            var element = helper.elementFromPoint(x, y, this.element);
            if (element) {
                var node = this.getNode(element);
                if (is(node, NODE_EDITABLE)) {
                    var mode = getWritingMode(element);
                    var point = getAbstractRect(toPlainRect(x, y), mode);
                    node = any(node.childNodes, function (v) {
                        var rect = getAbstractRect(getRect(v.element, true), mode);
                        return rect.top <= point.top && rect.bottom >= point.top;
                    }) || node;
                }
                return closest(node, whatToShow || -1);
            }
        },
        hasContent: function () {
            if (this === composingEditor) {
                return true;
            }
            if (trim(this.element.textContent).length) {
                return true;
            }
            return !!(new TyperTreeWalker(this.rootNode, ~(NODE_PARAGRAPH | NODE_INLINE)).nextNode());
        },
        getValue: function () {
            return trim(this.element.innerHTML.replace(/\s+style(?:="[^"]*")?|\u200b+(?!<\/)|(^|[^>])\u200b+/g, '$1'));
        },
        setValue: function (value) {
            this.invoke(function (tx) {
                createDocumentFragment(tx.typer.element.childNodes);
                tx.insertHtml(value);
            });
        },
        validate: function () {
            return true;
        },
        select: function (startNode, startOffset, endNode, endOffset) {
            return this.getSelection().select(startNode, startOffset, endNode, endOffset);
        },
        selectAll: function () {
            return this.getSelection().selectAll();
        },
        focus: function () {
            this.getSelection().focus();
        },
        focused: function (strict) {
            return dom.focused(this.element, strict);
        },
        retainFocus: function (element) {
            dom.retainFocus(this.element, element);
        },
        releaseFocus: function (element) {
            dom.releaseFocus(this.element, element);
        },
        support: function (command) {
            return this.hasCommand(command) && this.invoke.bind(this, command);
        }
    });
    each('on enabled enable disable destroy hasCommand widgetEnabled widgetAllowed getNode getWidgetOption getStaticWidget getStaticWidgets getSelection extractText invoke canUndo canRedo undo redo snapshot', function (i, v) {
        defineHiddenProperty(Typer.prototype, v, function () {
            return _(this)[v].apply(null, arguments);
        });
    });
    each('insertText insertHtml insertWidget removeWidget', function (i, v) {
        defineHiddenProperty(TyperTransaction.prototype, v, function () {
            return _(this.typer)[v].apply(null, arguments);
        });
    });

    definePrototype(TyperWidget, {
        get parent() {
            var node = this.element && this.typer.getNode(this.element.parentNode);
            return node && node.widget;
        }
    });

    definePrototype(TyperNode, {
        get firstChild() {
            return this.childNodes[0] || null;
        },
        get lastChild() {
            var arr = this.childNodes;
            return arr[arr.length - 1] || null;
        }
    });

    function treeWalkerIsNodeVisible(inst, node) {
        return node && ((inst.whatToShow & NODE_SHOW_HIDDEN) || node.element.offsetWidth > 0 || node.element.offsetHeight > 0) && node;
    }

    function treeWalkerAcceptNode(inst, node, checkWidget) {
        if (checkWidget && node !== inst.root && !treeWalkerIsNodeVisible(inst, node)) {
            return 2;
        }
        if (is(node, NODE_WIDGET) && is(node.parentNode, NODE_WIDGET)) {
            return 3;
        }
        return acceptNode(inst, node);
    }
    treeWalkerAcceptNode.$1 = 0;

    function treeWalkerNodeAccepted(inst, node, checkWidget) {
        treeWalkerAcceptNode.$1 = treeWalkerAcceptNode(inst, node, checkWidget);
        if (treeWalkerAcceptNode.$1 === 1) {
            inst.currentNode = node;
            return true;
        }
    }

    function treeWalkerTraverseChildren(inst, pChild, pSib) {
        var node = inst.currentNode[pChild];
        while (node) {
            if (treeWalkerNodeAccepted(inst, node, true)) {
                return node;
            }
            if (treeWalkerAcceptNode.$1 === 3 && node[pChild]) {
                node = node[pChild];
                continue;
            }
            while (!node[pSib]) {
                node = treeWalkerIsNodeVisible(inst, node.parentNode);
                if (!node || node === inst.root || node === inst.currentNode) {
                    return null;
                }
            }
            node = node[pSib];
        }
    }

    function treeWalkerTraverseSibling(inst, pChild, pSib) {
        var node = inst.currentNode;
        while (node && node !== inst.root) {
            var sibling = node[pSib];
            while (sibling) {
                if (treeWalkerNodeAccepted(inst, sibling)) {
                    return sibling;
                }
                sibling = (treeWalkerAcceptNode.$1 === 2 || !sibling[pChild]) ? sibling[pSib] : sibling[pChild];
            }
            node = treeWalkerIsNodeVisible(inst, node.parentNode);
            if (!node || node === inst.root || treeWalkerAcceptNode(inst, node, true) === 1) {
                return null;
            }
        }
    }

    definePrototype(TyperTreeWalker, {
        previousSibling: function () {
            return treeWalkerTraverseSibling(this, 'lastChild', 'previousSibling');
        },
        nextSibling: function () {
            return treeWalkerTraverseSibling(this, 'firstChild', 'nextSibling');
        },
        firstChild: function () {
            return treeWalkerTraverseChildren(this, 'firstChild', 'nextSibling');
        },
        lastChild: function () {
            return treeWalkerTraverseChildren(this, 'lastChild', 'previousSibling');
        },
        parentNode: function () {
            for (var node = this.currentNode; node && node !== this.root; node = node.parentNode) {
                if (treeWalkerNodeAccepted(this, node.parentNode, true)) {
                    return node.parentNode;
                }
            }
        },
        previousNode: function () {
            var self = this;
            for (var node = self.currentNode; node && node !== self.root;) {
                for (var sibling = node.previousSibling; sibling; sibling = node.previousSibling) {
                    node = sibling;
                    var rv = treeWalkerAcceptNode(self, sibling);
                    while (rv !== 2 && treeWalkerIsNodeVisible(self, node.firstChild)) {
                        node = node.lastChild;
                        rv = treeWalkerAcceptNode(self, node, true);
                    }
                    if (rv === 1) {
                        self.currentNode = node;
                        return node;
                    }
                }
                node = treeWalkerIsNodeVisible(self, node.parentNode);
                if (!node || node === self.root) {
                    return null;
                }
                if (treeWalkerNodeAccepted(self, node, true)) {
                    return node;
                }
            }
        },
        nextNode: function () {
            var self = this;
            var rv = 1;
            for (var node = self.currentNode; node;) {
                while (rv !== 2 && node.firstChild) {
                    node = node.firstChild;
                    if (treeWalkerNodeAccepted(self, node, true)) {
                        return node;
                    }
                    rv = treeWalkerAcceptNode.$1;
                }
                while (node && node !== self.root && !node.nextSibling) {
                    node = treeWalkerIsNodeVisible(self, node.parentNode);
                }
                if (!node || node === self.root) {
                    return null;
                }
                node = node.nextSibling;
                if (treeWalkerNodeAccepted(self, node, true)) {
                    return node;
                }
                rv = treeWalkerAcceptNode.$1;
            }
        }
    });

    function nodeIteratorInit(inst, iterator) {
        var typer = iterator.currentNode.typer;
        var iterator2 = document.createTreeWalker(iterator.root.element, inst.whatToShow | 1, function (v) {
            var node = typer.getNode(v);
            if (node.element !== v && !is(node, NODE_ANY_ALLOWTEXT)) {
                return 3;
            }
            if (!treeWalkerNodeAccepted(iterator, node, true)) {
                return treeWalkerAcceptNode.$1;
            }
            return acceptNode(inst, v) | 1;
        }, false);
        defineHiddenProperty(inst, 'iterator', iterator2);
    }

    definePrototype(TyperDOMNodeIterator, {
        get currentNode() {
            return this.iterator.currentNode;
        },
        set currentNode(node) {
            this.iterator.currentNode = node;
        },
        previousNode: function () {
            return this.iterator.previousNode();
        },
        nextNode: function () {
            return this.iterator.nextNode();
        }
    });

    function selectionCreateTreeWalker(inst, whatToShow, filter) {
        var range = createRange(inst);
        var proxy = _(inst).proxy;
        var defaultFilter = function (v) {
            return !rangeIntersects(v.element, range) ? 2 : 1;
        };
        return new TyperTreeWalker(inst.focusNode, whatToShow & ~NODE_SHOW_HIDDEN, combineNodeFilters(defaultFilter, proxy && proxy.acceptNode && proxy.acceptNode.bind(proxy), filter));
    }

    function selectionIterateTextNodes(inst) {
        var iterator = new TyperDOMNodeIterator(selectionCreateTreeWalker(inst, NODE_ANY_ALLOWTEXT), 4);
        iterator.currentNode = inst.startTextNode || inst.startElement;
        if (inst.startOffset === (inst.startTextNode || '').length) {
            iterator.nextNode();
        }
        return iterateToArray(iterator, null, null, function (v) {
            return comparePosition(v, inst.endTextNode || inst.endElement) <= (inst.endOffset !== 0 ? 0 : -1);
        });
    }

    function selectionSplitText(inst) {
        var p1 = inst.getCaret('start');
        var p2 = inst.getCaret('end');
        if (p2.textNode && !isTextNodeEnd(p2.textNode, p2.offset, 1)) {
            p2.textNode.splitText(p2.offset);
        }
        if (p1.textNode && !isTextNodeEnd(p1.textNode, p1.offset, -1)) {
            caretSetPositionRaw(p1, p1.node, p1.element, p1.textNode.splitText(p1.offset), 0);
        }
    }

    function selectionAtomic(callback, args, thisArg) {
        selectionAtomic.executing = true;
        return selectionAtomic.run(callback, args, thisArg);
    }
    selectionAtomic.executing = false;
    selectionAtomic.run = transaction(function () {
        selectionAtomic.executing = false;
        dirtySelections.forEach(selectionUpdate);
        dirtySelections.clear();
    });

    function selectionUpdate(inst) {
        if (selectionAtomic.executing) {
            dirtySelections.add(inst);
            return;
        }
        var cache = _(inst);
        cache.m = 0;
        cache.proxy = null;
        inst.timestamp = performance.now();
        inst.direction = helper.compareRangePosition(inst.extendCaret, inst.baseCaret) || 0;
        inst.isCaret = !inst.direction;
        for (var i = 0, p1 = inst.getCaret('start'), p2 = inst.getCaret('end'); i < 4; i++) {
            inst[selectionUpdate.NAMES[i + 4]] = p1[selectionUpdate.NAMES[i]];
            inst[selectionUpdate.NAMES[i + 8]] = p2[selectionUpdate.NAMES[i]];
        }
        var node = inst.typer.getNode(helper.getCommonAncestor(inst.baseCaret.element, inst.extendCaret.element));
        inst.focusNode = closest(node, NODE_WIDGET | NODE_INLINE_WIDGET | NODE_ANY_BLOCK_EDITABLE | NODE_INLINE_EDITABLE);
        if (inst === inst.typer.getSelection()) {
            if (inst.typer.focused(true)) {
                inst.focus();
            }
            inst.typer.snapshot();
        }
    }
    selectionUpdate.NAMES = 'node element textNode offset startNode startElement startTextNode startOffset endNode endElement endTextNode endOffset'.split(' ');

    definePrototype(TyperSelection, {
        get isSingleEditable() {
            return this.isCaret || !selectionCreateTreeWalker(this, NODE_ANY_BLOCK_EDITABLE).nextNode();
        },
        getCaret: function (point) {
            var b = this.baseCaret;
            var e = this.extendCaret;
            switch (point) {
                case 'extend':
                    return e;
                case 'start':
                    return this.direction < 0 ? e : b;
                case 'end':
                    return this.direction < 0 ? b : e;
                default:
                    return b;
            }
        },
        getRange: function (collapse) {
            var b = this.baseCaret;
            var e = this.extendCaret;
            if (collapse !== undefined || this.isCaret) {
                return (collapse !== false ? b : e).getRange();
            }
            return createRange(b.getRange(), e.getRange());
        },
        getRects: function () {
            var self = this;
            var proxy = _(self).proxy;
            if (proxy && proxy.getRects) {
                return proxy.getRects();
            }
            if (self.isCaret) {
                return [getRect(self.baseCaret)];
            }
            if (is(self.startNode, NODE_WIDGET) === self.focusNode) {
                return [getRect(self.startNode)];
            }
            var range = self.getRange();
            var arr = [];
            iterate(selectionCreateTreeWalker(self, -1, function (v) {
                if (rangeCovers(range, v.element)) {
                    arr[arr.length] = getRect(v);
                    return 2;
                }
                if (is(v, NODE_ANY_ALLOWTEXT)) {
                    var side = getAbstractSide('inline-start', v.element);
                    var result = [];
                    each(getRects(createRange(range, createRange(v.element, 'contents'))), function (i, v) {
                        if (Math.abs(v[side] - v[FLIP_POS[side]]) <= 1) {
                            v[FLIP_POS[side]] += 5;
                        }
                        each(result, function (i, w) {
                            if (Math.abs(v.left - w.right) <= 1) {
                                w.right = v.left;
                            }
                            if (Math.abs(v.top - w.bottom) <= 1) {
                                w.bottom = v.top;
                            }
                        });
                        result[result.length] = v;
                    });
                    arr.push.apply(arr, result);
                    return 2;
                }
                return 1;
            }));
            return arr;
        },
        getWidget: function (id) {
            return any(this.getWidgets(), function (v) {
                return v.id === id;
            });
        },
        getWidgets: function () {
            var nodes = [];
            for (var node = this.focusNode; node.widget.id !== WIDGET_ROOT; node = node.parentNode) {
                nodes.unshift(node.widget);
                node = this.typer.getNode(node.widget.element);
            }
            return nodes;
        },
        getParagraphElements: function () {
            var self = this;
            if (self.startNode === self.endNode) {
                return is(self.startNode, NODE_PARAGRAPH) ? [self.startNode.element] : [];
            }
            return iterateToArray(selectionCreateTreeWalker(self, NODE_PARAGRAPH), function (v) {
                return v.element;
            });
        },
        getSelectedElements: function () {
            var self = this;
            if (self.isCaret) {
                return [self.startElement];
            }
            return $(selectionIterateTextNodes(self)).parent().get();
        },
        getSelectedText: function () {
            return this.typer.extractText(this);
        },
        getSelectedTextNodes: function () {
            var self = this;
            if (self.isCaret) {
                return [];
            }
            selectionSplitText(self);
            return selectionIterateTextNodes(self);
        },
        createTreeWalker: function (whatToShow, filter) {
            return selectionCreateTreeWalker(this, whatToShow, filter);
        },
        collapse: function (point) {
            point = this.getCaret(point);
            return (point === this.baseCaret ? this.extendCaret : this.baseCaret).moveTo(point);
        },
        select: function (startNode, startOffset, endNode, endOffset) {
            var self = this;
            var result;
            selectionAtomic(function () {
                if (startNode === 'word') {
                    result = self.getCaret('start').moveByWord(-1) + self.getCaret('end').moveByWord(1) > 0;
                } else {
                    var range = createRange(startNode, startOffset, endNode, endOffset);
                    result = self.baseCaret.moveTo(range, true) + self.extendCaret.moveTo(range, false) > 0;
                }
            });
            if (startNode.acceptNode) {
                _(self).proxy = startNode;
            }
            return result;
        },
        selectAll: function () {
            return this.select(this.typer.element, 'contents');
        },
        focus: function () {
            var self = this;
            var topElement = self.typer.element;
            if (zeta.IS_TOUCH && document.activeElement !== topElement && !(dom.event || '').isTrusted) {
                // virtual keyboard might not appear in non-trusted callstack
                // experienced difficulty to trigger virtual keyboard by touch afterwards
                return;
            }
            if (containsOrEquals(document, topElement) && self.typer.enabled() && composingEditor !== self.typer) {
                helper.makeSelection(self.baseCaret.getRange(), self.extendCaret.getRange());
                // Firefox does not set focus on the host element automatically
                // when selection is changed by JavaScript
                if (document.activeElement !== topElement) {
                    topElement.focus();
                }
                dom.scrollIntoView(topElement, self.extendCaret.getRect());
            }
        },
        clone: function () {
            var self = this;
            var inst = new TyperSelection(self.typer);
            selectionAtomic(function () {
                inst.baseCaret.moveTo(self.baseCaret);
                inst.extendCaret.moveTo(self.extendCaret);
            });
            _(inst).proxy = _(self).proxy;
            return inst;
        },
        widgetAllowed: function (id) {
            return this.typer.widgetAllowed(id, this.focusNode);
        }
    });

    each('moveTo moveToPoint moveToText moveByLine moveToLineEnd moveByWord moveByCharacter', function (i, v) {
        defineHiddenProperty(TyperSelection.prototype, v, function () {
            var self = this;
            return selectionAtomic(function () {
                return TyperCaret.prototype[v].apply(self.baseCaret, arguments) + self.collapse('base') > 0;
            }, arguments);
        });
    });
    each('getWidgets getParagraphElements getSelectedElements getSelectedText getSelectedTextNodes', function (i, v) {
        var fn = TyperSelection.prototype[v];
        TyperSelection.prototype[v] = function () {
            var cache = _(this);
            if (!(cache.m & (1 << i))) {
                cache[v] = fn.apply(this);
                cache.m |= (1 << i);
            }
            return helper.isArray(cache[v]) ? cache[v].slice(0) : cache[v];
        };
    });

    function caretTextNodeIterator(inst, root, whatToShow) {
        var iterator = new TyperDOMNodeIterator(new TyperTreeWalker(root || inst.typer.rootNode, NODE_ANY_ALLOWTEXT | NODE_WIDGET | NODE_INLINE_WIDGET), whatToShow | 4);
        iterator.currentNode = inst.textNode || inst.element;
        return iterator;
    }

    function caretAtomic(inst, callback) {
        return inst.selection ? selectionAtomic(callback, null, inst) : callback.call(inst);
    }

    function caretEnsureState(inst) {
        var root = inst.typer.element;
        var element = inst.element;
        var textNode = inst.textNode;
        if (!containsOrEquals(root, textNode || element) || (textNode && (textNode.parentNode !== element || inst.offset > textNode.length))) {
            var result;
            if (textNode && containsOrEquals(root, textNode) && inst.offset <= textNode.length) {
                result = inst.moveTo(textNode, inst.offset);
            } else if (containsOrEquals(root, inst.node.element)) {
                result = inst.moveToText(inst.node.element, inst.wholeTextOffset) || inst.moveTo(inst.node.element, 0);
            } else {
                var replace = {
                    node: element
                };
                inst.typer.getNode(element);
                for (; !containsOrEquals(root, replace.node) && detachedElements.has(replace.node); replace = detachedElements.get(replace.node));
                result = inst.moveTo(replace.node, replace.offset);
            }
            if (!result) {
                inst.moveTo(root, 0);
            }
        }
        return inst;
    }

    function caretSetPositionRaw(inst, node, element, textNode, offset, beforeSoftBreak) {
        var prev = [inst.node, inst.element, inst.textNode, inst.offset];
        var updated = prev[0] !== node || prev[1] !== element || prev[2] !== textNode || prev[3] !== offset;
        inst.node = node;
        inst.element = element;
        inst.textNode = textNode || null;
        inst.offset = offset;
        inst.wholeTextOffset = (textNode ? inst.offset : 0) + getWholeTextOffset(node, textNode || element);
        inst.beforeSoftBreak = !!beforeSoftBreak;
        if (updated && inst.selection) {
            selectionUpdate(inst.selection);
        }
        return updated;
    }

    function caretSetPosition(inst, element, offset, beforeSoftBreak) {
        var textNode, end;
        while (isElm(element) && element.lastChild) {
            end = offset === element.childNodes.length;
            element = element.childNodes[offset - end];
            offset = end ? (element.data || element.childNodes).length || 0 : 0;
        }
        var node = inst.typer.getNode(element);
        if (is(node, NODE_WIDGET | NODE_INLINE_WIDGET)) {
            element = node.widget.element;
            if (element !== node.element) {
                node = inst.typer.getNode(element);
            }
            if (is(node.parentNode, NODE_ANY_ALLOWTEXT)) {
                textNode = isText(end ? element.nextSibling : element.previousSibling) || $(createTextNode())[end ? 'insertAfter' : 'insertBefore'](element)[0];
                element = textNode.parentNode;
                offset = end ? 0 : textNode.length;
                node = node.parentNode;
            } else {
                textNode = null;
            }
        } else if (!is(node, NODE_ANY_ALLOWTEXT)) {
            var child = any(node.childNodes, function (v) {
                return comparePosition(element, v.element) < 0;
            });
            node = child || node.lastChild || node;
            textNode = null;
            end = !child;
        } else if (isBR(element)) {
            textNode = isText(element.nextSibling) || $(createTextNode()).insertAfter(element)[0];
        } else {
            textNode = isText(element);
        }
        if (inst.selection && inst === inst.selection.extendCaret && is(node.previousSibling, NODE_WIDGET) === inst.selection.baseCaret.node) {
            node = node.previousSibling;
            textNode = null;
            end = true;
        }
        if (!textNode && is(node, NODE_ANY_ALLOWTEXT)) {
            var iterator = new TyperDOMNodeIterator(new TyperTreeWalker(node, NODE_ANY_ALLOWTEXT), 4);
            while (iterator.nextNode() && end);
            textNode = isText(iterator.currentNode) || $(createTextNode())[end ? 'appendTo' : 'prependTo'](node.element)[0];
            offset = textNode && end ? textNode.length : 0;
        }
        if (textNode && !beforeSoftBreak) {
            var moveToMostInner = function (dir, pSib, pChild, mInsert) {
                var next = isTextNodeEnd(textNode, offset, dir) && isElm(textNode[pSib]);
                if (next && !isBR(next) && is(inst.typer.getNode(next), NODE_ANY_ALLOWTEXT)) {
                    textNode = isText(next[pChild]) || $(createTextNode())[mInsert](next)[0];
                    offset = getOffset(textNode, 0 * dir);
                    return true;
                }
            };
            while (moveToMostInner(-1, 'previousSibling', 'lastChild', 'appendTo') || moveToMostInner(1, 'nextSibling', 'firstChild', 'prependTo'));
            if (!textNode.length) {
                textNode.data = ZWSP;
                offset = 1;
            }
        }
        return caretSetPositionRaw(inst, closest(node, NODE_ANY_BLOCK), textNode ? textNode.parentNode : node.element, textNode, textNode ? offset : !end, beforeSoftBreak);
    }

    function caretRectFromPosition(node, offset, beforeSoftBreak, visual) {
        var mode = getWritingMode(node);
        var invert = offset === node.length || (!!beforeSoftBreak && offset > 0);
        var baseRTL = !!(mode & 2);
        var ch = node.data.charAt(offset - invert);

        if (isRTL(ch) !== baseRTL && $.css(node.parentNode, 'unicode-bidi').slice(-8) !== 'override') {
            // bidi paragraph are isolated by block boundaries or boxes styled with isolate or isolate-override
            var root = node.parentNode;
            for (; $.css(root, 'display') === 'inline' && $.css(root, 'unicode-bidi').slice(0, 7) !== 'isolate'; root = root.parentNode);

            // only check adjacent directionality if there is strongly trans-directioned character
            if ((baseRTL ? RE_LTR : RE_RTL).test(root.textContent)) {
                var checkAdjacent = function (node, offset, direction) {
                    var iterator = document.createTreeWalker(root, 5, function (v) {
                        if (isElm(v) && !isBR(v)) {
                            // any non-inline and replaced elements are considered neutral
                            if ($.css(v, 'display') !== 'inline' || is(v, 'audio,canvas,embed,iframe,img,input,object,video')) {
                                return 2;
                            }
                            switch ($.css(v, 'unicode-bidi')) {
                                case 'normal':
                                case 'plaintext':
                                    return 3;
                                case 'isolate':
                                case 'isolate-override':
                                    // isolated bidi sequences are considered neutral
                                    return 2;
                            }
                        }
                        return 1;
                    }, false);
                    iterator.currentNode = node;
                    while (isText(node)) {
                        while (offset !== getOffset(node, 0 * -direction)) {
                            offset += direction;
                            if (/(\S)/.test(node.data.charAt(offset))) {
                                return isRTL(RegExp.$1, baseRTL);
                            }
                        }
                        node = next(iterator, direction);
                        offset = direction > 0 ? -1 : (node || '').length;
                    }
                    return !node || isBR(node) ? baseRTL : $.css(node, 'direction') === 'rtl';
                };
                var prevRTL = checkAdjacent(node, offset - invert, -1);
                var nextRTL = checkAdjacent(node, offset - invert, 1);
                var curRTL = prevRTL === nextRTL && /\s/.test(ch) ? prevRTL : isRTL(ch, baseRTL);
                if (!invert && curRTL !== baseRTL && prevRTL === baseRTL) {
                    // sticks at the end of cis-directioned text sequence at cis/trans boundary
                    invert = true;
                    curRTL = prevRTL;
                }
                mode = (mode & ~2) | (curRTL ? 2 : 0);
            }
        }

        var rect = getRects(createRange(node, offset - invert, node, offset + !invert))[0] || toPlainRect(0, 0);
        if (visual && invert && /\s/.test(node.data.charAt(offset - invert)) && !getAbstractRect(rect, mode).width) {
            // Firefox returns zero-width rect when whitespace character acts as soft paragraph break
            rect[getAbstractSide(3, mode)] += getFontMetric(node).wsWidth;
        }
        return rect.collapse(getAbstractSide(2 | invert, mode));
    }

    function caretMoveToPoint(inst, textNode, point, dirX, dirY) {
        var container = closest(inst.typer.getNode(textNode), NODE_ANY_BLOCK);
        var mode = getWritingMode(textNode);
        var mCacheElm = [];
        var mCacheProp = [];
        var lastDist = -Infinity;
        var newPoint;

        function getTextProperties(elm) {
            var index = mCacheElm.indexOf(elm);
            if (index >= 0) {
                return mCacheProp[index];
            }
            var style = getComputedStyle(elm);
            var container = elm;
            for (; $.css(container, 'display') === 'inline'; container = container.parentNode);

            var obj = mCacheProp[mCacheElm.push(elm) - 1] = getFontMetric(elm);
            obj.lineHeight = style.lineHeight.slice(-2) === 'px' ? parseFloat(style.lineHeight) : (style.lineHeight === 'normal' ? 1.15 : style.lineHeight) * obj.fontSize;
            obj.verticalAlign = style.verticalAlign;
            obj.baselineOffset = obj.baseline - obj.height + getBaselineOffset(elm, container);
            return obj;
        }

        function getBaselineOffset(elm, parent) {
            if (elm === parent) {
                return 0;
            }
            if (elm.parentNode !== parent) {
                return getBaselineOffset(elm, elm.parentNode) + getBaselineOffset(elm.parentNode, parent);
            }
            var m = getTextProperties(elm);
            switch (m.verticalAlign) {
                case 'baseline':
                    return 0;
                case 'middle':
                    var m1 = getTextProperties(elm.parentNode);
                    return -m.height / 2 + (m1.baseline - m1.middle);
                case 'top':
                case 'bottom':
                    return NaN;
                case 'text-top':
                    return (m.lineHeight - m.height) / 2;
                case 'text-bottom':
                    return (m.lineHeight + m.height) / 2 - getTextProperties(elm.parentNode).height;
                case 'sub':
                    return -0.21 * m.fontSize;
                case 'super':
                    return 0.34 * m.fontSize;
            }
            return isNaN(m.verticalAlign) ? parseFloat(m.verticalAlign) / 100 * m.lineHeight : +m.verticalAlign || 0;
        }

        function checkRect(rect) {
            var dist, newX;
            if (dirX) {
                newX = dirX > 0 ? rect.right : rect.left;
                dist = (newX - point.left) * dirX;
            } else {
                dist = Math.min(0, rect.right - point.left) || Math.max(0, rect.left - point.left);
                newX = point.left + dist;
            }
            if (dirX ? dist > lastDist : Math.abs(dist) < Math.abs(lastDist)) {
                lastDist = dist;
                textNode = rect.node;
                newPoint = getAbstractRect(toPlainRect(newX, rect.centerY), -mode);
            }
        }

        function findNearsetPoint(container, textNode, dir, scanCount, untilY) {
            var iterator = new TyperDOMNodeIterator(new TyperTreeWalker(container, NODE_ANY_ALLOWTEXT), 4);
            var prop = dir > 0 ? 'bottom' : 'top';
            var linebox = point;
            var pending = [];
            var baseline;

            if (!isText(textNode)) {
                while (iterator.nextNode() && dir < 0);
                textNode = iterator.currentNode;
                if (!isText(textNode)) {
                    return linebox[prop];
                }
            } else {
                iterator.currentNode = textNode;
            }
            do {
                var m = getTextProperties(textNode.parentNode);
                var rects = getRects(textNode);
                if (dir < 0) {
                    rects.reverse();
                }
                for (var i = 0, len = rects.length; i < len; i++) {
                    var curRect = getAbstractRect(rects[i], mode);
                    var halfLead = (m.lineHeight - curRect.height) >> 1;
                    var curLinebox = toPlainRect(curRect.left, curRect.top - halfLead, curRect.right, curRect.bottom + halfLead);
                    var curBaseline = curRect.bottom + m.baselineOffset;
                    var isSameLine = false;
                    curLinebox.node = textNode;

                    // skip rects until we reach our starting Y-position
                    if (baseline === undefined && curLinebox[prop] * dir < linebox[FLIP_POS[prop]] * dir) {
                        continue;
                    }
                    if (isNaN(baseline) || Math.abs(curBaseline - baseline) < 1 || (curLinebox.top < linebox.bottom && curLinebox.bottom > linebox.top)) {
                        isSameLine = true;
                    } else if (isNaN(curBaseline)) {
                        if (m.verticalAlign === FLIP_POS[prop]) {
                            // we can safely determine if the vertical align is opposite to scanning direction (i.e. top for scanning down)
                            // since it is on the same line iff it overlaps the current line box
                            isSameLine = curLinebox[FLIP_POS[prop]] * dir <= linebox[prop] * dir;
                        } else if (!pending[0] || curLinebox[prop] === pending[0][prop]) {
                            pending.push(curLinebox);
                            continue;
                        } else {
                            // not aligning with previous box with the same vertical align
                            // push previous pending box into result if it aligns with the current line box edge
                            var arr = pending.splice(0, pending.length, curLinebox);
                            if (arr[0][prop] === linebox[prop]) {
                                arr.forEach(checkRect);
                            }
                        }
                    }
                    if (baseline === undefined || !isNaN(curBaseline)) {
                        baseline = curBaseline;
                    }
                    if ((!isSameLine && !--scanCount) || baseline * dir > untilY * dir) {
                        return linebox[prop];
                    }
                    linebox = helper.mergeRect(linebox, curLinebox);
                    if (scanCount === 1) {
                        pending.splice(0).forEach(checkRect);
                        checkRect(curLinebox);
                    }
                }
            } while ((textNode = next(iterator, dir)));
            return linebox[prop];
        }

        function findOffset(textNode, newPoint, mode, beforeSoftBreak) {
            var b0 = 0;
            var b1 = textNode.length;

            function distanceFromCharacter(index) {
                // IE11 (update version 11.0.38) crashes with memory access violation when
                // Range.getClientRects() is called on a whitespace neignboring a non-static positioned element
                // https://jsfiddle.net/b6q4p664/
                // while (/[^\S\u00a0]/.test(node.data.charAt(index)) && --index);
                var rect = getAbstractRect(caretRectFromPosition(textNode, index, beforeSoftBreak), mode);
                return ((rect.centerY - newPoint.centerY) | 0) * Infinity || ((rect.left - newPoint.left) | 0);
            }

            // determine directionality at the given point if there is characters with different directionality
            if ($.css(textNode.parentNode, 'unicode-bidi').slice(-8) !== 'override' && (mode & 2 ? RE_LTR : RE_RTL).test(textNode.data)) {
                var re = mode & 2 ? [RE_LTR, RE_N_RTL] : [RE_RTL, RE_N_LTR];
                var i = 0, containsPoint;
                b1 = -1;
                while (!containsPoint && re[++i & 1].test(textNode.data.slice(b1 + 1))) {
                    b0 = Math.max(0, b1);
                    b1 = textNode.data.indexOf(RegExp.$1, b1 + 1);
                    containsPoint = any(getRects(createRange(textNode, b0, textNode, b1)), function (v) {
                        // do not use pointInRect as we need to match zero-width rect
                        return v.top <= newPoint.top && v.bottom >= newPoint.top && v.left <= newPoint.left && v.right >= newPoint.left;
                    });
                }
                mode ^= (i & 1) ? 2 : 0;
                if (!containsPoint) {
                    b1 = textNode.length;
                }
            }
            newPoint = getAbstractRect(newPoint, mode);
            while (b1 - b0 > 1) {
                var mid = (b1 + b0) >> 1;
                var p = distanceFromCharacter(mid) <= 0;
                b0 = p ? mid : b0;
                b1 = p ? b1 : mid;
            }
            return Math.abs(distanceFromCharacter(b0)) < Math.abs(distanceFromCharacter(b1)) ? b0 : b1;
        }

        point = getAbstractRect(toPlainRect(point.centerX, point.centerY), mode);
        if (inst.softPoint) {
            point.left = point.right = getAbstractRect(inst.softPoint, mode).left;
        }
        if (dirY) {
            var startY = findNearsetPoint(inst.typer.rootNode, textNode, dirY, 2);
            // find if there is a block content before next text line
            var prop = dirY > 0 ? 'bottom' : 'top';
            var iterator = new TyperTreeWalker(inst.typer.rootNode, NODE_ANY_BLOCK);
            iterator.currentNode = container;
            while ((container = next(iterator, dirY))) {
                var containerRect = getAbstractRect(getRect(container.element), mode);
                if (containsOrEquals(container.element, textNode) || containerRect[FLIP_POS[prop]] * dirY <= point[prop] * dirY) {
                    continue;
                }
                if (!newPoint || containerRect[prop] * dirY < startY * dirY) {
                    return caretSetPosition(inst, container.element, 0);
                }
            }
        } else {
            // search backwards from the end if the initial point is beyond the last line
            var inverse = !dirX && point.top > getAbstractRect(getRect(container.element), mode).bottom;
            findNearsetPoint(container, textNode, (dirX || 1) * (mode & 2 ? -1 : 1) * (inverse ? -1 : 1), 1);
        }
        if (newPoint) {
            var beforeSoftBreak = dirX > 0 || lastDist < 0;
            var offset = findOffset(textNode, newPoint, mode, beforeSoftBreak);
            inst.softPoint = dirY ? getAbstractRect(toPlainRect(point.left, getAbstractRect(newPoint, mode).centerY), -mode) : null;
            return caretSetPosition(inst, textNode, offset, beforeSoftBreak);
        }
        return false;
    }

    definePrototype(TyperCaret, {
        getRect: function () {
            var self = caretEnsureState(this);
            if (!self.textNode) {
                var elmRect = getRect(self.element);
                return elmRect.collapse(getAbstractSide(2 | !self.offset, getWritingMode(self.element)));
            }
            return caretRectFromPosition(self.textNode, self.offset, self.beforeSoftBreak, true);
        },
        getRange: function () {
            var self = caretEnsureState(this);
            var node = self.textNode || self.element;
            var offset = self.offset;
            if (node === self.typer.element) {
                // avoid creating range that is outside the content editable area
                return createRange(node, offset ? 0 : -0);
            }
            return createRange(node, offset);
        },
        clone: function () {
            var self = caretEnsureState(this);
            return extend(new TyperCaret(self.typer), self);
        },
        moveTo: function (node, offset) {
            if (is(node, TyperCaret)) {
                caretEnsureState(node);
                return caretSetPositionRaw(this, node.node, node.element, node.textNode, node.offset, node.beforeSoftBreak);
            }
            var range = createRange(node, offset);
            if (range && containsOrEquals(this.typer.element, range.startContainer)) {
                return caretSetPosition(this, range.startContainer, range.startOffset);
            }
            return false;
        },
        moveToPoint: function (x, y) {
            var self = this;
            var node = self.typer.nodeFromPoint(x, y) || self.typer.rootNode;
            return caretMoveToPoint(self, node.element, toPlainRect(x, y));
        },
        moveToText: function (node, offset) {
            if (node.nodeType !== 3) {
                var iterator = new TyperDOMNodeIterator(new TyperTreeWalker(this.typer.getNode(node), NODE_ANY_ALLOWTEXT), 4);
                if (1 / offset > 0) {
                    for (; offset >= 0 && iterator.nextNode(); offset -= iterator.currentNode.length);
                } else {
                    while (iterator.nextNode());
                }
                node = iterator.currentNode;
                offset = node && Math.min(offset + node.length, node.length);
            }
            return !!isText(node) && caretSetPosition(this, node, getOffset(node, offset));
        },
        moveToLineEnd: function (direction) {
            var self = caretEnsureState(this);
            return caretMoveToPoint(self, self.textNode || self.element, self.getRect(), direction, 0);
        },
        moveByLine: function (direction) {
            var self = this;
            return caretMoveToPoint(self, self.textNode || self.element, self.getRect(), 0, direction) || self.moveToLineEnd(direction);
        },
        moveByWord: function (direction) {
            var self = this;
            var node = self.textNode;
            var re = direction < 0 ? /\b(\S*\s+|\S+)$/ : /^(\s+\S*|\S+)\b/;
            var str = '';
            var matched;
            if (node) {
                str = direction < 0 ? node.data.substr(0, self.offset) : node.data.slice(self.offset);
                if ((matched = re.test(str)) && RegExp.$1.length !== str.length) {
                    return self.moveToText(node, self.offset + direction * RegExp.$1.length);
                }
            }
            var iterator = caretTextNodeIterator(self, self.node);
            var lastNode = iterator.currentNode;
            var lastLength = matched && RegExp.$1.length;
            while ((node = next(iterator, direction))) {
                str = direction < 0 ? node.data + str : str + node.data;
                if ((matched = re.test(str)) && RegExp.$1.length !== str.length) {
                    // avoid unnecessarily expanding selection over multiple text nodes or elements
                    if (RegExp.$1.length === lastLength) {
                        return self.moveToText(lastNode, -direction * 0);
                    }
                    return self.moveToText(node, direction * (RegExp.$1.length - (str.length - node.length)));
                }
                lastNode = node;
                lastLength = RegExp.$1.length;
            }
            return !matched || (!node && !lastLength) ? false : self.moveToText(node || lastNode, 0 * -direction);
        },
        moveByCharacter: function (direction) {
            var self = this;
            var mode = getWritingMode(self.element);
            var rect = getAbstractRect(getRect(self), mode);
            var iterator = caretTextNodeIterator(self, null, 5);
            var node = isText(iterator.currentNode);
            var offset = self.offset;
            var overBr = false;
            while (true) {
                if (!node || offset === getOffset(node, 0 * -direction)) {
                    while (!(node = next(iterator, direction)) || !node.length || !isTextNodeRendered(node)) {
                        if (!node) {
                            return false;
                        }
                        if (is(self.typer.getNode(node), NODE_WIDGET | NODE_INLINE_WIDGET) && !containsOrEquals(node, self.element)) {
                            return self.moveToText(node, 0 * direction) || self.moveTo(node, direction < 0);
                        }
                        overBr |= !!isBR(node);
                    }
                    offset = (direction < 0 ? node.length : 0) + ((overBr || !containsOrEquals(self.node.element, node)) && -direction);
                }
                offset += direction;
                if (!RE_SKIP.test(node.data.charAt(offset))) {
                    var newRect = getAbstractRect(caretRectFromPosition(node, offset), mode);
                    if (!rectEquals(rect, newRect)) {
                        return caretSetPosition(self, node, offset, direction > 0 && rect.centerY !== newRect.centerY);
                    }
                }
            }
        }
    });

    each('moveByLine moveByWord moveByCharacter', function (i, v) {
        var fn = TyperCaret.prototype[v];
        TyperCaret.prototype[v] = function (direction) {
            var self = caretEnsureState(this);
            return caretAtomic(self, function () {
                for (var step = direction; step && fn.call(self, direction / Math.abs(direction)); step += step > 0 ? -1 : 1);
                return !direction || step !== direction;
            });
        };
    });

    // disable Mozilla object resizing and inline table editing controls
    if (!zeta.IS_IE) {
        try {
            document.designMode = 'on';
            document.execCommand('enableObjectResizing', false, 'false');
            document.execCommand('enableInlineTableEditing', false, 'false');
        } catch (e) { }
        document.designMode = 'off';
    }

    setInterval(function () {
        var typer = is(dom.getContext(), Typer);
        if (typer && !composingEditor && dom.focused(window)) {
            var selection = typer.getSelection();
            var activeRange = getActiveRange(typer.element);
            if (activeRange && !helper.rangeEquals(activeRange, createRange(selection))) {
                selection.select(activeRange);
                selection.focus();
            }
        }
    }, 100);

})();

// source: src/ui.js
(function () {
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
    var helper = zeta.helper;
    var dom = zeta.dom;
    var any = helper.any;
    var bind = helper.bind;
    var camel = helper.camel;
    var containsOrEquals = helper.containsOrEquals;
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
    var position = helper.position;
    var randomId = helper.randomId;
    var readArgs = helper.readArgs;
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
    var invalidElements;

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
            var copyValue = function (prop) {
                values[prop] = control[prop];
            };
            var state = _(control);
            getOwnPropertyNames(control).forEach(copyValue);
            getOwnPropertyNames(state.options).forEach(copyValue);
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
        var promise = (!currentEvent || currentEvent.type !== 'setValue' || currentEvent.context !== control) && triggerEvent(control, 'setValue', {
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
            var promise = helper.waitAll(promises);
            promise.catch(function () {
                if (focusOnFailed && !any(failed, function (v) {
                    return dom.focused(v);
                })) {
                    failed.sort(helper.comparePosition);
                    dom.focus(failed[0]);
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
            roles[name] = index;
            each(include.roles, function (i, v) {
                roles[i] = (+v) + index;
            });
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
                if (matchWord(e.type, 'focusin focusout')) {
                    control.focusBy = e.source;
                    registerStateChange(control);
                } else if (matchWord(e.type, 'asyncStart asyncEnd')) {
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
        alert: function (message, action, title, data, callback) {
            return openDefaultDialog(this, 'alert', true, message, readArgs([action, title, data, callback]));
        },
        confirm: function (message, action, title, data, callback) {
            return openDefaultDialog(this, 'confirm', true, message, readArgs([action, title, data, callback]));
        },
        prompt: function (message, value, action, title, description, data, callback) {
            return openDefaultDialog(this, 'prompt', value, message, readArgs([action, title, description, data, callback]));
        },
        notify: function (message, kind, timeout, within, data) {
            var iter = readArgs([kind, timeout, within, data]);
            return this.import('dialog.notify').render({
                label: message,
                kind: iter.string() || true,
                timeout: iter.next('number') && iter.value,
                within: iter.next(Node) && iter.value,
                data: iter.next('object') && iter.value
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
        on: function (event, handler) {
            _(this).container.add(this.element, isPlainObject(event) || kv(event, handler));
        },
        watch: function (prop, handler, fireInit) {
            var self = this;
            listenProperty(getPrototypeOf(self), prop);
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
                var iter = readArgs(arr);
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

    function shouldExecuteOnClick(e, role) {
        var dom = _(e.context).dom;
        var elm = dom.bindedNode[Object.keys(dom.binds).indexOf(String(dom.roles[role]))];
        return elm && containsOrEquals(elm, e.target);
    }

    function buttonExecute(e, self) {
        if (e.type !== 'click' || shouldExecuteOnClick(e, 'button')) {
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
        if (e.type !== 'click' || shouldExecuteOnClick(e, 'checkbox')) {
            self.value = !self.value;
            return self.type === 'checkbox' ? self.execute() : e.handled();
        }
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

    function dropdownUpdateChoices(dropdown, choiceObj) {
        var isArray = helper.isArray(choiceObj);
        var choices = [];
        each(choiceObj, function (i, v) {
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
            self.watch('choices', function (cur) {
                dropdownUpdateChoices(self, cur);
            }, true);
        },
        click: function (e, self) {
            menuShowCallout(self);
            e.handled();
        },
        setValue: function (e, self) {
            dropdownUpdateChoices(self, self.choices);
            dropdownSetValue(self, e.newValue);
            e.handled();
        }
    });

    defineControlType('callout', {
        template: '<label class="zeta-callout"><controls of="not parent.alwaysShowCallout && parent.controls where enabled as _enabled && _enabled.length == 1 && _enabled.0.id == id"/><z:button class="hidden:{{[ not alwaysShowCallout ] && controls where enabled length == 1}}"/><z:menu/></label>',
        requireChildControls: true,
        hideCalloutOnExecute: true,
        hideCalloutOnBlur: true,
        alwaysShowCallout: true,
        parseOptions: function (options, iter) {
            options.icon = iter.string();
            options.controls = iter.nextAll(UIControlSpecies);
        },
        click: function (e, self) {
            menuShowCallout(self);
            e.handled();
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
            self.watch('editor', function (editor) {
                self.options = editor.getStaticWidget(PRESET_KEY).options;
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
        },
        validate: function (e, self) {
            if (self.required && !self.editor.extractText()) {
                return reject('required');
            }
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
                if (v.hasRole('buttonlist') && !v.hasRole('menu')) {
                    getButtonList(v);
                } else if (v.hasRole('button') && v.enabled && v.visible) {
                    arr[arr.length] = v;
                }
            });
        }(self));
        var i = arr.indexOf(cur);
        return arr[i < 0 ? 0 : i + dir];
    }

    function menuShowCallout(self, to, dir, within) {
        var callout = self.callout;
        if (self.parent && containsOrEquals(self.element, callout)) {
            setState(callout, 'hidden', false);
            position(callout, self.element, 'right top inset-y');
        } else {
            if (self.calloutParent) {
                dom.snap(callout, self.calloutParent);
            } else if (is(to, Node)) {
                dom.snap(callout, to, dir);
            } else if (to) {
                position(callout, to, dir, within);
            }
            dom.focus(callout);
            if (helper.getState(callout, 'closing')) {
                setState(callout, 'open', false);
                setState(callout, 'closing', false);
            }
            runCSSTransition(callout, 'open');
        }
    }

    function menuHideCallout(self) {
        var callout = self.callout;
        if (self.parent && containsOrEquals(self.element, callout)) {
            setState(callout, 'hidden', true);
        } else {
            runCSSTransition(callout, 'closing', function () {
                removeNode(callout);
            });
        }
        self.activeButton = null;
    }

    defineControlType('menu', {
        template: '<div class="zeta-ui zeta-menu zeta-float"><z:buttonlist/></div>',
        waitForExecution: false,
        parseOptions: parseControlsAndExecute,
        init: function (e, self) {
            var callout = e.target;
            for (var cur = self.parent; cur && cur.hasRole('buttonlist') && !cur.hasRole('menu'); cur = cur.parent);
            if (self.parent && (!cur || cur.hasRole('menu'))) {
                bind(self.element, 'mouseenter', menuShowCallout.bind(null, self));
                bind(self.element, 'mouseleave', menuHideCallout.bind(null, self));
            } else if (!self.parent && callout === self.element) {
                defineHiddenProperty(self.context, 'showMenu', menuShowCallout.bind(null, self));
                defineHiddenProperty(self.context, 'hideMenu', menuHideCallout.bind(null, self));
                defineHiddenProperty(self.context, 'element', callout);
            } else {
                self.calloutParent = callout.parentNode;
                dom.retainFocus(self.element, callout);
                removeNode(callout);
            }
            bind(self.element, 'mousemove', function () {
                self.activeButton = null;
            });
            setState(e.target, 'is-' + self.type, true);
            self.callout = callout;
            self.activeButton = null;
            self.watch('activeButton', function (cur, old) {
                (old || {}).active = false;
                (cur || {}).active = true;
                (cur || self).focus();
            });
            menuHideCallout(self);
        },
        focusin: function (e, self) {
            if (e.source === 'keyboard' && !self.parent) {
                menuShowCallout(self);
                self.activeButton = menuGetNextItem(self, self, 1);
            }
        },
        focusout: function (e, self) {
            self.activeButton = null;
            if (self.hideCalloutOnBlur) {
                menuHideCallout(self);
            }
        },
        keystroke: function (e, self) {
            var cur = self.activeButton;
            var dir = /^(up|down|left|right)Arrow$/.test(e.data) && RegExp.$1[0];
            if (dir === 'l') {
                if (!self.parent) {
                    e.handled();
                } else if (cur) {
                    menuHideCallout(self);
                    e.handled();
                }
            } else if (dir === 'r') {
                menuShowCallout(self);
                self.activeButton = cur || menuGetNextItem(self, self, 1);
                e.handled();
            } else if (dir && (cur || !self.parent || self.calloutParent)) {
                self.activeButton = menuGetNextItem(self, cur, dir === 'u' ? -1 : 1) || cur;
                e.handled();
            }
        },
        childExecuted: function (e, self) {
            self.activeButton = null;
            for (var cur = e.control; cur && cur !== self.parent; cur = cur.parent) {
                if (!cur.hideCalloutOnExecute) {
                    return;
                }
            }
            menuHideCallout(self);
        },
        beforeDestroy: function (e, self) {
            menuHideCallout(self);
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
                dom.focus(element);
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
            runCSSTransition(e.target, 'pop', true);
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
            dialogData: iter.next('object') && iter.value,
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
        data: null,
        exports: 'title description errorMessage data',
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
        data: null,
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

})();

// source: src/canvas.js
(function () {
    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var bind = helper.bind;
    var each = helper.each;
    var extend = helper.extend;
    var getRect = helper.getRect;
    var isFunction = helper.isFunction;
    var matchWord = helper.matchWord;
    var toPlainRect = helper.toPlainRect;

    var container = $('<div style="position:absolute;top:0;left:0;">')[0];
    var root = document.documentElement;
    var handles = new shim.WeakMap();
    var allLayers = {};
    var freeDiv = [];
    var state = {};
    var lastState = {};
    var mousedown = false;
    var inited;
    var activeTyper;
    var activeHandle;
    var hoverNode;
    var oldLayers;
    var newLayers;
    var timeout;

    function TyperCanvas() {
        state.timestamp = activeTyper.getSelection().timestamp;
        state.rect = getRect(activeTyper).translate(root.scrollLeft, root.scrollTop);
        extend(this, {
            typer: activeTyper,
            pointerX: state.x || 0,
            pointerY: state.y || 0,
            mousedown: mousedown,
            hoverNode: hoverNode || null,
            activeHandle: activeHandle || null,
            editorReflow: !lastState.rect || !helper.rectEquals(lastState.rect, state.rect),
            pointerMoved: lastState.x != state.x || lastState.y != state.y,
            selectionChanged: lastState.timestamp !== state.timestamp
        });
        extend(lastState, state);
    }

    function TyperCanvasHandle(cursor, done) {
        this.cursor = cursor || 'pointer';
        this.done = done;
        this.active = false;
    }

    function init() {
        var repl = {
            N: 'typer-visualizer',
            G: 'background',
            S: 'selection',
            X: 'transparent'
        };
        var style = '<style>.has-N{caret-color:X;}.has-N:focus{outline:none;}.has-N::S,.has-N ::S{G:X;}.has-N::-moz-S,.has-N ::-moz-S{G:X;}@keyframes caret{0%{opacity:1;}100%{opacity:0;}}</style>';
        $(document.body).append(style.replace(/\b[A-Z]/g, function (v) {
            return repl[v] || v;
        })).append(container);

        bind(container, 'mousedown', function (e) {
            if (e.buttons & 1) {
                (activeHandle || {}).active = false;
                activeHandle = handles.get(e.target);
                activeHandle.active = true;
                helper.always(zeta.dom.drag(e, activeTyper.element), function () {
                    (activeHandle.done || helper.noop).call(activeHandle);
                    activeHandle.active = false;
                    activeHandle = null;
                    activeTyper.focus();
                    refresh(true);
                });
                e.preventDefault();
            }
        });
        bind(window, 'mousedown mousemove mouseup', function (e) {
            state.x = e.clientX;
            state.y = e.clientY;
            hoverNode = activeTyper && activeTyper.nodeFromPoint(state.x, state.y);
            clearTimeout(timeout);
            if (e.type === 'mousemove') {
                timeout = setTimeout(refresh, 0);
            } else {
                mousedown = e.buttons & 1;
                timeout = setTimeout(refresh, 0, true);
            }
        });
        bind(window, 'scroll resize orientationchange focus', refresh);
    }

    function addLayer(name, callback) {
        allLayers[name] = [callback, [], {}, true];
    }

    function addObject(kind, state, rect, css, handle) {
        for (var i = 0, len = oldLayers.length; i < len; i++) {
            if (oldLayers[i].state === state && oldLayers[i].kind === kind) {
                newLayers[newLayers.length] = oldLayers.splice(i, 1)[0];
                return;
            }
        }
        newLayers[newLayers.length] = {
            kind: kind,
            state: state,
            rect: rect || ('top' in state ? state : getRect),
            css: css,
            handle: handle
        };
    }

    function refresh(force) {
        force = force === true;
        clearTimeout(timeout);
        if (activeTyper && (force || activeTyper.focused())) {
            var canvas = new TyperCanvas();
            if (force || canvas.editorReflow || canvas.selectionChanged || canvas.pointerMoved) {
                each(allLayers, function (i, v) {
                    newLayers = v[1];
                    oldLayers = newLayers.splice(0);
                    if (v[3] !== false) {
                        v[0].call(null, canvas, v[2]);
                    }
                    oldLayers.forEach(function (v) {
                        freeDiv[freeDiv.length] = $(v.dom).detach().removeAttr('style')[0];
                        handles.delete(v.dom);
                    });
                    newLayers.forEach(function (v) {
                        if (force || !v.dom || canvas.editorReflow || isFunction(v.rect)) {
                            var dom = v.dom || (v.dom = $(freeDiv.pop() || document.createElement('div'))[0]);
                            $(dom).appendTo(container).css(extend({
                                position: 'absolute',
                                cursor: (v.handle || '').cursor,
                                pointerEvents: v.handle ? 'all' : 'none'
                            }, v.css, helper.cssFromRect('top' in v.rect ? v.rect : v.rect(v.state), container)));
                            handles.set(dom, v.handle);
                        }
                    });
                });
            }
        }
    }

    function setActive(typer) {
        activeTyper = typer;
        if (typer) {
            helper.setZIndexOver(container, typer.element);
            typer.retainFocus(container);
            refresh(true);
        } else {
            $(container).children().detach();
        }
    }

    helper.definePrototype(TyperCanvas, {
        refresh: function () {
            setTimeout(refresh, 0, true);
        },
        toggleLayer: function (name, visible) {
            var needRefresh = false;
            name.split(' ').forEach(function (v) {
                needRefresh |= visible ^ (allLayers[v] || '')[3];
                (allLayers[v] || {})[3] = visible;
            });
            if (needRefresh) {
                setTimeout(refresh, 0, true);
            }
        },
        fill: function (range, color, handle) {
            var style = {};
            style.background = color || 'rgba(0,31,81,0.2)';
            each(helper.makeArray(range), function (i, v) {
                addObject('f', v, null, style, handle);
            });
        },
        drawCaret: function (caret) {
            addObject('k', caret, null, {
                animation: 'caret 0.5s infinite alternate ease-in',
                outline: '1px solid rgba(0,31,81,0.8)'
            });
        },
        drawBorder: function (element, width, color, lineStyle, inset) {
            var style = {};
            style.border = parseFloat(width) + 'px ' + (lineStyle || 'solid') + ' ' + (color || 'black');
            style.margin = inset ? '0px' : -parseFloat(width) + 'px';
            style.boxSizing = inset ? 'border-box' : 'auto';
            addObject('b', element, null, style);
        },
        drawLine: function (x1, y1, x2, y2, width, color, lineStyle, handle) {
            if (x1.left !== undefined) {
                x1 = x1.collapse(y1);
                return this.drawLine(x1.left, x1.top, x1.right, x1.bottom, x2, y2, width, color);
            }
            var dx = x2 - x1;
            var dy = y2 - y1;
            var style = {};
            style.borderTop = parseFloat(width) + 'px ' + (lineStyle || 'solid') + ' ' + (color || 'black');
            style.transformOrigin = '0% 50%';
            style.transform = 'translateY(-50%) rotate(' + Math.atan2(dy, dx) + 'rad)';
            addObject('l', toPlainRect(x1, y1, x1 + (Math.sqrt(dy * dy + dx * dx)), y1), null, style, handle);
        },
        drawHandle: function (element, pos, size, image, handle) {
            var style = {};
            style.border = '1px solid #999';
            style.background = 'white' + (image ? ' url("' + image + '")' : '');
            size = size || 8;
            addObject('c', element, function () {
                var r = getRect(element);
                var x = matchWord(pos, 'left right') || 'centerX';
                var y = matchWord(pos, 'top bottom') || 'centerY';
                r.left -= size;
                r.top -= size;
                return toPlainRect(r[x], r[y], r[x] + size, r[y] + size);
            }, style, handle);
        }
    });

    addLayer('selection', function (canvas) {
        var selection = canvas.typer.getSelection();
        if (!selection.isCaret) {
            canvas.fill(selection.getRects());
        } else if ('caretColor' in root.style) {
            canvas.drawCaret(selection.baseCaret);
        }
    });

    Editor.widgets.visualizer = {
        init: function (e) {
            $(e.typer.element).addClass('has-typer-visualizer');
            if (!inited) {
                init();
                inited = true;
            }
        },
        focusin: function (e) {
            setActive(e.typer);
        },
        focusout: function (e) {
            setActive(null);
        },
        contentChange: function (e) {
            refresh(true);
        },
        stateChange: function (e) {
            if (!e.typer.enabled()) {
                setActive(null);
            } else if (activeTyper === e.typer) {
                refresh();
            } else if (e.typer.focused()) {
                setActive(e.typer);
            }
        }
    };

    Editor.defaultOptions.visualizer = true;

    extend(Editor, {
        addLayer: addLayer,
        handle: function (cursor, done) {
            return new TyperCanvasHandle(cursor, done);
        }
    });

})();

// source: src/extensions/editor/dragwidget.js
(function () {
    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var getRect = helper.getRect;
    var containsOrEquals = helper.containsOrEquals;
    var closest = Editor.prototype.closest;
    var activeNode;
    var insertPoint;

    var handle = Editor.handle('move', function () {
        if (activeNode && insertPoint) {
            activeNode.typer.invoke(function (tx) {
                tx.selection.select(insertPoint);
                tx.insertHtml(activeNode.element);
            });
        }
    });
    Editor.addLayer('dragWidget', function (canvas) {
        var hoverNode = canvas.hoverNode;
        if (handle.active) {
            var node = closest(hoverNode, Editor.NODE_PARAGRAPH | Editor.NODE_WIDGET);
            insertPoint = null;
            if (node && !containsOrEquals(activeNode, node)) {
                var rectA = getRect(node);
                var rectC = getRect(closest(node, Editor.NODE_EDITABLE));
                var before = canvas.pointerY < rectA.centerY;
                var nextNode = before ? node.previousSibling : node.nextSibling;
                if (nextNode !== activeNode && canvas.typer.widgetAllowed(activeNode.widget.id, node)) {
                    var y;
                    if (nextNode) {
                        var rectB = getRect(nextNode);
                        y = (rectA.bottom <= rectB.top ? rectA.bottom + rectB.top : rectB.bottom + rectA.top) / 2;
                    } else {
                        y = getRect(node, true)[before ? 'top' : 'bottom'];
                    }
                    canvas.drawLine(rectC.left, y, rectC.right, y, 1, 'red', 'dashed');
                    insertPoint = canvas.typer.createCaret(node.element, before);
                }
            }
            canvas.fill(activeNode.element);
        } else if (hoverNode && (!activeNode || containsOrEquals(activeNode, hoverNode) || !helper.pointInRect(canvas.pointerX, canvas.pointerY, getRect(activeNode), 10))) {
            activeNode = closest(hoverNode, Editor.NODE_WIDGET);
        }
        if (activeNode) {
            canvas.drawHandle(activeNode, 'left top', 11, 'data:image/gif;base64,R0lGODlhCwALAKEBAE1PUP///////////yH5BAEKAAIALAAAAAALAAsAAAIUjI8ZoAffDFOzuoexk5zGBUXTlxQAOw==', handle);
        }
    });

})();

// source: src/extensions/editor/formatting.js
(function () {
    var ALIGN_VALUE = {
        justifyLeft: 'left',
        justifyRight: 'right',
        justifyCenter: 'center',
        justifyFull: 'justify'
    };
    var STYLE_TAGNAME = {
        bold: 'b,strong',
        italic: 'i,em',
        underline: 'u',
        strikeThrough: 'strike'
    };
    var STYLE_CHECK = {
        bold: ['fontWeight', 'bold 700'],
        italic: ['fontStyle', 'italic'],
        underline: ['textDecoration', 'underline'],
        strikeThrough: ['textDecoration', 'line-through']
    };
    var LIST_STYLE_TYPE = {
        '1': 'decimal',
        'A': 'upper-alpha',
        'a': 'lower-alpha',
        'I': 'upper-roman',
        'i': 'lower-roman'
    };

    var Typer = zeta.Editor;
    var helper = zeta.helper;
    var dom = zeta.dom;
    var extend = helper.extend;
    var each = helper.each;
    var is = helper.is;
    var removeNode = helper.removeNode;

    var reFormat = /^([a-z\d]*)(?:\.(.+))?/i;
    var reCompatFormat = /^(p|h[1-6])(?:\.(.+))?$/i;

    function outermost(elements) {
        return elements.filter(function (v) {
            return !elements.some(function (w) {
                return w !== v && w.contains(v);
            });
        });
    }

    function getTextAlign(element) {
        var textAlign = $(element).css('text-align');
        var direction = $(element).css('direction');
        switch (textAlign) {
            case '-webkit-left':
            case '-webkit-right':
            case '-webkit-center':
                return textAlign.slice(8);
            case 'start':
                return direction === 'ltr' ? 'left' : 'right';
            case 'end':
                return direction === 'ltr' ? 'right' : 'left';
            default:
                return textAlign;
        }
    }

    function computePropertyValue(elements, property) {
        var value;
        $(elements).each(function (i, v) {
            var my;
            if (property === 'textAlign') {
                my = getTextAlign(v);
            } else if (property === 'inlineClass') {
                my = $(v).attr('class') || '';
            } else {
                my = $(v).css(property);
            }
            value = (value === '' || (value && value !== my)) ? '' : my;
        });
        return value || '';
    }

    function compatibleFormatting(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        return a === b || (reCompatFormat.test(a) && reCompatFormat.test(b));
    }

    function createElementWithClassName(tagName, className) {
        var element = helper.createElement(tagName);
        if (className) {
            element.className = className;
        }
        return element;
    }

    function replaceElement(oldElement, newElement) {
        newElement = is(newElement, Node) || createElementWithClassName(newElement);
        return $(newElement).append(oldElement.childNodes).replaceAll(oldElement)[0];
    }

    function applyInlineStyle(tx, wrapElm, unwrapSpec, currentState, styleCheck) {
        var selection = tx.selection;
        var paragraphs = selection.getParagraphElements();
        var textNodes = selection.getSelectedTextNodes();
        if (selection.isCaret && !currentState) {
            tx.insertHtml(wrapElm);
            wrapElm.appendChild(helper.createTextNode());
            selection.moveToText(wrapElm, -0);
        } else if (textNodes[0]) {
            paragraphs.forEach(function (v) {
                if (!styleCheck || !helper.matchWord(getComputedStyle(v)[styleCheck[0]], styleCheck[1])) {
                    if (!currentState) {
                        $(v).find(textNodes).wrap(wrapElm);
                    } else {
                        var $unwrapNodes = $(textNodes, v).parentsUntil(v).filter(unwrapSpec);
                        var $rewrapNodes = $unwrapNodes.contents().filter(function (i, v) {
                            return textNodes.every(function (w) {
                                return !helper.containsOrEquals(v, w);
                            });
                        });
                        $unwrapNodes.contents().unwrap();
                        $rewrapNodes.wrap(wrapElm);
                    }
                }
            });
            selection.select(textNodes[0], 0, textNodes[textNodes.length - 1], -0);
        }
        $(paragraphs).find(unwrapSpec).filter(':has(' + unwrapSpec + ')').each(function (i, v) {
            $(v).contents().unwrap().filter(function (i, v) {
                return v.nodeType === 3;
            }).wrap(v);
        });
        $(paragraphs).find('span[class=""],span:not([class])').contents().unwrap();
        $(paragraphs).find(unwrapSpec).each(function (i, v) {
            if (helper.sameElementSpec(v.previousSibling, v)) {
                $(v.childNodes).appendTo(v.previousSibling);
                removeNode(v);
            }
        });
    }

    /* ********************************
     * Commands
     * ********************************/

    function justifyCommand(tx) {
        $(tx.selection.getParagraphElements()).attr('align', ALIGN_VALUE[tx.commandName]);
    }

    function inlineStyleCommand(tx) {
        var kind = tx.commandName;
        applyInlineStyle(tx, createElementWithClassName(STYLE_TAGNAME[kind].split(',')[0]), STYLE_TAGNAME[kind], tx.widget[kind], STYLE_CHECK[kind]);
    }

    function listCommand(tx, type) {
        var tagName = tx.commandName === 'insertOrderedList' || type ? 'ol' : 'ul';
        var html = '<' + tagName + (type || '').replace(/^.+/, ' type="$&"') + '>';
        var filter = function (i, v) {
            return is(v, tagName) && ($(v).attr('type') || '') === (type || '');
        };
        var lists = [];
        each(tx.selection.getParagraphElements(), function (i, v) {
            if (!$(v).is('ol>li,ul>li')) {
                var list = $(v).prev().filter(filter)[0] || $(v).next().filter(filter)[0] || $(html).insertAfter(v)[0];
                $(v)[helper.comparePosition(v, list) < 0 ? 'prependTo' : 'appendTo'](list);
                replaceElement(v, 'li');
                lists.push(list);
            } else if (!$(v.parentNode).filter(filter)[0]) {
                replaceElement(v.parentNode, $(html)[0]);
                lists.push(v.parentNode);
            } else if ($(v).is('li') && $.inArray(v.parentNode, lists) < 0) {
                outdentCommand(tx, [v]);
            }
        });
    }

    function indentCommand(tx, elements) {
        elements = $.makeArray(elements || outermost(tx.selection.getParagraphElements()));
        each(elements, function (i, v) {
            var list = $(v).parent('ul,ol')[0] || $(v).prev('ul,ol')[0] || $('<ul>').insertBefore(v)[0];
            var newList = list;
            if (newList === v.parentNode) {
                var prevItem = $(v).prev('li')[0] || $('<li>').insertBefore(v)[0];
                newList = $(prevItem).children('ul,ol')[0] || $(list.cloneNode(false)).appendTo(prevItem)[0];
            }
            $(replaceElement(v, 'li')).appendTo(newList);
            if ($(newList).parent('li')[0]) {
                $(helper.createTextNode('\u00a0')).insertBefore(newList);
            }
            if (!list.children[0]) {
                removeNode(list);
            }
        });
    }

    function outdentCommand(tx, elements) {
        elements = $.makeArray(elements || outermost(tx.selection.getParagraphElements()));
        each(elements, function (i, v) {
            var list = $(v).parent('ul,ol')[0];
            var parentList = $(list).parent('li')[0];
            if ($(v).next('li')[0]) {
                if (parentList) {
                    $(list.cloneNode(false)).append($(v).nextAll()).appendTo(v);
                } else {
                    $(list.cloneNode(false)).append($(v).nextAll()).insertAfter(list);
                    $(v).children('ul,ol').insertAfter(list);
                }
            }
            if (parentList) {
                $(v).insertAfter(parentList);
                if (!helper.trim(tx.typer.extractText(parentList))) {
                    removeNode(parentList);
                }
            } else {
                $(replaceElement(v, 'p')).insertAfter(list);
            }
            if (!list.children[0]) {
                removeNode(list);
            }
        });
    }

    function updateInlineStyle(e) {
        var elements = e.typer.getSelection().getSelectedElements();
        e.widget.inlineClass = computePropertyValue($(elements).filter('span'), 'inlineClass');
        each(STYLE_CHECK, function (i, v) {
            e.widget[i] = !!helper.matchWord(computePropertyValue(elements, v[0]), v[1]);
        });
    }

    function updateFormatting(e) {
        var selection = e.typer.getSelection();
        var element = selection.getParagraphElements().slice(-1)[0];
        if ($(element).is('li')) {
            element = $(element).closest('ol, ul')[0] || element;
        }
        var tagName = element && element.tagName.toLowerCase();
        var tagNameWithClasses = tagName + ($(element).attr('class') || '').replace(/^(.)/, '.$1');
        var textAlign = computePropertyValue(selection.getSelectedElements(), 'textAlign');
        extend(e.widget, {
            justifyLeft: textAlign === 'left',
            justifyCenter: textAlign === 'center',
            justifyRight: textAlign === 'right',
            justifyFull: textAlign === 'justify',
            formatting: tagName,
            formattingWithClassName: tagNameWithClasses
        });
    }

    Typer.widgets.inlineStyle = {
        stateChange: updateInlineStyle,
        contentChange: updateInlineStyle,
        commands: {
            bold: inlineStyleCommand,
            italic: inlineStyleCommand,
            underline: inlineStyleCommand,
            strikeThrough: inlineStyleCommand,
            superscript: inlineStyleCommand,
            subscript: inlineStyleCommand,
            applyClass: function (tx, className) {
                applyInlineStyle(tx, createElementWithClassName('span', className), 'span');
            }
        }
    };

    Typer.widgets.formatting = {
        stateChange: updateFormatting,
        contentChange: updateFormatting,
        commands: {
            justifyCenter: justifyCommand,
            justifyFull: justifyCommand,
            justifyLeft: justifyCommand,
            justifyRight: justifyCommand,
            formatting: function (tx, value) {
                var m = /^([a-z\d]*)(?:\.(.+))?/i.exec(value) || [];
                if (m[1] === 'ol' || m[1] === 'ul') {
                    tx.insertWidget('list', m[1] === 'ol' && '1');
                } else {
                    $(tx.selection.getParagraphElements()).not('li').each(function (i, v) {
                        if (m[1] && !is(v, m[1]) && compatibleFormatting(m[1], v.tagName)) {
                            replaceElement(v, createElementWithClassName(m[1] || 'p', m[2]));
                        } else {
                            v.className = m[2] || '';
                        }
                    });
                }
            },
            insertLine: function (tx) {
                tx.insertText('\n\n');
            },
            insertLineBefore: function (tx) {
                var widget = tx.selection.focusNode.widget;
                if (widget.id !== '__root__') {
                    tx.selection.select(widget.element, true);
                    tx.insertText('\n\n');
                }
            }
        }
    };

    Typer.widgets.lineBreak = {
        shiftEnter: function (e) {
            e.typer.invoke('insertLineBreak');
            e.handled();
        },
        commands: {
            insertLineBreak: function (tx) {
                tx.insertHtml('<br>');
            }
        }
    };

    Typer.widgets.list = {
        element: 'ul,ol',
        editable: 'ul,ol',
        textFlow: true,
        create: listCommand,
        remove: function (tx) {
            outdentCommand(tx, tx.widget.element.children);
        },
        extract: function (e) {
            // ensure the list element (UL/OL) is extracted
            // nothing actually to be done
        },
        receive: function (e) {
            if (helper.sameElementSpec(e.widget.element, e.receivedNode)) {
                e.handled();
                e.typer.invoke(function (tx) {
                    tx.insertHtml(e.receivedNode.childNodes);
                });
            }
        },
        tab: function (e) {
            e.typer.invoke('indent');
            e.handled();
        },
        shiftTab: function (e) {
            e.typer.invoke('outdent');
            e.handled();
        },
        init: function (e) {
            $(e.widget.element).filter('ol').attr('type-css-value', LIST_STYLE_TYPE[$(e.widget.element).attr('type')] || 'decimal');
            if ($(e.widget.element).parent('li')[0] && !e.widget.element.previousSibling) {
                $(helper.createTextNode()).insertBefore(e.widget.element);
            }
        },
        contentChange: function (e) {
            if (!$(e.widget.element).children('li')[0]) {
                e.typer.invoke(function (tx) {
                    removeNode(e.widget.element);
                });
            }
        },
        setup: function (e) {
            e.typer.on('tab', function (e) {
                e.typer.invoke(indentCommand);
                e.handled();
            });
        },
        commands: {
            indent: indentCommand,
            outdent: outdentCommand
        }
    };

    extend(Typer.defaultOptions, {
        lineBreak: true,
        formatting: true,
        inlineStyle: true,
        list: true
    });

    dom.setShortcut({
        bold: 'ctrlB',
        italic: 'ctrlI',
        underline: 'ctrlU',
        justifyLeft: 'ctrlShiftL',
        justifyCenter: 'ctrlShiftE',
        justifyRight: 'ctrlShiftR',
        insertLineBefore: 'ctrlEnter'
    });

    /* ********************************
     * Controls
     * ********************************/

    var ui = new zeta.UI('zeta.editor.formatting', {
        contextChange: function (e, self) {
            each('formatting inlineStyle list', function (i, v) {
                self[v] = self.context.typer.widgetEnabled(v);
            });
        }
    });

    function getSelection(control) {
        return control.context.typer.getSelection();
    }

    function hasParapgraphContext(control) {
        var selection = getSelection(control);
        return !!selection.getParagraphElements()[0];
    }

    function hasInlineContext(control) {
        var selection = getSelection(control);
        return !!is(selection.startNode, Typer.NODE_PARAGRAPH | Typer.NODE_EDITABLE_PARAGRAPH | Typer.NODE_INLINE);
    }

    function simpleCommandButton(command, widgetId) {
        return ui.button(command, ICONS[command], {
            realm: widgetId,
            execute: command,
            enabled: widgetId === 'inlineStyle' ? hasInlineContext : hasParapgraphContext,
            active: function (self) {
                var widget = self.context.typer.getStaticWidget(widgetId);
                return widget && widget[command];
            },
        });
    }

    function orderedListButton(type, description) {
        return ui.button(helper.camel(LIST_STYLE_TYPE[type]), {
            description: description,
            execute: function (self) {
                self.context.typer.invoke(function (tx) {
                    tx.insertWidget('list', type);
                });
            },
            active: function (self) {
                var widget = getSelection(self).getWidget('list');
                return widget && $(widget.element).attr('type') === type;
            }
        });
    }

    var ICONS = {
        bold: '\ue238',          // format_bold
        italic: '\ue23f',        // format_italic
        underline: '\ue249',     // format_underlined
        strikeThrough: '\ue257', // strikethrough_s
        unorderedList: '\ue241', // format_list_bulleted
        orderedList: '\ue242',   // format_list_numbered
        indent: '\ue23e',        // format_indent_increase
        outdent: '\ue23d',       // format_indent_decrease
        justifyLeft: '\ue236',   // format_align_left
        justifyCenter: '\ue234', // format_align_center
        justifyRight: '\ue237',  // format_align_right
        justifyFull: '\ue235'    // format_align_justify
    };

    var inlineStyleClear = ui.buttonlist(ui.button('inlineStyleClear', function (self) {
        self.context.typer.invoke('applyClass', '');
    }), { after: '*' });

    ui.export('zeta.editor.toolbar', ui.buttonset(
        ui.dropdown('paragraph', {
            realm: 'formatting',
            execute: 'formatting',
            visible: function (self) {
                return hasParapgraphContext(self) && self.controls.length > 0;
            },
            contextChange: function (e, self) {
                var selection = getSelection(self);
                var widget = selection.typer.getStaticWidget('formatting');
                var curElm = (selection.startNode === selection.endNode ? selection.startNode : selection.focusNode).element;
                var isClassName = helper.any(self.controls, function (v) {
                    return v.value === widget.formattingWithClassName;
                });
                self.choices = helper.map(self.context.options.formattings, function (v, i) {
                    return !reFormat.test(i) || compatibleFormatting(curElm.tagName, RegExp.$1) ? {
                        value: i,
                        label: v
                    } : null;
                });
                self.value = isClassName ? isClassName.value : widget.formatting;
            }
        }),
        ui.dropdown('inlineStyle', {
            realm: 'inlineStyle',
            execute: 'applyClass',
            init: function (e, self) {
                self.choices = self.context.options.inlineClass;
                self.append(inlineStyleClear);
            },
            visible: function (self) {
                return hasInlineContext(self) && self.controls.length > 1;
            },
            contextChange: function (e, self) {
                var widget = self.context.typer.getStaticWidget('inlineStyle');
                self.value = widget.inlineClass;
            }
        }),
        simpleCommandButton('bold', 'inlineStyle'),
        simpleCommandButton('italic', 'inlineStyle'),
        simpleCommandButton('underline', 'inlineStyle'),
        simpleCommandButton('strikeThrough', 'inlineStyle'),
        ui.button('unorderedList', ICONS.unorderedList, {
            realm: 'list',
            execute: function (self) {
                self.context.typer.invoke(function (tx) {
                    tx.insertWidget('list');
                });
            },
            active: function (self) {
                var widget = getSelection(self).getWidget('list');
                return widget && is(widget.element, 'ul');
            },
            enabled: function (self) {
                return hasParapgraphContext(self) && getSelection(self).widgetAllowed('list');
            }
        }),
        ui.callout('orderedList', ICONS.orderedList,
            ui.buttonlist(
                orderedListButton('1', '1, 2, 3, 4'),
                orderedListButton('a', 'a, b, c, d'),
                orderedListButton('A', 'A, B, C, D'),
                orderedListButton('i', 'i, ii, iii, iv'),
                orderedListButton('I', 'I, II, III, IV')
            ),
            ui.button('clearOrderedList', {
                execute: 'outdent',
                visible: function (self) {
                    return self.parent.active;
                }
            }), {
                realm: 'list',
                active: function (self) {
                    var widget = getSelection(self).getWidget('list');
                    return widget && is(widget.element, 'ol');
                },
                enabled: function (self) {
                    return hasParapgraphContext(self) && getSelection(self).widgetAllowed('list');
                }
            }),
        simpleCommandButton('indent', 'list'),
        simpleCommandButton('outdent', 'list'),
        simpleCommandButton('justifyLeft', 'formatting'),
        simpleCommandButton('justifyCenter', 'formatting'),
        simpleCommandButton('justifyRight', 'formatting'),
        simpleCommandButton('justifyFull', 'formatting'), {
            visible: hasInlineContext
        }
    ));

    ui.i18n('en', {
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underlined',
        strikeThrough: 'Strikethrough',
        unorderedList: 'Bullet list',
        orderedList: 'Numbered list',
        indent: 'Indent',
        outdent: 'Outdent',
        justifyLeft: 'Align left',
        justifyCenter: 'Align center',
        justifyRight: 'Align right',
        justifyFull: 'Align justified',
        paragraph: 'Formatting',
        inlineStyle: 'Text style',
        inlineStyleClear: 'Clear style',
        decimal: 'Decimal numbers',
        lowerAlpha: 'Alphabetically ordered list, lowercase',
        upperAlpha: 'Alphabetically ordered list, uppercase',
        lowerRoman: 'Roman numbers, lowercase',
        upperRoman: 'Roman numbers, uppercase',
        clearOrderedList: 'Remove numbered list',
        format_p: 'Paragraph',
        format_h1: 'Header 1',
        format_h2: 'Header 2',
        format_h3: 'Header 3',
        format_h4: 'Header 4',
        format_h5: 'Header 5',
        format_h6: 'Header 6',
        format_table: 'Table',
        format_td: 'Table cell',
        format_th: 'Table header',
        format_ul: 'Unordered list',
        format_ol: 'Ordered list',
        format_li: 'List item',
        format_blockquote: 'Blockquote'
    });

})();

// source: src/extensions/editor/link.js
(function () {
    function normalizeUrl(url) {
        var anchor = document.createElement('a');
        anchor.href = url || '';
        if (location.protocol === anchor.protocol && location.hostname === anchor.hostname && (location.port === anchor.port || (location.port === '' && anchor.port === (location.protocol === 'https:' ? '443' : '80')))) {
            // for browsers incorrectly report URL components with a relative path
            // the supplied value must be at least an absolute path on the origin
            return anchor.pathname.replace(/^(?!\/)/, '/') + anchor.search + anchor.hash;
        }
        return url;
    }

    zeta.Editor.widgets.link = {
        element: 'a[href]',
        inline: true,
        create: function (tx, value) {
            value = normalizeUrl(value);
            if (tx.selection.focusNode.widget.id === 'link') {
                tx.invoke('setURL', value);
            } else {
                tx.insertHtml($('<a>').text(tx.selection.getSelectedText() || value).attr('href', value)[0]);
            }
        },
        remove: 'keepText',
        setup: function (e) {
            e.typer.on('contentChange', function (e) {
               var keyName = e.sourceKeyName;
               if (keyName === 'enter' || keyName === 'space') {
                    var selection = e.typer.getSelection().clone();
                    selection.moveByCharacter(-1);
                    if (selection.getCaret('start').moveByWord(-1) && selection.focusNode.widget.id !== 'link' && /^([a-z]+:\/\/\S+)|(\S+@\S+\.\S+)/g.test(selection.getSelectedText())) {
                        var link = RegExp.$1 || ('mailto:' + RegExp.$2);
                        e.typer.invoke(function (tx) {
                            var originalSelection = tx.selection.clone();
                            e.typer.snapshot(true);
                            e.typer.select(selection);
                            tx.insertWidget('link', link);
                            e.typer.select(originalSelection);
                        });
                    }
                }
            });
        },
        init: function (e) {
            e.widget.element.style.cursor = 'text';
        },
        ctrlClick: function (e) {
            window.open(e.widget.element.href);
        },
        commands: {
            setURL: function (tx, value) {
                tx.widget.element.href = normalizeUrl(value);
            },
            unlink: function (tx) {
                tx.removeWidget(tx.widget);
            }
        }
    };

    zeta.Editor.defaultOptions.link = true;

    var ui = new zeta.UI('zeta.editor.link', {
        contextChange: function (e, self) {
            var typer = self.context.typer;
            if (typer) {
                var selection = typer.getSelection();
                self.widget = selection.getWidget('link');
                self.widgetAllowed = selection.widgetAllowed('link');
            }
        }
    });

    var dialog = ui.dialog(
        ui.textbox('text', true),
        ui.textbox('href', true),
        ui.checkbox('blank'),
        ui.buttonset(
            ui.button('remove', 'delete', {
                danger: true,
                execute: function (self) {
                    self.parentContext.typer.invoke('unlink');
                    return self.all.dialog.destroy();
                },
                visible: function (self) {
                    return self.parentContext.typer.hasCommand('unlink');
                }
            }),
            ui.submit('ok', 'done'),
            ui.button('cancel', 'close', function (self) {
                return self.all.dialog.destroy();
            })
        )
    );

    function openDialog(self) {
        var typer = self.context.typer;
        var element = (self.state.widget || '').element;
        var currentValue;
        if (element) {
            currentValue = {
                href: element.getAttribute('href'),
                text: element.textContent,
                blank: element.getAttribute('target') === '_blank'
            };
        } else {
            var selectedText = typer.getSelection().getSelectedText();
            currentValue = {
                href: /^[a-z]+:\/\//g.test(selectedText) ? selectedText : '',
                text: selectedText,
                blank: false
            };
        }
        var fn = self.context.options.selectLink;
        var promise;
        if (typeof fn === 'function') {
            promise = fn(currentValue);
        } else {
            promise = dialog.render(currentValue).dialog;
        }
        return promise.then(function (value) {
            if (!value) {
                return null;
            }
            var href = value.href || value;
            var text = value.text || href;
            typer.invoke(function (tx) {
                if (!element) {
                    element = $('<a href="">').text(text)[0];
                    tx.insertHtml(element);
                    tx.selection.select(element, 'contents');
                }
                $(element).text(text);
                $(element).attr('target', value.blank ? '_blank' : null);
                typer.invoke('setURL', href);
            });
        });
    }

    ui.export('zeta.editor.toolbar',
        ui.button('insertLink', 'insert_link', {
            realm: 'widgetAllowed',
            after: 'insertWidgets',
            execute: openDialog,
            active: function (self) {
                return self.state.widget;
            },
            contextChange: function (e, self) {
                self.label = self.state.widget ? 'editLink' : 'insertLink';
            }
        })
    );

    ui.export('zeta.editor.contextmenu', ui.buttonlist(
        ui.button('open', {
            realm: 'widget',
            shortcut: 'ctrlClick',
            execute: function (self) {
                window.open(self.state.widget.element.href);
            }
        }),
        ui.button('editLink', {
            realm: 'widget',
            execute: openDialog
        }),
        ui.button('removeLink', {
            realm: 'widget',
            execute: 'unlink'
        })
    ));

    ui.i18n('en', {
        insertLink: 'Insert hyperlink',
        editLink: 'Edit hyperlink',
        removeLink: 'Remove hyperlink',
        remove: 'Remove',
        text: 'Text',
        href: 'Link URL',
        blank: 'Open in new window',
        open: 'Open hyperlink',
        cancel: 'Cancel',
        ok: 'OK',
    });

})();

// source: src/extensions/editor/media.js
(function () {
    var reMediaType = /\.(?:(jpg|jpeg|png|gif|webp)|(mp4|ogg|webm)|(mp3))(?:\?.*)?$/i;
    var helper = zeta.helper;

    zeta.Editor.widgets.media = {
        element: 'img,audio,video,a:has(>img)',
        text: function (widget) {
            return widget.element.src;
        },
        create: function (tx, options) {
            var element = helper.createElement(reMediaType.test(options.src || options) ? (RegExp.$2 ? 'video' : RegExp.$3 ? 'audio' : 'img') : 'img');
            element.src = options.src || options;
            if (helper.is(element, 'video')) {
                $(element).attr('controls', '');
            }
            tx.insertHtml(element);
        }
    };

    zeta.Editor.defaultOptions.media = true;

    function openDialog(control, callback) {
        var promise;
        var fn = control.context.options.selectMedia;
        if (helper.isFunction(fn)) {
            var mediaType = reMediaType.exec(control.label) && (RegExp.$1 ? 'image' : RegExp.$2 ? 'video' : 'audio');
            promise = fn(mediaType, control.value);
        } else {
            promise = ui.prompt('imageURL', control.value);
        }
        return promise.then(callback);
    }

    function insertMediaButton(type, icon) {
        return ui.button(type, icon, {
            realm: 'widgetAllowed',
            execute: function (self) {
                return openDialog(self, function () {
                    self.context.typer.invoke(function (tx) {
                        tx.insertWidget('media', self.value);
                    });
                });
            }
        });
    }

    var ui = new zeta.UI('zeta.editor.media', {
        contextChange: function (e, self) {
            var selection = self.context.typer.getSelection();
            self.widget = selection.getWidget('media');
            self.widgetAllowed = selection.widgetAllowed('media');
        }
    });

    ui.export('zeta.editor.insertMenu',
        insertMediaButton('image', 'insert_photo'),
        insertMediaButton('video', 'videocam'));

    ui.export('zeta.editor.toolbar', ui.buttonset(
        ui.button('filePicker', {
            realm: 'widget',
            showText: true,
            showIcon: false,
            contextChange: function (e, self) {
                self.value = $(self.state.widget.element).attr('src');
                self.label = (/(?:^|\/)([^/?#]+)(?:\?.+)?$/.exec(self.value) || [])[1] || '';
            },
            execute: function (self) {
                return openDialog(self, function (value) {
                    $(self.state.widget.element).attr('src', value.src || value);
                });
            }
        }),
        ui.textbox('altText', {
            realm: 'widget',
            icon: 'comment',
            contextChange: function (e, self) {
                self.value = $(self.state.widget.element).attr('alt');
            },
            execute: function (self) {
                $(self.state.widget.element).attr('alt', self.value).attr('title', self.value);
            }
        })
    ));

    ui.i18n('en', {
        'insertImage': 'Image',
        'insertVideo': 'Video',
        'altText': 'Alternate text',
        'imageURL': 'Image URL'
    });

})();

// source: src/extensions/editor/stateclass.js
(function () {
    var helper = zeta.helper;

    function toggleClass(widget, className, value) {
        var options = widget.options;
        if (options[className]) {
            helper.setState(helper.is(options.target, Node) || $(widget.typer.element).parents(options.target).addBack()[0], options[className], value);
        }
    }

    zeta.Editor.widgets.stateclass = {
        options: {
            target: null,
            disabled: 'disabled',
            focused: 'focused',
            empty: 'empty'
        },
        focusin: function (e) {
            toggleClass(e.widget, 'focused', true);
        },
        focusout: function (e) {
            toggleClass(e.widget, 'focused', false);
        },
        stateChange: function (e) {
            toggleClass(e.widget, 'disabled', !e.typer.enabled());
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        },
        contentChange: function (e) {
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        },
        init: function (e) {
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        }
    };

})();

// source: src/extensions/editor/table.js
(function () {
    var TD_HTML = '<td></td>';
    var TH_HTML = '<th></th>';
    var TR_HTML = '<tr>%</tr>';
    var TR_SELECTOR = '>tbody>tr';
    var X_ATTR_MODE = 'x-table-copymode';
    var MODE_ROW = 1;
    var MODE_COLUMN = 2;
    var MODE_TABLE = 3;

    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var getRect = helper.getRect;
    var removeNode = helper.removeNode;
    var repeat = helper.repeat;
    var visualRange;

    function CellSelection(widget, minRow, minCol, maxRow, maxCol) {
        var self = this;
        self.widget = widget;
        self.element = widget.element;
        self.minCol = minCol;
        self.minRow = minRow;
        self.maxCol = maxCol;
        self.maxRow = maxRow;
    }

    function getCellSelection(context) {
        var selection = context.typer.getSelection();
        var widget = selection.focusNode.widget;
        if (widget.id === 'table') {
            var $c1 = $(selection.startElement).parentsUntil(widget.element).addBack();
            var $c2 = $(selection.endElement).parentsUntil(widget.element).addBack();
            return new CellSelection(widget, $c1.eq(1).index(), $c1.eq(2).index(), $c2.eq(1).index(), $c2.eq(2).index());
        }
    }

    function getRow(widget, row) {
        return $(TR_SELECTOR, widget.element || widget)[row];
    }

    function getCell(widget, row, col) {
        if (typeof row === 'string') {
            return getCell(widget, Math.min(widget[row + 'Row'], countRows(widget) - 1), Math.min(widget[row + 'Col'], countColumns(widget) - 1));
        }
        return getRow(widget, row).children[col];
    }

    function countRows(widget) {
        return $(TR_SELECTOR, widget.element || widget).length;
    }

    function countColumns(widget) {
        return getRow(widget, 0).childElementCount;
    }

    function hasTableHeader(widget) {
        return !!helper.is(getCell(widget, 0, 0), 'th');
    }

    function tabNextCell(selection, dir, selector) {
        if (selection.isSingleEditable) {
            var nextCell = $(selection.focusNode.element)[dir]()[0] || $(selection.focusNode.element).parent()[dir]().children(selector)[0];
            if (nextCell) {
                selection.moveToText(nextCell, -0);
            }
        }
    }

    function setEditorStyle(widget) {
        $('td,th', widget.element || widget).css({
            outline: '1px dotted rgba(0,0,0,0.3)',
            minWidth: '3em'
        });
    }

    function selectCells(widget, row, col, numRow, numCol) {
        widget.typer.select(new CellSelection(widget, row, col, row + numRow - 1, col + numCol - 1));
    }

    function insertColumn(widget, index, count, before) {
        var s = typeof index === 'string' ? index + '-child' : 'nth-child(' + (index + 1) + ')';
        var m = before ? 'before' : 'after';
        $(widget.element || widget).find(TR_SELECTOR + '>th:' + s)[m](repeat(TH_HTML, count));
        $(widget.element || widget).find(TR_SELECTOR + '>td:' + s)[m](repeat(TD_HTML, count));
        setEditorStyle(widget);
    }

    function insertRow(widget, index, count, before, kind) {
        $(getRow(widget, index === 'last' ? countRows(widget) - 1 : index))[before ? 'before' : 'after'](repeat(TR_HTML.replace('%', repeat(kind || TD_HTML, countColumns(widget))), count));
        setEditorStyle(widget);
    }

    function toggleHeader(widget, value) {
        var hasHeader = hasTableHeader(widget);
        if (hasHeader && !value) {
            $('>th', getRow(widget, 0)).wrapInner('<p>').each(function (i, v) {
                $(v).replaceWith($(TD_HTML).append(v.childNodes));
            });
            setEditorStyle(widget);
        } else if (!hasHeader && (value || value === undefined)) {
            insertRow(widget, 0, 1, true, TH_HTML);
        }
    }

    CellSelection.prototype = {
        get numCol() {
            return Math.abs(this.maxCol - this.minCol) + 1;
        },
        get numRow() {
            return Math.abs(this.maxRow - this.minRow) + 1;
        },
        get mode() {
            return (this.numCol === countColumns(this)) + (this.numRow === countRows(this)) * 2;
        },
        rows: function (callback) {
            $(TR_SELECTOR, this.element).splice(this.minRow, this.numRow).forEach(callback);
        },
        cells: function (callback) {
            var self = this;
            self.rows(function (v, i) {
                $(v.children).splice(self.minCol, self.numCol).forEach(function (v, j) {
                    callback(v, i, j);
                });
            });
        },
        getRange: function () {
            return helper.createRange(getCell(this, 'min'), 0, getCell(this, 'max'), -0);
        },
        getRects: function () {
            var c1 = getCell(this, 'min');
            var c2 = getCell(this, 'max');
            return [helper.mergeRect(getRect(c1), getRect(c2))];
        },
        acceptNode: function (node) {
            var result = false;
            if (node.element === this.element) {
                return 1;
            }
            this.cells(function (v) {
                result |= helper.containsOrEquals(v, node.element);
            });
            return result || 2;
        },
        remove: function (mode) {
            var self = this;
            if (mode === MODE_ROW) {
                self.rows(removeNode);
            } else if (mode === MODE_COLUMN) {
                self.cells(removeNode);
            }
            self.widget.typer.select(getCell(self, 'min'), -0);
        }
    };

    Editor.widgets.table = {
        element: 'table',
        editable: 'th,td',
        create: function (tx, options) {
            options = options || {};
            tx.insertHtml('<table>' + repeat(TR_HTML.replace('%', repeat(TD_HTML, options.columns || 2)), options.rows || 2) + '</table>');
        },
        init: function (e) {
            $(e.widget.element).removeAttr(X_ATTR_MODE);
            setEditorStyle(e.widget);
        },
        extract: function (e) {
            var src = e.widget.element;
            var dst = e.extractedNode;
            if (visualRange && visualRange.widget === e.widget) {
                var mode = visualRange.mode;
                if (mode === MODE_ROW || mode === MODE_COLUMN) {
                    $(dst).attr(X_ATTR_MODE, mode);
                    if (e.source === 'paste' || e.source === 'cut') {
                        visualRange.remove(mode);
                    }
                }
            } else if (countRows(dst) > 1) {
                var count = countColumns(src);
                $(TR_SELECTOR, dst).each(function (i, v) {
                    if (v.childElementCount < count) {
                        $(repeat($('>th', v)[0] ? TH_HTML : TD_HTML, count - v.childElementCount))[i ? 'appendTo' : 'prependTo'](v);
                    }
                });
            }
        },
        receive: function (e) {
            var mode = +$(e.receivedNode).attr(X_ATTR_MODE);
            if (!mode && e.source !== 'paste') {
                return;
            }

            var selection = e.typer.getSelection();
            var info = visualRange && visualRange.widget === e.widget ? visualRange : getCellSelection(selection);
            var src = e.widget.element;
            var dst = e.receivedNode;
            var hasHeader = hasTableHeader(src);
            toggleHeader(dst, mode === MODE_ROW ? false : mode === MODE_COLUMN ? hasHeader : info.minRow === 0 && hasHeader);

            var dstRows = countRows(dst);
            var dstCols = countColumns(dst);
            var srcRows = countRows(src);
            var srcCols = countColumns(src);
            var insertAfter = mode === MODE_ROW ? info.minRow === srcRows : info.minCol === srcCols;

            if (mode === MODE_COLUMN) {
                insertRow(dstRows > srcRows ? src : dst, 'last', Math.abs(dstRows - srcRows), false);
                $(TR_SELECTOR, dst).each(function (i, v) {
                    $(v.children)[insertAfter ? 'insertAfter' : 'insertBefore'](getCell(src, i, info.minCol - insertAfter));
                });
                selectCells(e.widget, 0, info.minCol, countRows(src), dstCols);
            } else if (mode === MODE_ROW) {
                if (info.minRow === 0 && hasHeader) {
                    info.minRow++;
                }
                insertColumn(dstCols > srcCols ? src : dst, 'last', Math.abs(dstCols - srcCols), false);
                $(TR_SELECTOR, dst)[insertAfter ? 'insertAfter' : 'insertBefore'](getRow(src, info.minRow - insertAfter));
                selectCells(e.widget, info.minRow, 0, dstRows, countColumns(src));
            } else {
                if (info.numRow === 1 && info.numCol === 1) {
                    info.maxCol = info.minCol + dstCols - 1;
                    info.maxRow = info.minRow + dstRows - 1;
                    if (info.maxRow > srcRows - 1) {
                        insertRow(src, 'last', info.maxRow - srcRows + 1, false);
                    }
                    if (info.maxCol > srcCols - 1) {
                        insertColumn(src, 'last', info.maxCol - srcCols + 1, false);
                    }
                }
                info.cells(function (v, i, j) {
                    $(v).replaceWith(getCell(dst, i % dstRows, j % dstCols).cloneNode(true));
                });
                selection.select(info);
            }
            setEditorStyle(src);
            e.handled();
        },
        tab: function (e) {
            tabNextCell(e.typer.getSelection(), 'next', ':first-child');
            e.handled();
        },
        shiftTab: function (e) {
            tabNextCell(e.typer.getSelection(), 'prev', ':last-child');
            e.handled();
        },
        keystroke: function (e) {
            if (visualRange && visualRange.widget === e.widget && (e.data === 'backspace' || e.data === 'delete')) {
                var mode = visualRange.mode;
                if (mode === MODE_ROW || mode === MODE_COLUMN) {
                    visualRange.remove(mode);
                    e.handled();
                }
            }
        },
        commands: {
            addColumnBefore: function (tx) {
                var info = getCellSelection(tx);
                insertColumn(tx.widget, info.minCol, info.numCol, true);
            },
            addColumnAfter: function (tx) {
                var info = getCellSelection(tx);
                insertColumn(tx.widget, info.maxCol, info.numCol, false);
            },
            addRowAbove: function (tx) {
                var info = getCellSelection(tx);
                insertRow(tx.widget, info.minRow, info.numRow, true);
            },
            addRowBelow: function (tx) {
                var info = getCellSelection(tx);
                insertRow(tx.widget, info.maxRow, info.numRow, false);
            },
            removeColumn: function (tx) {
                var info = getCellSelection(tx);
                info.remove(MODE_COLUMN);
            },
            removeRow: function (tx) {
                var info = getCellSelection(tx);
                info.remove(MODE_ROW);
            },
            toggleTableHeader: function (tx) {
                toggleHeader(tx.widget);
                $('>th', getRow(tx.widget, 0)).text(function (i, v) {
                    return v || 'Column ' + (i + 1);
                });
            }
        }
    };

    zeta.UI.define('tableGrid', {
        template: '<div class="zeta-grid"><div class="zeta-grid-wrapper">' + repeat('<div class="zeta-grid-row">' + repeat('<div class="zeta-grid-cell"></div>', 7) + '</div>', 7) + '</div><z:label show-icon="false"/></div>',
        label: '{{rows or 0}} \u00d7 {{columns or 0}}',
        rows: 0,
        columns: 0,
        init: function (e, self) {
            var $cells = $('.zeta-grid-cell', self.element);
            $cells.mouseover(function () {
                var i = $cells.index(this);
                var c = i % 7 + 1;
                var r = (i - c + 1) / 7 + 1;
                $cells.each(function (i, v) {
                    $(v).toggleClass('active', i % 7 < c && i / 7 < r);
                });
                self.rows = r;
                self.columns = c;
            });
        },
        click: function (e, self) {
            return self.execute();
        }
    });

    var ui = new zeta.UI('zeta.editor.table', {
        contextChange: function (e, self) {
            var selection = self.context.typer.getSelection();
            self.widget = selection.getWidget('table');
            self.widgetAllowed = selection.widgetAllowed('table');
        }
    });
    ui.export('zeta.editor.insertMenu',
        ui.callout('insertTable', 'table_chart',
            ui.tableGrid({
                realm: 'widgetAllowed',
                execute: function (self) {
                    self.context.typer.invoke(function (tx) {
                        tx.insertWidget('table', self);
                    });
                }
            })
        )
    );
    ui.export('zeta.editor.contextmenu',
        ui.callout('modifyTable',
            ui.checkbox('showHeader', {
                realm: 'widget',
                execute: 'toggleTableHeader',
                contextChange: function (e, self) {
                    self.value = hasTableHeader(self.state.widget);
                }
            }),
            ui.dropdown('style', {
                realm: 'widget',
                valueAsLabel: false,
                init: function (e, self) {
                    self.choices = self.context.options.tableStyles;
                    self.append(ui.button('styleDefault', { after: '*' }));
                },
                execute: function (self) {
                    self.state.widget.element.className = self.value || '';
                },
                contextChange: function (e, self) {
                    self.value = self.state.widget.element.className || '';
                }
            }),
            ui.dropdown('tableWidth', {
                realm: 'widget',
                valueAsLabel: false,
                choices: {
                    '': 'fitContent',
                    '100%': 'fullWidth'
                },
                execute: function (self) {
                    $(self.state.widget.element).attr('width', self.value || null);
                },
                contextChange: function (e, self) {
                    self.value = $(self.state.widget.element).attr('width') || '';
                }
            }),
            ui.buttonlist('addRemoveCell',
                ui.button('addColumnBefore', {
                    realm: 'widget',
                    execute: 'addColumnBefore'
                }),
                ui.button('addColumnAfter', {
                    realm: 'widget',
                    execute: 'addColumnAfter'
                }),
                ui.button('addRowAbove', {
                    realm: 'widget',
                    execute: 'addRowAbove',
                    enabled: function (self) {
                        return !hasTableHeader(self.state.widget) || getCellSelection(self.context).minRow > 0;
                    }
                }),
                ui.button('addRowBelow', {
                    realm: 'widget',
                    execute: 'addRowBelow'
                }),
                ui.button('removeColumn', {
                    realm: 'widget',
                    execute: 'removeColumn'
                }),
                ui.button('removeRow', {
                    realm: 'widget',
                    execute: 'removeRow'
                })
            ), {
                hiddenWhenDisabled: true
            }
        )
    );

    ui.i18n('en', {
        insertTable: 'Table',
        modifyTable: 'Modify table',
        showHeader: 'Show header',
        style: 'Table style',
        styleDefault: 'Default',
        addColumnBefore: 'Add column before',
        addColumnAfter: 'Add column after',
        addRowAbove: 'Add row above',
        addRowBelow: 'Add row below',
        removeColumn: 'Remove column',
        removeRow: 'Remove row',
        tableWidth: 'Table width',
        fitContent: 'Fit to content',
        fullWidth: 'Full width'
    });

    var selectHandleX = Editor.handle('cell');
    var selectHandleY = Editor.handle('cell');
    var addHandle = Editor.handle('pointer', function () {
        (addHandleState.isColumn ? insertColumn : insertRow)(addHandleState.widget, addHandleState.index, 1, false);
    });
    var addHandleState;
    var updateOnMouseup;

    function findNearsetEdge(widget, isColumn, pos) {
        var arr = $(isColumn ? TR_SELECTOR + ':first>*' : TR_SELECTOR, widget.element);
        for (var i = arr.length - 1; i >= 0; i--) {
            var r = getRect(arr[i])[isColumn ? 'right' : 'bottom'];
            if (Math.abs(r - pos) < 5) {
                return {
                    widget: widget,
                    isColumn: isColumn,
                    index: i,
                    pos: r
                };
            }
        }
    }

    function updateVisualRange(widget, isColumn, pos) {
        var arr = $(isColumn ? TR_SELECTOR + ':first>*' : TR_SELECTOR, widget.element);
        for (var i = arr.length - 1; i >= 1 && getRect(arr[i])[isColumn ? 'left' : 'top'] > pos; i--);
        if (!updateOnMouseup) {
            visualRange = new CellSelection(widget, 0, 0, countRows(widget) - 1, countColumns(widget) - 1);
            visualRange[isColumn ? 'minCol' : 'minRow'] = i;
        }
        visualRange[isColumn ? 'maxCol' : 'maxRow'] = i;
        updateOnMouseup = true;
    }

    Editor.addLayer('table', function (canvas) {
        var widget = canvas.hoverNode && canvas.hoverNode.widget;
        if (widget && widget.id === 'table') {
            var rect = getRect(widget);
            if (!canvas.mousedown || addHandle.active) {
                addHandleState = findNearsetEdge(widget, true, canvas.pointerX) || findNearsetEdge(widget, false, canvas.pointerY);
                if (addHandleState) {
                    var prop = addHandleState.isColumn ? 'left' : 'top';
                    canvas.drawLine(rect.collapse(prop, addHandleState.pos - rect[prop]), prop, 5, 'transparent', 'solid', addHandle);
                }
            }
            canvas.drawLine(rect, 'top', 10, 'transparent', 'solid', selectHandleX);
            canvas.drawLine(rect, 'left', 10, 'transparent', 'solid', selectHandleY);
        }

        if (selectHandleX.active) {
            updateVisualRange(updateOnMouseup ? visualRange : widget, true, canvas.pointerX);
        } else if (selectHandleY.active) {
            updateVisualRange(updateOnMouseup ? visualRange : widget, false, canvas.pointerY);
        } else if (canvas.selectionChanged) {
            visualRange = getCellSelection(canvas);
            if (!visualRange || (visualRange.numRow === 1 && visualRange.numCol === 1)) {
                visualRange = null;
                updateOnMouseup = false;
            } else {
                updateOnMouseup = true;
            }
        }
        if (updateOnMouseup && !canvas.mousedown) {
            updateOnMouseup = false;
            if (visualRange.mode === MODE_TABLE) {
                canvas.typer.select(visualRange.element);
                visualRange = null;
            } else {
                selectCells(visualRange.widget, Math.min(visualRange.minRow, visualRange.maxRow), Math.min(visualRange.minCol, visualRange.maxCol), visualRange.numRow, visualRange.numCol);
            }
        }

        canvas.toggleLayer('selection', !updateOnMouseup);
        if (updateOnMouseup) {
            canvas.fill(visualRange.getRects());
        }
    });

})();

// source: src/extensions/editor/toolbar.js
(function () {
    var helper = zeta.helper;
    var toolbar;
    var contextmenu;
    var activeToolbar;
    var canAccessClipboard;

    function detectClipboardInaccessible(callback) {
        if (canAccessClipboard === false) {
            callback();
        } else if (!canAccessClipboard) {
            var unbind = helper.bind(document, 'paste', function () {
                canAccessClipboard = true;
            });
            setTimeout(function () {
                unbind();
                if (!canAccessClipboard) {
                    canAccessClipboard = false;
                    callback();
                }
            });
        }
    }

    function positionToolbar(toolbar) {
        var height = $(toolbar.element).height();
        var rect = helper.getRect(toolbar.widget || toolbar.typer);
        if (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0) {
            // invisible element or IE bug related - https://connect.microsoft.com/IE/feedback/details/881970
            return;
        }
        var position = {
            position: 'fixed',
            left: rect.left,
            top: Math.max(0, rect.top - height - 10)
        };
        var r = toolbar.typer.getSelection().extendCaret.getRect();
        if (r.top >= position.top && r.top <= position.top + height) {
            position.top = r.bottom + 10;
        }
        $(toolbar.element).css(position);
    }

    function showToolbar(toolbar) {
        if (activeToolbar !== toolbar) {
            hideToolbar();
            activeToolbar = toolbar;
            $(toolbar.element).appendTo(document.body);
            helper.setZIndexOver(toolbar.element, toolbar.typer.element);
        }
        positionToolbar(toolbar);
    }

    function hideToolbar(toolbar) {
        if (activeToolbar && (toolbar || activeToolbar) === activeToolbar) {
            $(activeToolbar.element).detach();
            activeToolbar.position = '';
            activeToolbar = null;
        }
    }

    function createToolbar(typer, options, type) {
        var container = document.createElement('div');
        var context = type.render(container, {
            typer: typer,
            options: options
        });
        if (!context.element) {
            context.element = container;
        }
        typer.retainFocus(context.element);
        if (options.container && type !== contextmenu) {
            $(container).appendTo(options.container);
        } else {
            $(container).addClass('zeta-float');
        }
        return context;
    }

    zeta.Editor.widgets.toolbar = {
        options: {
            container: '',
            formattings: {
                p: 'Paragraph',
                h1: 'Heading 1',
                h2: 'Heading 2',
                h3: 'Heading 3',
                h4: 'Heading 4'
            },
            inlineClasses: {}
        },
        init: function (e) {
            e.widget.toolbar = createToolbar(e.typer, e.widget.options, toolbar);
        },
        focusin: function (e) {
            var toolbar = e.widget.toolbar;
            toolbar.update();
            if (!toolbar.options.container) {
                showToolbar(toolbar);
            }
        },
        focusout: function (e) {
            hideToolbar(e.widget.toolbar);
        },
        rightClick: function (e) {
            var toolbar = e.widget.contextmenu || (e.widget.contextmenu = createToolbar(e.typer, e.widget.options, contextmenu));
            setTimeout(function () {
                // fix IE11 rendering issue when mousedown on contextmenu
                // without moving focus beforehand
                zeta.dom.focus(toolbar.element);
                toolbar.update();
                toolbar.showMenu({
                    x: e.clientX,
                    y: e.clientY
                });
            });
            e.preventDefault();
        },
        stateChange: function (e) {
            var toolbar = e.widget.toolbar;
            setTimeout(function () {
                toolbar.update();
            });
            if (activeToolbar === toolbar) {
                if (e.typer.enabled()) {
                    positionToolbar(toolbar);
                } else {
                    hideToolbar(toolbar);
                }
            }
        }
    };

    helper.bind(window, 'scroll', function () {
        if (activeToolbar) {
            positionToolbar(activeToolbar);
        }
    });

    /* ********************************
     * Built-in Controls
     * ********************************/

    var ui = new zeta.UI('zeta.editor');

    function childExecuted(e, self) {
        if (e.source === 'mouse') {
            self.context.typer.focus();
        }
    }

    toolbar = ui.buttonset(
        ui.callout('insertWidgets', 'widgets', ui.import('zeta.editor.insertMenu')),
        ui.import('zeta.editor.toolbar'), {
            showText: false,
            childExecuted: childExecuted
        });

    contextmenu = ui.menu(
        ui.buttonlist(
            ui.button('undo', '\ue166', {
                execute: 'undo',
                enabled: function (self) {
                    return self.context.typer.canUndo();
                }
            }),
            ui.button('redo', '\ue15a', {
                execute: 'redo',
                enabled: function (self) {
                    return self.context.typer.canRedo();
                }
            }), {
                hiddenWhenDisabled: false
            }
        ),
        ui.buttonlist(
            ui.button('selectAll', 'select_all', {
                execute: 'selectAll'
            }),
            ui.button('selectParagraph', {
                hiddenWhenDisabled: true,
                execute: function (self) {
                    var selection = self.context.typer.getSelection();
                    selection.select(selection.startNode.element, 'contents');
                    selection.focus();
                },
                enabled: function (self) {
                    return self.context.typer.getSelection().isCaret;
                }
            })
        ),
        ui.buttonlist(
            ui.button('cut', 'content_cut', {
                shortcut: 'ctrlX',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('cut');
                }
            }),
            ui.button('copy', 'content_copy', {
                shortcut: 'ctrlC',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('copy');
                }
            }),
            ui.button('paste', 'content_paste', {
                shortcut: 'ctrlV',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('paste');
                    detectClipboardInaccessible(function () {
                        ui.alert('clipboardError');
                    });
                }
            })
        ),
        ui.import('zeta.editor.contextmenu'), {
            childExecuted: childExecuted
        }
    );

    ui.i18n('en', {
        undo: 'Undo',
        redo: 'Redo',
        cut: 'Cut',
        copy: 'Copy',
        paste: 'Paste',
        selectAll: 'Select all',
        selectParagraph: 'Select paragraph',
        insertWidgets: 'Insert',
        clipboardError: 'Unable to access clipboard due to browser security. Please use Ctrl+V or [Paste] from browser\'s menu.',
    });

})();

// source: src/extensions/editor/validation.js
(function () {
    function filter(value, options, currentLength) {
        if (options.invalidCharsRegex) {
            value = value.replace(options.invalidCharsRegex, '');
        }
        if (options.maxlength) {
            value = value.substr(0, options.maxlength - currentLength);
        }
        return value;
    }

    zeta.Editor.widgets.validation = {
        options: {
            invalidChars: '',
            allowChars: '',
            maxlength: 0
        },
        init: function (e) {
            var options = e.widget.options;
            if (options.invalidChars) {
                options.invalidCharsRegex = new RegExp('[' + options.invalidChars.replace(/[\[\]\\^]/g, '\\$&') + ']', 'g');
            }
            if (options.allowChars) {
                options.invalidCharsRegex = new RegExp('[^' + options.allowChars.replace(/[\[\]\\^]/g, '\\$&') + ']', 'g');
            }
        },
        contentChange: function (e) {
            if (e.source === 'script') {
                var value = e.typer.extractText();
                var filteredText = filter(value, e.widget.options, 0);
                if (filteredText !== value) {
                    e.typer.setValue(filteredText);
                }
            }
        },
        textInput: function (e) {
            var filteredText = filter(e.data, e.widget.options, e.typer.extractText().length - e.typer.getSelection().getSelectedText().length);
            if (filteredText !== e.data) {
                e.handled();
                if (filteredText) {
                    e.typer.invoke(function (tx) {
                        tx.insertText(filteredText);
                    });
                }
            }
        }
    };

})();

// source: src/extensions/effects/material.js
(function () {
    var helper = zeta.helper;

    function createRipple(elm, x, y, until) {
        var rect = helper.getRect(elm);
        var p1 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.left, 2);
        var p2 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.right, 2);
        var p3 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.left, 2);
        var p4 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.right, 2);
        var scalePercent = 0.5 + 2 * Math.sqrt(Math.max(p1, p2, p3, p4)) / parseFloat($.css(elm, 'font-size'));

        var $overlay = $('<div class="zeta-clickeffect"><i></i></div>').appendTo(elm);
        var $anim = $overlay.children().css({
            top: y - rect.top,
            left: x - rect.left,
        });
        setTimeout(function () {
            $anim.css('transform', $anim.css('transform') + ' scale(' + scalePercent + ')').addClass('animate-in');
        });
        $overlay.css('border-radius', $.css(elm, 'border-radius'));
        helper.always(until, function () {
            helper.runCSSTransition($overlay.children()[0], 'animate-out', function () {
                $overlay.remove();
            });
        });
    }

    helper.bind(window, zeta.IS_TOUCH ? 'touchstart' : 'mousedown', function (e) {
        var p = (e.touches || [e])[0];
        for (var elm = e.target; elm; elm = elm.parentNode) {
            if (helper.is(elm, '.zeta-ui button, .zeta-ui .has-clickeffect')) {
                createRipple(elm, p.clientX, p.clientY, zeta.dom.drag(e));
                return;
            }
        }
    });

})();

// source: src/extensions/ui/datepicker.js
(function () {
    var MONTH_STR = 'January February March April May June July August September October November December'.split(' ');
    var WEEKDAYS_STR = 'Su Mo Tu We Th Fr Sa'.split(' ');
    var MS_PER_DAY = 86400000;
    var TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;
    var INPUT_TYPES = {
        datetime: 'datetime-local',
        day: 'date',
        week: 'week',
        month: 'month'
    };

    var helper = zeta.helper;
    var dom = zeta.dom;
    var repeat = helper.repeat;

    var ui = new zeta.UI('zeta.ui.datepicker');
    var controls;
    var activeTyper;
    var callout;

    function range(count, callback) {
        var arr = [];
        for (var i = 0; i < count; i++) {
            arr[i] = callback(i);
        }
        return arr;
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
                return new Date(+date + 60000 * ((((d > 0 ? step : 0) - (getMinutes(date) % step)) || (step * d)) + (step * (dir - d))));
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
                return MONTH_STR[getMonth(date)] + ' ' + getFullYear(date);
            case 'week':
                var end = stepDate('day', date, 6);
                return MONTH_STR[getMonth(date)] + ' ' + getDate(date) + ' - ' + (getMonth(end) !== getMonth(date) ? MONTH_STR[getMonth(end)] + ' ' : '') + getDate(end) + ', ' + getFullYear(date);
        }
        var monthPart = MONTH_STR[getMonth(date)] + ' ' + getDate(date) + ', ' + getFullYear(date);
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
        var all = ui.all(self);
        var firstDay = currentMonth.getDay();
        var $buttons = $('td', self.element).removeClass('selected disabled');

        if (!self.currentMonth || !sameMonth(currentMonth, self.currentMonth)) {
            var numDays = new Date(y, m + 1, 0).getDate();
            var numDaysLast = new Date(y, m, 0).getDate();
            $buttons.removeClass('prev cur next today');
            $buttons.each(function (i, v) {
                if (i < firstDay) {
                    $(v).children().text(i + 1 - firstDay + numDaysLast).end().addClass('prev');
                } else if (i >= numDays + firstDay) {
                    $(v).children().text(i + 1 - firstDay - numDays).end().addClass('next');
                } else {
                    $(v).children().text(i + 1 - firstDay).end().addClass('cur');
                }
            });
            var today = new Date();
            if (sameMonth(currentMonth, today)) {
                $buttons.eq(getDate(today) + firstDay - 1).addClass('today');
            }
            $('tr:last', self.element).toggle(firstDay + numDays > 35);

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
        if (selected || (self.mode === 'week' && sameMonth(currentMonth, stepDate('day', self.value, 6)))) {
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
        $(self.element).toggleClass('select-range', self.mode !== 'day');
    }

    function initInternalControls() {
        var dropdownOptions = {
            template: '<z:callout label="{{selectedText}}" show-text="true"/>'
        };
        var monthChoices = new shim.Map();
        range(12, function (v) {
            monthChoices.set(v, MONTH_STR[v].toLowerCase());
        });
        controls = {
            year: ui.dropdown('year', function (self) {
                return showMonth(self.parent, new Date(self.value, getMonth(self.parent.currentMonth)));
            }, dropdownOptions),
            month: ui.dropdown('month', monthChoices, function (self) {
                return showMonth(self.parent, new Date(getFullYear(self.parent.currentMonth), self.value));
            }, dropdownOptions),
            prev: ui.button('prevMonth', '\ue314', function (self) {
                return showMonth(self.parent, -1);
            }),
            setToday: ui.button('setToday', '\ue8df', function (self) {
                return self.parent.execute(new Date());
            }),
            next: ui.button('nextMonth', '\ue315', function (self) {
                return showMonth(self.parent, 1);
            }),
            hour: ui.number('hour', {
                options: {
                    min: 0,
                    max: 23,
                    loop: true
                },
                execute: function (self) {
                    self.parent.execute(makeTime(self.value, self.all.minute.value));
                }
            }),
            timeSeperator: ui.label('timeSeperator'),
            minute: ui.number('minute', {
                options: {
                    min: 0,
                    max: 59,
                    digits: 'fixed',
                    loop: true
                },
                execute: function (self) {
                    self.parent.execute(makeTime(self.all.hour.value, self.value));
                }
            }),
            meridiem: ui.button('meridiem', {
                value: false,
                label: 'am',
                showText: true,
                propertyChange: function (e, self) {
                    self.label = self.value ? 'pm' : 'am';
                },
                execute: function (self) {
                    self.value = !self.value;
                    self.parent.execute(makeTime(self.all.hour.value % 12 + (self.value ? 12 : 0), self.all.minute.value));
                }
            })
        };
    }

    function initDatepickerCallout() {
        var executed = function (e, self) {
            var date = new Date(+self.all.calendar.value);
            date.setHours(getHours(self.all.clock.value), getMinutes(self.all.clock.value));
            activeTyper.setValue(date);
        };
        var calender = ui.calendar({
            executed: executed,
            contextChange: function (e, self) {
                self.min = callout.min;
                self.max = callout.max;
                self.mode = callout.mode === 'datetime' ? 'day' : callout.mode;
            }
        });
        var clock = ui.clock({
            hiddenWhenDisabled: true,
            executed: executed,
            contextChange: function (e, self) {
                self.step = callout.minuteStep;
                self.enabled = callout.mode === 'datetime';
            }
        });
        var okButton = ui.submit('done', 'done', {
            execute: function (self) {
                callout.hideMenu();
            }
        });
        callout = ui.menu(
            ui.buttonset(calender, clock),
            ui.generic({
                controls: [ui.buttonset(okButton)],
                template: '<z:generic><controls layout="dialog"/></z:generic>'
            }), {
            hideCalloutOnBlur: false
        }).render();
    }

    zeta.UI.define('calendar', {
        template: '<div class="zeta-calendar"><div class="zeta-calendar-header"><z:buttonset show-text="false"/></div><div class="zeta-calendar-body"><table></table></div></div>',
        hideCalloutOnExecute: false,
        value: null,
        mode: 'day',
        min: null,
        max: null,
        setValue: function (e, self) {
            var value = normalizeDate(this, e.newValue);
            self.selectedDate = value;
            self.value = value;
            showMonth(self, value);
        },
        init: function (e, self) {
            if (!controls) {
                initInternalControls();
            }
            self.append([controls.year, controls.month, controls.prev, controls.setToday, controls.next]);

            var updateValue = function () {
                self.value = normalizeDate(self, self.selectedDate);
            };
            self.watch('mode', updateValue);
            self.watch('min', updateValue);
            self.watch('max', updateValue);

            var $table = $('table', self.element);
            $(repeat('<tr></tr>', 7)).appendTo($table);
            $(repeat('<th></th>', 7)).appendTo($table.find('tr:first'));
            $(repeat('<td></td>', 7)).appendTo($table.find('tr+tr'));
            $('<button>').appendTo($table.find('td'));
            $table.find('th').text(function (i) {
                return WEEKDAYS_STR[i];
            });
            $table.find('td').click(function () {
                var monthDelta = $(this).hasClass('prev') ? -1 : $(this).hasClass('next') ? 1 : 0;
                self.execute(new Date(getFullYear(self.currentMonth), getMonth(self.currentMonth) + monthDelta, +this.textContent));
            });
            if (!self.value) {
                self.value = new Date();
            } else {
                showMonth(self, 0);
            }
        },
        mousewheel: function (e, self) {
            if (self.context === callout) {
                showMonth(self, e.data);
                e.handled();
            }
        },
        contextChange: function (e, self) {
            showMonth(self, self.currentMonth || self.value || new Date());
        }
    });

    zeta.UI.define('clock', {
        template: '<div class="zeta-clock"><div class="zeta-clock-face"><s hand="h"></s><s hand="m"></s><i></i><i></i></div><z:buttonset/></div>',
        hideCalloutOnExecute: false,
        step: 1,
        value: null,
        init: function (e, self) {
            if (!controls) {
                initInternalControls();
            }
            self.append([controls.hour, controls.timeSeperator, controls.minute, controls.meridiem]);
            self.watch('step', function (step) {
                // only allow minute interval that is a factor of 60
                // to maintain consistent step over hours
                if (60 % step) {
                    self.step = 1;
                }
                ui.all(self).minute.options.step = step;
            }, true);
            self.setValue(new Date());
        },
        mousedown: function (e, self) {
            if (helper.is(e.target, 's')) {
                var rect = helper.getRect(e.target.parentNode);
                var promise = dom.drag(e, function (x, y) {
                    var rad = Math.atan2(y - rect.centerY, x - rect.centerX) / Math.PI;
                    var curM = getMinutes(self.value);
                    var curH = getHours(self.value);
                    if (e.target.getAttribute('hand') === 'm') {
                        var m = (Math.round((rad * 30 + 75) / self.step) * self.step) % 60;
                        if (m !== curM) {
                            var deltaH = Math.floor(Math.abs(curM - m) / 30) * (m > curM ? -1 : 1);
                            self.setValue(makeTime(curH + deltaH, m));
                        }
                    } else {
                        var h = Math.round(rad * 6 + 15) % 12 + (ui.all(self).meridiem.value ? 12 : 0);
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
        setValue: function (e, self) {
            var date = e.newValue;
            var all = ui.all(self);
            all.hour.value = getHours(date) || 12;
            all.minute.value = getMinutes(date);
            all.meridiem.value = getHours(date) >= 12;
            $('s[hand="h"]', self.element).css('transform', 'rotate(' + (getHours(date) * 30 + getMinutes(date) * 0.5 - 90) + 'deg)');
            $('s[hand="m"]', self.element).css('transform', 'rotate(' + (getMinutes(date) * 6 - 90) + 'deg)');
        },
        mousewheel: function (e, self) {
            self.setValue(stepDate('minute', self.value, e.data, self.step));
            self.mousewheelTimeout = self.mousewheelTimeout || setTimeout(function () {
                self.mousewheelTimeout = null;
                self.execute();
            });
            e.preventDefault();
            e.handled();
        }
    });

    function stepValue(tx) {
        var options = tx.widget.options;
        var date = stepDate(options.mode === 'datetime' ? 'minute' : options.mode, tx.typer.getValue() || new Date(), tx.commandName === 'stepUp' ? -1 : 1 , options.minuteStep);
        tx.typer.setValue(date);
    }

    var preset = {
        options: {
            mode: 'day',
            minuteStep: 1,
            min: null,
            max: null,
            required: false,
            formatDate: null
        },
        overrides: {
            getValue: function (preset) {
                return preset.selectedDate ? normalizeDate(preset.options, preset.selectedDate) : null;
            },
            setValue: function (preset, date) {
                date = date ? normalizeDate(preset.options, date) : null;
                preset.selectedDate = date;
                preset.softSelectedDate = null;

                var text = '';
                if (date && !isNaN(+date)) {
                    var format = function (fn) {
                        return helper.isFunction(fn) && fn(preset.options.mode, date);
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
            validate: function (preset) {
                if (preset.options.required && !!preset.selectedDate) {
                    return helper.reject('required');
                }
            }
        },
        commands: {
            stepUp: stepValue,
            stepDown: stepValue
        },
        contentChange: function (e) {
            if (e.typer === activeTyper && e.source !== 'script') {
                var date = new Date(e.typer.extractText());
                if (!isNaN(+date)) {
                    callout.calendar = callout.clock = normalizeDate(e.widget.options, date);
                }
                e.widget.softSelectedDate = date;
            }
        },
        click: function (e) {
            if (e.typer === activeTyper) {
                callout.showMenu(e.typer.element);
            }
        },
        escape: function (e) {
            if (helper.containsOrEquals(document, callout.element)) {
                callout.hideMenu();
                e.handled();
            }
        },
        focusin: function (e) {
            if (!callout) {
                initDatepickerCallout();
            }
            e.typer.retainFocus(callout.element);
            activeTyper = e.typer;

            var options = e.widget.options;
            var value = e.typer.getValue() || new Date();
            helper.extend(callout, {
                mode: options.mode,
                minuteStep: options.minuteStep,
                min: options.min,
                max: options.max,
                calendar: value,
                clock: value
            });
            callout.update();
            if (e.source !== 'script') {
                callout.showMenu(e.typer.element);
            }
        },
        focusout: function (e) {
            if (e.typer === activeTyper) {
                var softDate = e.widget.softSelectedDate;
                e.typer.setValue(!softDate || isNaN(+softDate) ? e.widget.selectedDate : softDate);
                activeTyper = null;
                callout.hideMenu();
            }
        }
    };

    zeta.UI.define('datepicker', {
        template: '<z:textbox/>',
        preventLeave: true,
        value: '',
        preset: preset,
        options: {},
        init: function (e, self) {
            if (zeta.IS_TOUCH) {
                var mode = self.options.mode || self.preset.options.mode;
                self.nativeInput = $('<input type="' + INPUT_TYPES[mode] + '">').appendTo(self.element)[0];
                helper.bind(self.nativeInput, 'change', function (e) {
                    self.setValue(fromNumericValue(mode, self.nativeInput.valueAsNumber));
                });
            }
        },
        focusin: function (e, self) {
            if (zeta.IS_TOUCH) {
                var mode = self.options.mode || self.preset.options.mode;
                if (!self.value) {
                    self.value = new Date();
                }
                // input type "datetime-local" does not support valueAsDate so we need to use with valueAsNumber (timestamp)
                self.nativeInput.valueAsNumber = toNumericValue(mode, self.value);
                self.nativeInput.focus();
                e.handled();
            }
        }
    });

    var DEFAULT_LABELS = {
        setToday: 'Today',
        prevMonth: 'Previous month',
        nextMonth: 'Next month',
        timeSeperator: ':',
        am: 'AM',
        pm: 'PM',
        done: 'Done'
    };
    range(12, function (i) {
        DEFAULT_LABELS[MONTH_STR[i].toLowerCase()] = MONTH_STR[i];
    });
    ui.i18n('en', DEFAULT_LABELS);

})();

// source: src/extensions/ui/keyword.js
(function () {
    var SHOW_DIALOG = zeta.IS_TOUCH;

    var helper = zeta.helper;
    var dom = zeta.dom;
    var ui = new zeta.UI('zeta.ui.keyword');
    var activeInput;
    var activeDialog;
    var callout;

    function initCallout() {
        callout = ui.menu(
            ui.dropdown({
                template: '<z:buttonlist/>',
                execute: function (self) {
                    insertItem(callout.preset, self.value);
                    callout.preset.typer.focus();
                },
                contextChange: function (e, self) {
                    self.choices = self.context.suggestions;
                }
            }), {
                hideCalloutOnBlur: false,
                hideCalloutOnExecute: false
            }
        ).render();
    }

    function encode(v, keepWS) {
        var a = document.createTextNode(keepWS ? v : v.replace(/\s/g, '\u00a0')),
            b = document.createElement('div');
        b.appendChild(a);
        return b.innerHTML;
    }

    function toValue(v) {
        return v.value;
    }

    function toValueObject(v) {
        if (typeof v !== 'object') {
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
        if (helper.isFunction(suggestions)) {
            suggestions = suggestions(value);
        }
        return helper.when(suggestions).then(function (suggestions) {
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
            helper.extend(v, fuzzyMatch(v.label, needle));
            [v.value].concat(v.matches || []).forEach(function (w) {
                var m = fuzzyMatch(w, needle);
                v.firstIndex = Math.min(v.firstIndex, m.firstIndex);
                v.consecutiveMatches = Math.max(v.consecutiveMatches, m.consecutiveMatches);
            });
            return v.firstIndex !== Infinity;
        });
        suggestions.sort(function (a, b) {
            return ((b.consecutiveMatches - a.consecutiveMatches) + (a.firstIndex - b.firstIndex)) || sortValues(a, b);
        });
        return suggestions.slice(0, count);
    }

    function showSuggestions(preset) {
        var value = preset.typer.extractText();
        var promise = getSuggestions(preset, value, preset.typer.getValue());
        promise.then(function (suggestions) {
            if (preset.typer.focused()) {
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
                if (!callout) {
                    initCallout();
                }
                callout.preset = preset;
                callout.suggestions = suggestions.map(function (v) {
                    return {
                        value: v.value,
                        label: v.formattedText,
                        icon: v.icon || ''
                    };
                });
                callout.update();
                dom.retainFocus(preset.typer.element, callout.element);
                callout.showMenu(preset.typer.element);
                preset.typer.focus();
            }
        });
    }

    function showSuggestionDialog(preset, control) {
        var knownValues = getSuggestions(preset);
        activeDialog = true;
        ui.dialog({
            title: control.label,
            description: control.placeholder,
            controls: [
                ui.textbox('newValue', {
                    enter: function (e, self) {
                        self.all.list.append(ui.checkbox({
                            label: self.value,
                            entry: self.value,
                            value: true,
                            description: 'new value',
                            before: '*'
                        }));
                        return self.execute();
                    },
                    visible: function () {
                        return preset.options.allowFreeInput;
                    }
                }),
                ui.buttonlist('list', {
                    templates: {
                        checkbox: '<z:checkbox show-icon="true"/>'
                    }
                }),
                ui.buttonset(
                    ui.submit('done', 'done'),
                    ui.button('cancel', 'close', function (self) {
                        self.all.dialog.destroy();
                    })
                )
            ],
            childExecuted: function (e, self) {
                self.value = self.all.list.controls.filter(function (v) {
                    return v.value;
                }).map(function (v) {
                    return v.entry;
                });
            },
            init: function (e, self) {
                var currentValues = preset.typer.getValue();
                self.all.dialog.value = currentValues.slice(0);

                knownValues.then(function (knownValues) {
                    var allValues = knownValues.map(toValue);
                    knownValues = knownValues.concat(currentValues.filter(function (v) {
                        return allValues.indexOf(v) < 0;
                    }).map(toValueObject));
                    knownValues.sort(sortValues);
                    self.all.list.append(knownValues.map(function (v) {
                        var checked = currentValues.indexOf(v.value) >= 0;
                        return ui.checkbox({
                            label: v.label,
                            icon: v.icon,
                            entry: v.value,
                            value: checked,
                            before: checked ? '*' : ''
                        });
                    }));
                });
            },
            destroy: function (e, self) {
                activeDialog = false;
            }
        }).render().dialog.then(function (values) {
            preset.typer.setValue(values);
        });
    }

    function insertItem(preset, value) {
        if (!value || preset.typer.getValue().indexOf(value.value || value) >= 0) {
            return;
        }
        if (typeof value !== 'object') {
            value = {
                value: value,
                label: preset.knownValues[value] || value
            };
        }
        var span = $('<span class="zeta-keyword" data-value="' + encode(value.value, true) + '">' + encode(value.label) + '<i>delete</i></span>')[0];
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
                    $(span).addClass('invalid');
                }
            });
        }
    }

    var preset = {
        options: {
            required: false,
            allowFreeInput: true,
            allowedValues: null,
            suggestionCount: 5,
            suggestions: false
        },
        overrides: {
            getValue: function (preset) {
                return $('span', this.element).map(function (i, v) {
                    return String($(v).data('value'));
                }).get();
            },
            setValue: function (preset, values) {
                values = (helper.isArray(values) || String(values).split(/\s+/)).filter(function (v) {
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
            validate: function (preset) {
                if (preset.options.required && !this.getValue().length) {
                    return helper.reject('required');
                }
                if ($('.invalid', this.element)[0]) {
                    return helper.reject('invalid-value');
                }
            }
        },
        widgets: {
            tag: {
                element: 'span',
                inline: true,
                editable: 'none',
                click: function (e) {
                    if (e.target !== e.widget.element) {
                        $(e.widget.element).detach();
                    }
                }
            }
        },
        init: function (e) {
            e.typer.select(e.typer.element, -0);
            e.widget.knownValues = {};
        },
        focusin: function (e) {
            if (!SHOW_DIALOG) {
                showSuggestions(e.widget);
            } else {
                showSuggestionDialog(e.widget, activeInput);
            }
        },
        focusout: function (e) {
            insertItem(e.widget, e.typer.extractText());
            if (!SHOW_DIALOG) {
                callout.hideMenu();
            }
        },
        click: function (e) {
            if (SHOW_DIALOG && !activeDialog) {
                showSuggestionDialog(e.widget, activeInput);
            }
        },
        upArrow: function (e) {
            dom.focus(callout.element);
            e.handled();
        },
        downArrow: function (e) {
            dom.focus(callout.element);
            e.handled();
        },
        textInput: function (e) {
            var lastChild = e.typer.rootNode.lastChild;
            if (lastChild && helper.compareRangePosition(e.typer.getSelection(), lastChild.element) < 0) {
                e.typer.select(e.typer.element, -0);
            }
        },
        enter: function (e) {
            var suggestions = callout.suggestions;
            insertItem(e.widget, suggestions.length === 1 || (suggestions[0] && suggestions[0].label === '**' + e.widget.knownValues[suggestions[0].value] + '**') ? suggestions[0].value : e.typer.extractText());
            e.handled();
        },
        escape: function (e) {
            if (helper.containsOrEquals(document, callout.element)) {
                callout.hideMenu();
                e.handled();
            }
        },
        contentChange: function (e) {
            if (!SHOW_DIALOG && e.source !== 'script') {
                showSuggestions(e.widget);
            }
        }
    };

    zeta.UI.define('keyword', {
        template: '<z:textbox/>',
        preventLeave: true,
        options: {},
        value: [],
        preset: preset,
        init: function (e, self) {
            self.watch('required', function (required) {
                self.options.required = required;
            }, true);
        },
        focusin: function (e, self) {
            activeInput = self;
        },
        setValue: function (e, self) {
            var newValue = e.newValue || [];
            if (valueChanged(e.oldValue, newValue)) {
                self.setValue(newValue);
                self.editor.setValue(newValue);
            }
            e.handled();
        }
    });

    ui.i18n('en', {
        newValue: 'Enter new value',
        done: 'Done',
        cancel: 'Cancel'
    });

})();

// source: src/extensions/ui/number.js
(function () {
    function setValue(widget, value) {
        if (value === null || value === '' || isNaN(value)) {
            value = value ? '0' : '';
        } else {
            var min = widget.options.min;
            var max = widget.options.max;
            var loop = widget.options.loop && min !== null && max !== null;
            if ((loop && value < min) || (!loop && max !== null && value > max)) {
                value = max;
            } else if ((loop && value > max) || (!loop && min !== null && value < min)) {
                value = min;
            }
            value = String(+value | 0);
        }
        if (widget.options.digits === 'fixed') {
            var numOfDigits = String(+widget.options.max || 0).length;
            value = (new Array(numOfDigits + 1).join('0') + value).substr(-numOfDigits);
        }
        if (value !== widget.typer.extractText()) {
            widget.typer.invoke(function (tx) {
                tx.selection.selectAll();
                tx.insertText(value);
            });
        }
    }

    function stepValue(tx) {
        setValue(tx.widget, (tx.typer.getValue() || 0) + (tx.commandName === 'stepUp' ? 1 : -1) * tx.widget.options.step);
    }

    var preset = {
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
            getValue: function (preset) {
                var value = parseInt(this.extractText());
                return isNaN(value) ? null : value;
            },
            setValue: function (preset, value) {
                setValue(preset, value);
            }
        },
        commands: {
            stepUp: stepValue,
            stepDown: stepValue
        },
        contentChange: function (e) {
            if (e.source !== 'keyboard') {
                setValue(e.widget, e.typer.getValue());
            }
        }
    };

    zeta.UI.define('number', {
        template: '<z:textbox/>',
        preventLeave: true,
        value: null,
        preset: preset
    });

})();

}(window, document, Object, String, Array, Math, Date, Node, Range, DocumentFragment, RegExp, parseFloat, setTimeout, clearTimeout, getComputedStyle, new (function () {

// source: src/shim/Map.js
this.Map = window.Map || (function (shim) {
    function indexOf(map, key) {
        return map.items.indexOf(key);
    }
    function Map() {
        var self = this;
        self.items = [];
        self._values = [];
        self._keys = shim.Set.prototype._keys;
    }
    Map.prototype = {
        get size() {
            return this.items.length;
        },
        has: function (v) {
            return indexOf(this, v) >= 0;
        },
        get: function (v) {
            var index = indexOf(this, v);
            return index >= 0 ? this._values[index] : undefined;
        },
        set: function (i, v) {
            var self = this;
            var index = indexOf(self, i);
            self._values[index >= 0 ? index : self.items.push(i) - 1] = v;
            return self;
        },
        delete: function (v) {
            var self = this;
            var index = indexOf(self, v);
            if (index >= 0) {
                self.items.splice(index, 1);
                self._values.splice(index, 1);
            }
            return index >= 0;
        },
        keys: function () {
            return this._keys();
        },
        values: function () {
            var self = this;
            return self._keys(function (v) {
                return self.get(v);
            });
        },
        entries: function () {
            var self = this;
            return self._keys(function (v) {
                return [v, self.get(v)];
            });
        },
        forEach: function (callback, thisArg) {
            var self = this;
            self.items.forEach(function (v, i) {
                callback.call(thisArg, self._values[i], v, self);
            });
        },
        clear: function () {
            this.items.splice(0);
            this._values.splice(0);
        }
    };
    return Map;
}(this));

// source: src/shim/MutationObserver.js
this.MutationObserver = window.MutationObserver || (function () {
    function MutationObserver(handler) {
        this.records = [];
        this.handler = handler;
    }
    MutationObserver.prototype = {
        observe: function (element, init) {
            var helper = zeta.helper;
            var self = this;
            helper.bind(element, 'DOMNodeInserted DOMNodeRemoved DOMAttrModified DOMCharacterDataModified', function (e) {
                var type = e.type.charAt(7);
                var oldValue = e.prevValue;
                var record = {};
                record.addedNodes = [];
                record.removedNodes = [];
                if (type === 'M') {
                    record.type = 'attributes';
                    record.target = e.target;
                    record.attributeName = e.attrName;
                    if (init.attributeOldValue) {
                        record.oldValue = oldValue;
                    }
                } else if (type === 'a') {
                    record.type = 'characterData';
                    record.target = e.target;
                    if (init.characterDataOldValue) {
                        record.oldValue = oldValue;
                    }
                } else {
                    record.type = 'childList';
                    record.target = e.target.parentNode;
                    record[type === 'I' ? 'addedNodes' : 'removedNodes'][0] = e.target;
                }
                var shouldIgnore = false;
                helper.each(self.records, function (i, v) {
                    shouldIgnore |= v.type === 'childList' && v.addedNodes.some(function (v) {
                        return helper.containsOrEquals(v, record.target);
                    });
                    return !shouldIgnore;
                });
                if (!shouldIgnore && init[record.type] && (init.subtree || record.target === element)) {
                    self.records[self.records.length] = record;
                    clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        self.handler(self.takeRecords(), self);
                    });
                }
            });
        },
        takeRecords: function () {
            return this.records.splice(0);
        }
    };
    return MutationObserver;
}());

// source: src/shim/Set.js
this.Set = window.Set || (function () {
    function Iterator(arr, callback) {
        var self = this;
        self.items = arr;
        self.index = -1;
        self.callback = callback || function (v) {
            return v;
        };
    }
    Iterator.prototype = {
        next: function () {
            var self = this;
            if (++self.index < self.items.length) {
                return {
                    value: self.callback(self.items[self.index], self.index),
                    done: false
                };
            }
            return {
                value: undefined,
                done: true
            };
        }
    };

    function Set() {
        this.items = [];
    }
    Set.prototype = {
        get size() {
            return this.items.length;
        },
        has: function (v) {
            return this.items.indexOf(v) >= 0;
        },
        add: function (v) {
            var items = this.items;
            if (items.indexOf(v) < 0) {
                items.push(v);
            }
            return this;
        },
        delete: function (v) {
            var index = this.items.indexOf(v);
            if (index >= 0) {
                this.items.splice(index, 1);
            }
            return index >= 0;
        },
        keys: function () {
            return this._keys();
        },
        values: function () {
            return this._keys();
        },
        entries: function () {
            return this._keys(function (v) {
                return [v, v];
            });
        },
        forEach: function (callback, thisArg) {
            var self = this;
            self.items.forEach(function (v) {
                callback.call(thisArg, v, v, self);
            });
        },
        clear: function () {
            this.items.splice(0);
        },
        _keys: function (callback) {
            return new Iterator(this.items, callback);
        }
    };
    return Set;
}());

// source: src/shim/WeakMap.js
this.WeakMap = window.WeakMap || (function () {
    var num = 0;
    var state = 0;
    var returnValue;

    function WeakMap() {
        this.key = '__WeakMap' + (++num);
    }
    WeakMap.prototype = {
        get: function (key) {
            if (this.has(key)) {
                try {
                    state = 1;
                    key[this.key]();
                    if (state !== 2) {
                        throw new Error('Invalid operation');
                    }
                    var value = returnValue;
                    returnValue = null;
                    return value;
                } finally {
                    state = 0;
                }
            }
        },
        set: function (key, value) {
            Object.defineProperty(key, this.key, {
                configurable: true,
                value: function () {
                    if (state === 1) {
                        returnValue = value;
                        state = 2;
                    }
                }
            });
            return this;
        },
        has: function (key) {
            return key && Object.hasOwnProperty.call(key, this.key);
        },
        delete: function (key) {
            var has = this.has(key);
            if (has) {
                delete key[this.key];
            }
            return has;
        }
    };
    return WeakMap;
}());

})));

return zeta;

}));
