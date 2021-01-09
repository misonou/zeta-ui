import waterpipe from "../include/external/waterpipe.js";
import { definePrototype } from "../include/zeta-dom/util.js";
import { emitPropertyChange } from "./UIControl.js";

/**
 * @param {DisplayValue} self
 * @param {ZetaUI.UIControl} control
 * @param {string} prop
 * @param {boolean=} fireEvent
 */
function getValue(self, control, prop, fireEvent) {
    if (self.needEvaluate) {
        var value = waterpipe(self.displayValue, control.getTemplateContext(true));
        if (fireEvent !== false && value !== self.lastValue) {
            emitPropertyChange(control, prop, self.lastValue, value);
        }
        self.lastValue = value;
        return value;
    }
    return self.displayValue;
}

/**
 * @param {ZetaUI.UIControl} control
 * @param {string} prop
 * @param {any} rawValue
 * @param {any} displayValue
 * @param {boolean=} needEvaluate
 * @param {boolean=} fireEvent
 */
function DisplayValue(control, prop, rawValue, displayValue, needEvaluate, fireEvent) {
    var self = this;
    self.rawValue = rawValue;
    self.displayValue = displayValue;
    self.lastValue = displayValue;
    self.needEvaluate = needEvaluate;
    getValue(self, control, prop, fireEvent);
}

definePrototype(DisplayValue, {
    getValue: function (control, prop, fireEvent) {
        // @ts-ignore: type inference issue
        return getValue(this, control, prop, fireEvent);
    }
});

export default DisplayValue;
