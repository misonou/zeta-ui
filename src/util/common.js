import waterpipe from "../include/external/waterpipe.js";
import { each } from "../include/zeta-dom/util.js";

export function copy(dst, src) {
    // use each() instead of extend()
    // to ensure all values copied even if the value is undefined
    each(src, function (i, v) {
        dst[i] = v;
    });
    return dst;
}

export function eachAttr(node, callback) {
    each(node.attributes, function (i, v) {
        callback(v.nodeName, v.value, v);
    });
}

export function parseTemplateConstant(value) {
    return waterpipe.eval('"' + value + '"');
}

export function createNamedFunction(name, body) {
    if (!/^[$_a-z][$_a-z0-9]*$/i.test(name)) {
        throw new Error('Invalid function name \'' + name + '\'');
    }
    return new Function('fn', 'return function ' + name + '() { return fn.apply(this, arguments) }')(body);
}
