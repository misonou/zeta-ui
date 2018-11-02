(function () {
    var node = createElement('div');

    var ARROW_CHAR = '▶';
    var ARROW = '<span style="display:inline-block;vertical-align:top;color:#808080;font-size:90%;padding:0 4px;cursor:pointer;">' + ARROW_CHAR + '</span>';

    var COLOR_STRLIT = '#c51916';
    var COLOR_NODENAME = '#ab0d90';
    var COLOR_ATTRNAME = '#9c4c10';
    var COLOR_ATTRVAL = '#1c00cf';
    var COLOR_SPECVAL = '#1c00cf';
    var COLOR_TAG = '#ac99aa';
    var COLOR_PROPNAME = '#515151';

    var Map = zeta.shim.Map;
    var Set = zeta.shim.Set;

    function encode(str) {
        node.textContent = String(str);
        return node.innerHTML;
    }

    function colorize(str, color) {
        return $('<span style="display:inline-block;vertical-align:top;color:' + (color || 'black') + '">' + encode(str) + '</span>')[0];
    }

    function isArrayLike(obj) {
        return Array.isArray(obj) || obj instanceof NodeList || obj instanceof HTMLCollection || obj instanceof DOMTokenList || obj instanceof NamedNodeMap;
    }

    function getObjectTypeFromProto(proto) {
        if (proto && proto !== Object.prototype && proto.constructor) {
            if (!Object.hasOwnProperty.call(proto.constructor, 'name')) {
                return /^\s*function\s([^(]*)|\[object ([^\]]+)\]/.test(proto.constructor.toString()) ? RegExp.$1 || RegExp.$2 : '';
            } else {
                return proto.constructor.name;
            }
        }
        return '';
    }

    function isExpandableNode(node) {
        return node.textContent.indexOf(ARROW_CHAR) === 0;
    }

    function createElement(name) {
        return document.createElement(name);
    }

    function createExpandable(content, obj, thisArg, contentWhenExpand, mode) {
        var span = $('<span style="display:inline-block;vertical-align:top">' + ARROW + '<span></span></span>')[0];
        var $arrow = $('span:first-child', span);
        var detailView;

        append(span.children[1], content);
        if (contentWhenExpand) {
            contentWhenExpand.style.display = 'none';
            append(span, contentWhenExpand);
        }
        $(span).click(function (e) {
            e.stopPropagation();
            if (!detailView) {
                detailView = $('<span style="display:none;white-space:nowrap;">&nbsp;&nbsp;<span style="display:inline-block"></span></span>')[0];
                append(span, detailView);
                writeObject(detailView.children[0], obj, mode || 'vertical', thisArg);
            }
            if (detailView.style.display === 'none') {
                detailView.style.display = 'block';
                $arrow.css('transform', 'rotate(90deg)');
                if (contentWhenExpand) {
                    content.style.display = 'none';
                    contentWhenExpand.style.display = '';
                }
            } else {
                detailView.style.display = 'none';
                $arrow.css('transform', 'rotate(0)');
                if (contentWhenExpand) {
                    content.style.display = '';
                    contentWhenExpand.style.display = 'none';
                }
            }
        });
        return span;
    }

    function listProperties(obj, sort, showProto) {
        var entries = [];
        var arrayLike = isArrayLike(obj);

        function createFakeEntry(name, value, order, orderName) {
            entries.push({
                name: name,
                order: order,
                orderName: orderName || name,
                desc: {
                    value: value
                }
            });
        }

        function cmp(a, b) {
            for (var i = 0, len = Math.min(a.length, b.length); i < len; i++) {
                if (a[i] !== b[i]) {
                    return a.charCodeAt(i) - b.charCodeAt(i);
                }
            }
            return a.length - b.length;
        }

        // list all own properties as well as getter properties from prototype
        for (var cur = obj; cur; cur = Object.getPrototypeOf(cur)) {
            Object.getOwnPropertyNames(cur).forEach(function (i) {
                var desc = Object.getOwnPropertyDescriptor(cur, i);
                if (i === '__proto__' || !desc) {
                    return;
                }

                var isInternal = i.substr(0, 2) === '__';
                if (desc.get || cur === obj) {
                    var isIndex = arrayLike && !isNaN(parseInt(i));
                    entries.push({
                        owner: cur,
                        name: i,
                        desc: desc,
                        order: isIndex ? -1 : desc.enumerable ? 0 : 1 + isInternal,
                        orderName: isIndex ? parseInt(i) : i
                    });
                }
                // list getter and setter defined on current object
                if (cur === obj) {
                    if (desc.get) {
                        createFakeEntry('get ' + i, desc.get, 2 + isInternal, i + ' get');
                    }
                    if (desc.set) {
                        createFakeEntry('set ' + i, desc.set, 2 + isInternal, i + ' set');
                    }
                }
            });
        }

        if (sort) {
            entries.sort(function (a, b) {
                return (a.order - b.order) || (a.order < 0 ? a.orderName - b.orderName : cmp(a.orderName, b.orderName));
            });
        }
        if (showProto && Object.getPrototypeOf(obj)) {
            createFakeEntry('__proto__', Object.getPrototypeOf(obj), 3);

            if (obj instanceof Map) {
                var arr = [];
                obj.forEach(function (v, i) {
                    var obj = Object.create(null);
                    obj.key = i;
                    obj.value = v;
                    arr.push(obj);
                });
                createFakeEntry('[[Entries]]', arr, 4);
            }
        }
        return entries;
    }

    function append(node) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            var v = arguments[i];
            node.appendChild(typeof v === 'string' ? document.createTextNode(v) : v);
        }
    }

    function newBlock() {
        return $('<span style="display:block">')[0];
    }

    function newLine() {
        return $('<span style="display:inline-block;vertical-align:top;white-space:nowrap">')[0];
    }

    function createNode(obj, mode, thisArg) {
        if (arguments.length < 3) {
            thisArg = obj;
        }

        // standard JavaScript objects
        switch (obj) {
            case null:
            case undefined:
                return colorize(obj, '#808080');
            case false:
            case true:
                return colorize(obj, COLOR_SPECVAL);
        }
        switch (typeof obj) {
            case 'string':
                return mode === 'collapsed' || mode === 'horizontal' ? colorize('"' + obj + '"', COLOR_STRLIT) : colorize(obj || '\u200b');
            case 'number':
                if (obj === 0 && 1 / obj < 0) {
                    // sign does not reflect in toString()
                    obj = '-0';
                }
                return colorize(obj, COLOR_SPECVAL);
            case 'function':
                if (mode === 'vertical') {
                    break;
                }
                var source = obj.toString().replace(/^\s*function\s|\s+$/g, '');
                var em = createElement('em');
                if (mode === 'horizontal') {
                    append(em, colorize('ƒ', COLOR_SPECVAL), ' ', source.substr(0, source.indexOf(')') + 1));
                    return createExpandable(em, obj, thisArg);
                }
                if (mode === 'literal') {
                    append(em, colorize('ƒ', COLOR_SPECVAL), ' ', source);
                } else {
                    append(em, 'ƒ');
                }
                return em;
        }

        var stringTag = /\[object (.+)\]/.test(Object.prototype.toString.call(obj)) ? RegExp.$1 : '';
        var domClass = stringTag !== 'Object' && stringTag !== 'Function' && window[stringTag.replace(/Prototype$/ ,'')];

        // special representation for DOM nodes
        if (obj instanceof Node && domClass && obj !== domClass.prototype) {
            if (obj instanceof DocumentType) {
                if (mode === 'collapsed' || mode === 'literal' || mode === 'inner') {
                    return colorize('<!doctype ' + obj.nodeName + '>', '#808080');
                }
            }
            if (obj instanceof Attr) {
                if (mode === 'collapsed') {
                    return colorize(obj.nodeName, COLOR_NODENAME);
                }
                if (mode === 'horizontal') {
                    return createExpandable(colorize(obj.nodeName, COLOR_NODENAME), obj, thisArg);
                }
            }
            if (obj instanceof Text) {
                if (mode === 'literal') {
                    return colorize(obj.data);
                }
                if (mode === 'collapsed') {
                    return colorize('text', COLOR_NODENAME);
                }
                if (mode === 'horizontal') {
                    return createExpandable(colorize('text', COLOR_NODENAME), obj, thisArg);
                }
            }
            if (obj instanceof Element || obj instanceof Document) {
                var nodeName = obj.nodeType === 1 ? obj.tagName.toLowerCase() : '#document';
                var nodeColor = obj.nodeType === 1 ? COLOR_NODENAME : 'black';

                if (mode === 'collapsed') {
                    return colorize(nodeName, nodeColor);
                }
                if (mode === 'horizontal') {
                    return createExpandable(colorize(nodeName, nodeColor), obj, thisArg);
                }
                if (mode === 'literal') {
                    if (obj.nodeType === 9) {
                        return createExpandable(colorize(nodeName, nodeColor), obj, thisArg, null, 'inner');
                    }
                    var span = newLine();
                    append(span,
                        colorize('<', COLOR_TAG),
                        colorize(nodeName, nodeColor));

                    for (var i = 0, arr = obj.attributes, len = arr.length; i < len; i++) {
                        append(span,
                            ' ',
                            colorize(arr[i].nodeName, COLOR_ATTRNAME),
                            colorize('="', COLOR_TAG),
                            colorize(arr[i].nodeValue, COLOR_ATTRVAL),
                            colorize('"', COLOR_TAG));
                    }
                    append(span, colorize('>', COLOR_TAG));

                    if (obj.childNodes.length === 1 && obj.childNodes[0] instanceof Text) {
                        append(span,
                            obj.childNodes[0].data,
                            colorize('<', COLOR_TAG),
                            colorize('/' + nodeName, nodeColor),
                            colorize('>', COLOR_TAG));
                        return span;
                    } else {
                        var copy = span.cloneNode(true);
                        append(span,
                            '…',
                            colorize('<', COLOR_TAG),
                            colorize('/' + nodeName, nodeColor),
                            colorize('>', COLOR_TAG));
                        return createExpandable(span, obj, thisArg, copy, 'inner');
                    }
                }
                if (mode === 'inner') {
                    var span = newLine();
                    for (var i = 0, arr = obj.childNodes, len = arr.length; i < len; i++) {
                        if (arr[i].nodeType === 3 && !arr[i].data.replace(/^\s+|\s+$/, '')) {
                            // skip empty text node
                            continue;
                        }
                        var cur = newBlock();
                        var inner = createNode(arr[i], 'literal');
                        if (!isExpandableNode(inner)) {
                            append(cur, $(ARROW).css('visibility', 'hidden')[0]);
                        }
                        append(cur, inner);
                        append(span, cur);
                    }
                    if (obj.nodeType === 1) {
                        append(span,
                            colorize('<', COLOR_TAG),
                            colorize('/' + nodeName, nodeColor),
                            colorize('>', COLOR_TAG));
                    }
                    return span;
                }
            }
        }

        var arrayLike = isArrayLike(obj);
        var proto = Object.getPrototypeOf(obj);
        var protoName = getObjectTypeFromProto(proto);
        if (arrayLike) {
            protoName = (protoName || 'Array') + '(' + obj.length + ')';
        }
        if (obj instanceof Map || obj instanceof Set) {
            protoName += '(' + obj.size + ')';
        }

        if (mode === 'proto') {
            return createExpandable(protoName || 'Object', obj, thisArg);
        }
        if (mode === 'vertical') {
            var line = newLine();
            listProperties(obj, true, true).forEach(function (v) {
                var cur = newBlock();
                var detail;
                if (v.name === '__proto__') {
                    detail = createNode(v.desc.value, 'proto', thisArg);
                } else if ('value' in v.desc) {
                    detail = createNode(v.desc.value, 'horizontal');
                } else if (domClass && obj !== domClass.prototype) {
                    // resolve all properties for DOM nodes even though they are defined as getters
                    detail = createNode(obj[v.name], 'horizontal');
                } else if (v.desc.get) {
                    detail = $('<span style="cursor:pointer;"><em>(...)</em></span>').click(function (e) {
                        var node;
                        try {
                            node = createNode(thisArg[v.name], 'horizontal');
                        } catch (e) {
                            node = createNode('[Exception: ' + e.message + ']', 'literal');
                        }
                        if (isExpandableNode(node) && isExpandableNode(this.parentNode)) {
                            // replace current horizontal entry with the new expandable node
                            $(this).parent().replaceWith(node);
                            // place the property name after arrow
                            $(this).prev().insertAfter(node.children[0]);
                            node.style.display = 'block';
                        } else {
                            // place (...) with the resolved value
                            $(this).replaceWith(node);
                        }
                        // prevent toggling parent entry
                        e.stopPropagation();
                    })[0];
                }

                var propName = $('<span><span style="color: #ab0d90;' + (v.desc.enumerable ? '' : 'opacity:0.7') + '">' + encode(v.name) + '</span>: </span>')[0];
                if (isExpandableNode(detail)) {
                    $(detail).children().eq(1).prepend(propName);
                    append(cur, detail);
                } else {
                    append(cur, $(ARROW).css('visibility', 'hidden')[0], propName, detail);
                }
                append(line, cur);
            });
            return line;
        }

        var node;
        var nodeAfterExpand;
        var expandable = mode !== 'collapsed';

        if (stringTag === 'Date') {
            node = colorize(obj.toString());
            expandable &= mode !== 'literal';
        } else if (stringTag === 'RegExp') {
            node = colorize(obj.toString(), COLOR_STRLIT);
            expandable &= mode !== 'literal';
        } else if (stringTag.substr(-5) === 'Error') {
            node = colorize(mode === 'collapsed' && obj.stack.length > 50 ? obj.stack.substr(0, 50) + '…' : obj.stack, 'inherit');
        } else if (mode === 'collapsed') {
            node = colorize(protoName || '{…}');
        } else {
            var propList = createElement('span');
            var forEach = function(arr, callback) {
                var stop, count = 0;
                arr.forEach(function (v, i) {
                    if (stop) {
                        return;
                    }
                    if (count++) {
                        append(propList, ', ');
                    }
                    if (propList.textContent.length > 100) {
                        append(propList, '…');
                        stop = true;
                        return;
                    }
                    callback(i, v);
                });
            };
            if (obj instanceof Set) {
                forEach(obj, function (v) {
                    append(propList, createNode(v, 'collapsed'));
                });
            } else if (obj instanceof Map) {
                forEach(obj, function (i, v) {
                    append(propList, createNode(i, 'collapsed'), ' => ', createNode(v, 'collapsed'));
                });
            } else {
                var entries = listProperties(obj).filter(function (v) {
                    // only show value properties for object and visible value properties for array-like object
                    return (v.order < 2 && 'value' in v.desc) && (!arrayLike || v.desc.enumerable);
                });
                forEach(entries, function (i, v) {
                    var cur = v.order <= 0 ? propList : $('<span style="opacity: 0.7">').appendTo(propList)[0];
                    if (v.order >= 0) {
                        append(cur, colorize(v.name, COLOR_PROPNAME), ': ');
                    }
                    append(cur, createNode(v.desc.value, mode === 'literal' || mode === 'horizontal' ? 'collapsed' : 'literal'));
                });
            }
            node = createElement(mode === 'horizontal' ? 'span' : 'em');
            nodeAfterExpand = colorize(proto ? protoName || 'Object' : '');
            if (protoName) {
                append(node, colorize(protoName, mode === 'horizontal' ? '#808080' : 'black'), ' ');
            }
            append(node, arrayLike ? '[' : '{', propList, arrayLike ? ']' : '}');
        }
        return expandable ? createExpandable(node, obj, thisArg, nodeAfterExpand) : node;
    }

    function writeObject(container, obj, mode, thisArg) {
        append(container, createNode(obj, mode, arguments.length < 4 ? obj : thisArg));
    }

    function writeArguments() {
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (i) {
                append(this, ' ');
            }
            writeObject(this, arguments[i], 'literal');
        }
    }

    function appendLine(container, line) {
        append(container, line);
        container.scrollTop = container.scrollHeight - container.offsetHeight;
    }

    function HTMLConsole(element) {
        this.element = element;
    }
    HTMLConsole.prototype.log = function () {
        var container = $('<div class="log-entry" style="background-color:white;color:black;"></div>')[0];
        writeArguments.apply(container, arguments);
        appendLine(this.element, container);
    };
    HTMLConsole.prototype.error = function () {
        var container = $('<div class="log-entry" style="background-color:#fff0f0;border-color:#fed6d7;color:red;z-index:1;"></div>')[0];
        writeArguments.apply(container, arguments);
        appendLine(this.element, container);
    };
    HTMLConsole.prototype.warn = function () {
        var container = $('<div class="log-entry" style="background-color:#fffbe6;border-color:#fff4c5;z-index:1;"></div>')[0];
        writeArguments.apply(container, arguments);
        appendLine(this.element, container);
    };
    HTMLConsole.prototype.clear = function () {
        this.element.innerHTML = '';
    };
    window.HTMLConsole = HTMLConsole;
}());
