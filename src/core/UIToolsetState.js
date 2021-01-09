import { FLAG_ENABLED, initFlagState, isEnabled, setFlag } from "./flags.js";
import { createPrivateStore, definePrototype, isFunction, pick } from "../include/zeta-dom/util.js";

const _ = createPrivateStore();

/** @type {(...args: ConstructorParameters<typeof ZetaUI.UIToolsetState>) => void} */
function UIToolsetState(container, toolset, context) {
    var self = this;
    var state = _(self, {
        container: container,
        options: toolset.options
    });
    initFlagState(self, state);
    self.name = toolset.name;
    self.context = context;
    self.all = {};
    // @ts-ignore: type inference issue
    container.add(self, pick(toolset.options, isFunction));
    container.emitAsync('contextChange', self);
}

definePrototype(UIToolsetState, {
    get enabled() {
        return isEnabled(this);
    },
    set enabled(value) {
        setFlag(this, FLAG_ENABLED, value);
    },
    on: function (event, handler) {
        return _(this).container.add(this, event, handler);
    }
});

export default UIToolsetState;
