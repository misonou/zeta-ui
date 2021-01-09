import { definePrototype, each, extend, isPlainObject, kv } from "../include/zeta-dom/util.js";
import { define } from "./define.js";
import UIControl, { exportControls, hasRole, setEventHandlers } from "./UIControl.js";
import UIControlSpecies from "./UIControlSpecies.js";

const exportedLabels = {};

function addLabels(obj, language, key, value) {
    if (isPlainObject(key)) {
        each(key, addLabels.bind(null, obj, language));
    } else {
        var dict = obj[key] || (obj[key] = {});
        dict[language || 'default'] = value;
    }
}

/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIToolset>) => void} */
function UIToolset(name, options) {
    var self = this;
    var labels = name ? exportedLabels[name] || (exportedLabels[name] = {}) : {};
    self.name = name || '';
    self.labels = labels;
    self.options = extend({}, options);
    addLabels(labels, 'default', self.options.labels || {});
}

definePrototype(UIToolset, {
    use: function () {
        return this;
    },
    on: function (event, handler) {
        extend(this.options, isPlainObject(event) || kv(event, handler));
    },
    i18n: function (language, key, value) {
        addLabels(this.labels, language, key, value);
    },
    import: function (id, options) {
        // @ts-ignore: type inference issue
        return new UIControlSpecies(this, 'import', UIControl, id, options || {});
    },
    export: function () {
        // @ts-ignore: type inference issue
        exportControls.apply(null, arguments);
    }
});

extend(UIToolset, {
    define: define,
    hasRole: hasRole,
    i18n: function (toolset, language, key, value) {
        var dict = exportedLabels[toolset] || (exportedLabels[toolset] = {});
        addLabels(dict, language, key, value);
    }
});

export default UIToolset;
