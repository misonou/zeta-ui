import $ from "../include/external/jquery.js";
import { createPrivateStore, definePrototype, extend, inherit, is, isFunction, isPlainObject, pick, ucfirst } from "../include/zeta-dom/util.js";
import { createNamedFunction } from "../util/common.js";
import { createContext, foreachControl } from "./UIControl.js";
import UIToolset from "./UIToolset.js";

const _ = createPrivateStore();

/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIControlSpecies>) => void} */
function UIControlSpecies(toolset, type, baseClass, name, options) {
    var ctor = createNamedFunction(ucfirst(name ? type + '_' + name.replace(/[^a-z0-9]+/gi, '_') : type), baseClass);
    definePrototype(ctor, baseClass);
    options = extend({}, options);

    var self = this;
    self.name = name || '';
    self.type = type;
    _(self, {
        ctor: ctor,
        toolset: toolset,
        type: type,
        name: name || options.name || type,
        options: options,
        handlers: pick(options, isFunction),
        defaultExport: options.defaultExport || ('value' in options && 'value')
    });
}

definePrototype(UIControlSpecies, {
    all: function (control) {
        var ctor = _(this).ctor;
        var arr = [];
        foreachControl(control, function (v) {
            if (is(v, ctor)) {
                arr[arr.length] = v;
            }
        });
        return arr;
    },
    clone: function (initData) {
        var clone = inherit(UIControlSpecies, this);
        var cloneData = extend({}, _(this));
        cloneData.options = extend({}, cloneData.options, initData);
        _(clone, cloneData);
        return clone;
    },
    render: function (element, props) {
        if (isPlainObject(element)) {
            props = element;
            element = document.createElement('div');
        } else if (typeof element === 'string') {
            element = $(element)[0];
        }
        // @ts-ignore: type inference issue
        return createContext(_, this, UIToolset.defaultRenderer, element, props);
    }
});

export default UIControlSpecies;
