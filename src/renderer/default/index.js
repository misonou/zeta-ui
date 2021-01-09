import waterpipe from "../../include/external/waterpipe.js";
import $ from "../../include/external/jquery.js";
import { createNodeIterator, createTreeWalker, iterateNode, iterateNodeToArray, removeNode, setClass, tagName } from "../../include/zeta-dom/domUtil.js";
import { any, camel, definePrototype, each, extend, hasOwnProperty, hyphenate, inherit, is, keys, mapGet, matchWord, single } from "../../include/zeta-dom/util.js";
import { eachAttr, parseTemplateConstant } from "../../util/common.js";
import { clearFlag } from "../../core/flags.js";
import UIToolset from "../../core/UIToolset.js";
import formatShortcut from "../../util/formatShortcut.js";
import _effects from "./effects.js";

const BOOL_ATTRS = 'checked selected disabled readonly multiple ismap';
const RE_PIPE = /\{\{((?:[^\}]|\}(?!\}))+)\}\}/;

/** @type {WeakMap<any, DOMState>} */
const states = new WeakMap();
const parsedTemplates = new WeakMap();
const defaultTemplates = {};
const overrideTemplates = {};

waterpipe.pipes[':zui-shortcut'] = formatShortcut;

/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function DOMState() {
    this.position = null;
    this.current = null;
    this.layouts = {};
}

function _(control) {
    return mapGet(states, control, DOMState);
}

function createDocumentFragment(content) {
    // @ts-ignore: type inference issue
    return is(content, DocumentFragment) || $(document.createDocumentFragment()).append(content)[0];
}

