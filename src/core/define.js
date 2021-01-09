import { definePrototype, each, extend, is, isFunction, kv, makeArray, ucfirst } from "../include/zeta-dom/util.js";
import ArgumentIterator from "./ArgumentIterator.js";
import { setDefaultTemplate } from "../renderer/default/index.js";
import UIControl, { setEventHandlers } from "./UIControl.js";
import UIControlSpecies from "./UIControlSpecies.js";
import UIToolset from "./UIToolset.js";
import { createNamedFunction } from "../util/common.js";

const definedType = {};

function defineInternal(type, options) {
    if (definedType[type]) {
        throw new Error(type + ' already defined');
    }
    var specs = extend({}, options);
    var defaultOptions = {};
    var handlers = {};
    setDefaultTemplate(type, specs.template || '', specs.templates);
    each(specs, function (i, v) {
        if (isFunction(v) && i !== 'parseOptions') {
            handlers[i] = v;
        } else if (i !== 'template' && i !== 'parseOptions') {
            defaultOptions[i] = v;
            delete specs[i];
        }
    });
    specs.defaultOptions = defaultOptions;
    setEventHandlers(type, handlers);
    return specs;
}

/**
 * @param {string} type
 * @param {ZetaUI.UIControlTypeOptions} options
 */
export function defineLayout(type, options) {
    defineInternal(type, options);
}

/**
 * @param {string} type
 * @param {ZetaUI.UIControlTypeOptions} options
 */
export function define(type, options) {
    var ctor = createNamedFunction(ucfirst(type), UIControl);
    var specs = defineInternal(type, options);
    var create = function () {
        var iter = new ArgumentIterator(makeArray(arguments));
        var name = iter.string();
        var options = {};
        if (specs.parseOptions) {
            specs.parseOptions(options, iter);
        }
        extend(options, iter.next('object') && iter.value);
        return new UIControlSpecies(is(this, UIToolset) || new UIToolset(), type, ctor, name || '', extend({}, specs.defaultOptions, options));
    };
    definePrototype(UIToolset, kv(type, create));
    definePrototype(ctor, UIControl);
    create.prototype = ctor.prototype;
    return create;
}
