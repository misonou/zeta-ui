import { createPrivateStore, definePrototype, each, extend } from "../include/zeta-dom/util.js";
import { clearFlag, FLAG_ACTIVE, FLAG_ENABLED, FLAG_VISIBLE, isDisabledByToolset } from "./flags.js";
import { foreachControl } from "./UIControl.js";

/** @type {Zeta.PrivateStore<UIContext, (a: UIContext) => Internal.UIEventContainer>} */
const _ = createPrivateStore();

/** @class */
function UIContext(getContainer, values) {
    extend(this, values);
    _(this, getContainer);
}

definePrototype(UIContext, {
    toJSON: function () {
        return extend({}, this);
    },
    update: function (values) {
        var container = _(this)(this);
        extend(this, values);
        each(container.toolsetStates, function (i, v) {
            clearFlag(v, FLAG_ENABLED);
            container.emitAsync('contextChange', v);
        });
        foreachControl(container.control, function (v) {
            clearFlag(v, FLAG_ENABLED | FLAG_ACTIVE | FLAG_VISIBLE);
            if (!isDisabledByToolset(v)) {
                container.emitAsync('contextChange', v);
            }
        });
        container.flushEvents();
    },
    validate: function () {
        return _(this)(this).control.validate();
    },
    reset: function () {
        _(this)(this).control.reset();
    }
});

export default UIContext;
