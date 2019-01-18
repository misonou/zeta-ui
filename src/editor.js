(function ($, zeta) {
    'use strict';

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
    var getComputedStyle = window.getComputedStyle;
    var clipboard = {};
    var composingEditor = null;
    var selectionCache = new WeakMap();
    var detachedElements = new WeakMap();
    var dirtySelections = new Set();

    function TyperSelection(typer, range) {
        var self = this;
        selectionCache.set(self, {});
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

    function isTextNodeEnd(v, offset, dir) {
        var str = v.data;
        return (dir >= 0 && (offset === v.length || str.slice(offset) === ZWSP)) ? 1 : (dir <= 0 && (!offset || str.slice(0, offset) === ZWSP)) ? -1 : 0;
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
        var cache = getFontMetric.cache || (getFontMetric.cache = {});
        var style = getComputedStyle(isElm(elm) || elm.parentNode);
        var key = [style.fontFamily, style.fontWeight, style.fontStyle].join('|');
        if (!cache[key]) {
            var $dummy = $('<div style="position:fixed;font-size:1000px;"><span style="display:inline-block;width:0;height:0;"></span>&nbsp;</div>').css({
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle
            }).appendTo(document.body);
            var $img = $dummy.children();
            var offset = getRect($dummy[0]).top;
            cache[key] = {
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
            baseline: cache[key].baseline * fontSize,
            height: cache[key].height * fontSize,
            middle: cache[key].middle * fontSize,
            wsWidth: cache[key].wsWidth * fontSize
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
        options = extend(true, {}, (!options || options.defaultOptions !== false) && Typer.defaultOptions, options);

        var typer = this;
        var topNodeType = options.inline || is(topElement, INNER_PTAG) ? NODE_EDITABLE_PARAGRAPH : NODE_EDITABLE;
        var container = new zeta.Container(topElement, typer);
        var widgetOptions = {};
        var staticWidgets = [];
        var undoable = {};
        var currentSelection;
        var triggerDOMChange;
        var enabled;
        var muteChanges = true;
        var needNormalize = true;
        var $self = $(topElement);

        function TyperTransaction(widget) {
            this.widget = widget || null;
        }

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

        function getAllWidgets() {
            return currentSelection.getWidgets().reverse().concat(staticWidgets);
        }

        function findWidgetWithCommand(name) {
            return any(getAllWidgets(), function (v) {
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
                undoable.snapshot();
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
                            selectionUpdate(currentSelection);
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

        function updateWholeText(node, reduce, transform) {
            var textNodes = iterateToArray(createNodeIterator(node, 4));
            var wholeText = '';
            var index = [];
            reduce = reduce || function (v, a) {
                return v + a;
            };
            each(textNodes, function (i, v) {
                wholeText = reduce(wholeText, v.data);
                index[i] = wholeText.length;
            });
            wholeText = transform(wholeText);
            each(textNodes, function (i, v) {
                updateTextNodeData(v, wholeText.slice(index[i - 1] || 0, index[i]));
            });
        }

        function normalizeWhitespace(node) {
            updateWholeText(node, function (v, a) {
                return (v + a).replace(/\u00a0{2}(?!\u0020?$)/g, '\u00a0 ').replace(/[^\S\u00a0]{2}/g, ' \u00a0').replace(/\u00a0[^\S\u00a0]\u00a0(\S)/g, '\u00a0\u00a0 $1').replace(/(\S)\u00a0(?!$)/g, '$1 ');
            }, function (v) {
                return v.replace(/[^\S\u00a0]$/, '\u00a0');
            });
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
                            if (!handler) {
                                updateWholeText(content, null, function (v) {
                                    return transformText(v, $.css(element, 'text-transform'));
                                });
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
                var value = undoable.getValue();
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

            extend(undoable, {
                getValue: function () {
                    return trim(topElement.innerHTML.replace(/\s+style(?:="[^"]*")?|\u200b+(?!<\/)|(^|[^>])\u200b+/g, '$1'));
                },
                canUndo: function () {
                    return currentIndex < snapshots.length - 1;
                },
                canRedo: function () {
                    return currentIndex > 0;
                },
                undo: function () {
                    if (undoable.canUndo()) {
                        applySnapshot(snapshots[++currentIndex]);
                    }
                },
                redo: function () {
                    if (undoable.canRedo()) {
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
                    undoable.snapshot(200);
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

            var defaultKeystroke = {
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
                    defaultKeystroke[v] = function () {
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
                        undoable.snapshot(200);
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
            var afterEmit = {
                keystroke: function (e) {
                    if (e.data in defaultKeystroke && defaultKeystroke[e.data](e)) {
                        e.handled();
                    }
                },
                textInput: function (e) {
                    handleTextInput(e.data);
                    e.handled();
                }
            };

            container.tap(function (e) {
                var eventName = e.eventName;
                var target;
                if (enabled) {
                    (beforeEmit[eventName] || helper.noop)(e);
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
                    if (!container.emit(e, target || currentSelection.focusNode.element)) {
                        (afterEmit[eventName] || helper.noop)(e);
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
            each(Typer.widgets, function (i, v) {
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

            extend(typer, createTyperDocument(topElement, true));
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

        extend(typer, undoable, {
            element: topElement,
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
                } else if (!widgetOptions[id] && Typer.widgets[id] && !Typer.widgets[id].element) {
                    setWidgetOption(id, Typer.widgets[id], options);
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
                var tx = new TyperTransaction();
                if (typeof command === 'string') {
                    tx.commandName = command;
                    tx.widget = findWidgetWithCommand(command);
                    command = tx.widget && widgetOptions[tx.widget.id].commands[command];
                }
                if (!isFunction(command)) {
                    return false;
                }
                command.call(typer, tx, value);
                normalize();
                undoable.snapshot();
                if (typer.focused(true)) {
                    currentSelection.focus();
                }
                return true;
            }
        });

        definePrototype(TyperTransaction, {
            typer: typer,
            get selection() {
                return currentSelection;
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
                    handler.call(typer, new TyperTransaction(widget));
                } else if (handler === 'keepText') {
                    var textContent = extractText(widget.element);
                    insertContents(createRange(widget.element, true), textContent);
                    removeNode(widget.element);
                } else {
                    insertContents(createRange(widget.element), '');
                }
            }
        });

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
        defaultOptions: {},
        widgets: {},
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

    function treeWalkerNodeAccepted(inst, node, checkWidget) {
        treeWalkerAcceptNode.returnValue = treeWalkerAcceptNode(inst, node, checkWidget);
        if (treeWalkerAcceptNode.returnValue === 1) {
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
            if (treeWalkerAcceptNode.returnValue === 3 && node[pChild]) {
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
                sibling = (treeWalkerAcceptNode.returnValue === 2 || !sibling[pChild]) ? sibling[pSib] : sibling[pChild];
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
                    rv = treeWalkerAcceptNode.returnValue;
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
                rv = treeWalkerAcceptNode.returnValue;
            }
        }
    });

    function nodeIteratorInit(inst, iterator) {
        var typer = iterator.currentNode.typer;
        var iterator2 = document.createTreeWalker(iterator.root.element, inst.whatToShow | 1, function (v) {
            var node = typer.getNode(v);
            if (!treeWalkerNodeAccepted(iterator, node, true)) {
                return treeWalkerAcceptNode.returnValue;
            }
            if ((isText(v) || isBR(v)) && !is(node, NODE_ANY_ALLOWTEXT)) {
                return 2;
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
        var d = selectionCache.get(inst).d;
        var defaultFilter = function (v) {
            return !rangeIntersects(v.element, range) ? 2 : 1;
        };
        return new TyperTreeWalker(inst.focusNode, whatToShow & ~NODE_SHOW_HIDDEN, combineNodeFilters(defaultFilter, d && d.acceptNode && d.acceptNode.bind(d), filter));
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
        var cache = selectionCache.get(inst);
        cache.d = null;
        cache.m = 0;
        inst.timestamp = performance.now();
        inst.direction = helper.compareRangePosition(inst.extendCaret.getRange(), inst.baseCaret.getRange()) || 0;
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
                selectionCache.get(self).d = startNode;
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
            selectionCache.get(inst).d = selectionCache.get(self).d;
            return inst;
        },
        widgetAllowed: function (id) {
            return this.typer.widgetAllowed(id, this.focusNode);
        }
    });

    each('moveTo moveToPoint moveToText moveByLine moveToLineEnd moveByWord moveByCharacter', function (i, v) {
        TyperSelection.prototype[v] = function () {
            var self = this;
            return selectionAtomic(function () {
                return TyperCaret.prototype[v].apply(self.baseCaret, arguments) + self.collapse('base') > 0;
            }, arguments);
        };
    });
    each('getWidgets getParagraphElements getSelectedElements getSelectedText getSelectedTextNodes', function (i, v) {
        var fn = TyperSelection.prototype[v];
        TyperSelection.prototype[v] = function () {
            var cache = selectionCache.get(this);
            if (!(cache.m & (1 << i))) {
                cache[v] = cache.d && cache.d[v] ? cache.d[v](this) : fn.apply(this);
                cache.m |= (1 << i);
            }
            return cache[v];
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
            if (!inst.node) {
                inst.moveTo(root, 0);
            } else if (textNode && containsOrEquals(root, textNode) && inst.offset <= textNode.length) {
                inst.moveTo(textNode, inst.offset);
            } else if (containsOrEquals(root, inst.node.element)) {
                inst.moveToText(inst.node.element, inst.wholeTextOffset);
            } else {
                var replace = {
                    node: element
                };
                inst.typer.getNode(element);
                for (; !containsOrEquals(root, replace.node) && detachedElements.has(replace.node); replace = detachedElements.get(replace.node));
                inst.moveTo(replace.node, replace.offset);
            }
        }
        return inst;
    }

    function caretSetPositionRaw(inst, node, element, textNode, offset, beforeSoftBreak) {
        var oldNode = inst.textNode || inst.element;
        var oldOffset = inst.offset;
        inst.node = node;
        inst.element = element;
        inst.textNode = textNode || null;
        inst.offset = offset;
        inst.wholeTextOffset = (textNode ? inst.offset : 0) + getWholeTextOffset(node, textNode || element);
        inst.beforeSoftBreak = !!beforeSoftBreak;
        var updated = oldNode !== (textNode || element) || oldOffset !== offset;
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
            var startY = findNearsetPoint(container, textNode, dirY, 2);
            if (!newPoint) {
                var iterator = new TyperTreeWalker(inst.typer.rootNode, NODE_ANY_BLOCK);
                iterator.currentNode = container;
                var untilY;
                while ((container = next(iterator, dirY))) {
                    var containerRect = getAbstractRect(getRect(container.element), mode);
                    var prop = dirY > 0 ? 'bottom' : 'top';
                    if (containerRect[FLIP_POS[prop]] * dirY < startY * dirY) {
                        continue;
                    }
                    if (containerRect[FLIP_POS[prop]] * dirY >= untilY * dirY) {
                        break;
                    }
                    findNearsetPoint(container, null, dirY, 1, untilY);
                    untilY = containerRect[prop];
                }
                if (!newPoint && untilY !== undefined) {
                    return caretSetPosition(inst, iterator.currentNode.element, 0);
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
            return !!node && caretSetPosition(this, node, getOffset(node, offset));
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
                    while (!(node = next(iterator, direction)) || !node.length) {
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
            document.execCommand('enableObjectResizing', false, false);
            document.execCommand('enableInlineTableEditing', false, false);
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

}(jQuery, zeta));