function parseTemplate(template, templates, cacheKeyObj, parentTemplateName) {
    var cached = mapGet(parsedTemplates, cacheKeyObj || templates, Object)[template];
    if (cached) {
        return cached;
    }

    var index = 0;
    var binds = { 0: [] };
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
        return single(roles, function (v, i) {
            return hasOwnProperty(templates, i) && i;
        });
    }

    function includeTemplate(name, node) {
        // prevent infinite recursion when mentioning the original template in overriden definition
        var haystack = parentTemplateName === name ? Object.getPrototypeOf(templates) : templates;
        var includeTemplate = (haystack[name] || '<div><children controls/></div>');

        // replace children placeholder with the actual child contents
        var tmp = $.parseHTML(includeTemplate)[0];
        $('children', tmp).each(function (i, v) {
            // @ts-ignore: type inference issue
            var childNodes = createDocumentFragment(v.attributes.controls && !node.childNodes[0] ? [document.createElement('controls')] : node.cloneNode(true).childNodes);
            var $controls = $('controls', childNodes);
            eachAttr(v, function (i, v) {
                $controls.attr(i, v);
            });
            $(v).replaceWith(childNodes);
        });
        // @ts-ignore: tmp is element
        includeTemplate = tmp.outerHTML;

        // check whether we can use cached template from parent
        // if such cached template does not refer to altered template by current template definitions
        var cacheKeyObj = templates;
        for (var parent = templates; parent; parent = Object.getPrototypeOf(parent)) {
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
                context[camel(i)] = !expr ? parseTemplateConstant(v) : {
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
        $(dom).addClass('zui-' + name.toLowerCase());
        return dom;
    }

    function processDOM(element) {
        var nodeToReplace = new Map();
        var iterator = createTreeWalker(element, 5, function (v) {
            // @ts-ignore: tagName return empty for non-element
            if (/z\:([\w-]+)/.test(tagName(v))) {
                nodeToReplace.set(v, includeTemplate(camel(RegExp.$1), v));
                return 2;
            }
            return 1;
        });

        iterateNode(iterator, function (v) {
            if (v.nodeType === 1) {
                eachAttr(v, function (i, w, attr) {
                    if (RE_PIPE.test(w) && (!matchWord(i, 'class style') || !extractPartialBinds(attr))) {
                        addBind(index, w, i, matchWord(i, BOOL_ATTRS) && i in v ? 'prop' : 'attr');
                        attr.value = '';
                    }
                });
                index++;
                // @ts-ignore: v is text node
            } else if (RE_PIPE.test(v.data)) {
                if (v.previousSibling || v.nextSibling) {
                    // @ts-ignore: v is text node
                    addBind(index, v.data);
                    nodeToReplace.set(v, document.createElement('span'));
                    index++;
                } else {
                    // @ts-ignore: v is text node
                    addBind(index - 1, v.data);
                }
                // @ts-ignore: v is text node
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
    } while (cacheKeyObj !== defaultTemplates && !hasOverrideTemplate(cacheKeyObj, roles) && (cacheKeyObj = Object.getPrototypeOf(cacheKeyObj)));
    return result;
}

function evalTemplate(expression, context, globals, evalAsObject) {
    var options = { globals };
    return evalAsObject ? waterpipe.eval(expression.slice(2, -2), context, options) : waterpipe(expression, context, options);
}


/* --------------------------------------
 * UIControlDOM
 * -------------------------------------- */

function UIControlDOM(control, layoutType) {
    var self = this;
    var template = parseTemplate(control.template || '<z:' + hyphenate(control.type) + '/>', overrideTemplates[layoutType] || defaultTemplates);
    var element = template.dom.cloneNode(true);
    var nodes = iterateNodeToArray(createNodeIterator(element, 1));
    var bindedNode = nodes.filter(function (v, i) {
        return template.binds[i];
    });
    var positions = waterpipe.eval('sortby [ ! condition ]', $('controls', element).map(function (i, v) {
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
        $(element).addClass(control.cssClass);
    }
    _(control).current = self;

    // bind all defined event handlers to the cloned element
    // assign element to control so that handlers can be registered to correct element
    control.element = element;
    control.on('stateChange', function () {
        // @ts-ignore: type inference issue
        self.update();
    });
}

definePrototype(UIControlDOM, {
    update: function () {
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
                        return setClass(node, v.name, value);
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
        setClass(element, {
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
            each(control.controls, function (i, v) {
                map.set(v.element, i);
            });
            // perform bubble sort for controls in each position
            each(self.positions, function (k, v) {
                for (var j = v.count - 1; j > 0; j--) {
                    // @ts-ignore: type inferene issue
                    for (var i = 0, cur = v.start; i < j; i++, cur = cur.nextSibling) {
                        if (map.get(cur) > map.get(cur.nextSibling)) {
                            // @ts-ignore: type inferene issue
                            $(cur.nextSibling).insertBefore(cur);
                            // @ts-ignore: type inferene issue
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
        each(control.controls, function (i, v) {
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
    eachAttr(placeholder, function (i, v) {
        context[camel(i)] = parseTemplateConstant(v);
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
        parentState.current = { positions: [] };
    }

    // compute and update if this control should be positioned in different location
    var positions = parentState.current.positions;
    var prevPos = state.position;
    var nextPos;
    if (!positions[0]) {
        nextPos = new UIControlDOMPosition(parent);
        // @ts-ignore: fallback for parent with no type
        nextPos.layoutType = parent.type || '';
        $(nextPos.placeholder).appendTo(parent.element);
        positions[0] = nextPos;
    } else {
        var context = control.getTemplateContext();
        nextPos = any(positions, function (v) {
            return !v.condition || waterpipe.eval(v.condition, context);
        });
        // clear flags because the state may be invalid when building control tree
        clearFlag(control);
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
            state.current = next;
            // @ts-ignore: internal update read-only property
            control.element = next.element;
        }
        var element = control.element;
        if (!nextPos.count) {
            $(nextPos.start).replaceWith(element);
            nextPos.start = nextPos.end = element;
        } else {
            $(element).insertAfter(nextPos.end);
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
    var pos = mapGet(states, control, DOMState).position;
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

/** @type {ZetaUI.UIControlRenderer} */
const defaultRenderer = {
    append: appendControl,
    remove: removeControl,
    getElementForRole: function (control, role) {
        var dom = _(control).current;
        return dom.bindedNode[keys(dom.binds).indexOf(String(dom.roles[role]))];
    },
    getRoles: function (control) {
        var dom = _(control).current;
        return keys(dom.roles);
    },
    isEnabled: function (control) {
        var pos = _(control).position;
        return !pos || pos.enabled;
    }
};
export default defaultRenderer;

export function setDefaultTemplate(type, template, overrides) {
    defaultTemplates[type] = template;
    overrideTemplates[type] = overrides && inherit(defaultTemplates, overrides);
}
