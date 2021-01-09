import { is, createPrivateStore, noop } from "../include/zeta-dom/util.js";
import UIControl, { emitStateChange } from "./UIControl.js";

const FLAG_NAMES = 'enabled active visible'.split(' ');
const FLAG_ENABLED = 1;
const FLAG_ACTIVE = 2;
const FLAG_VISIBLE = 4;

const computeFn = [isEnabled, isActive, isHidden];
const _ = createPrivateStore();

function initFlagState(component, state) {
    _(component, state);
}

function getFlag(control, flag, callback) {
    var state = _(control);
    var bit = state.flag;
    var cur = (bit & flag) > 0;
    // @ts-ignore: boolean arithmetics
    if ((state.flag |= (flag << 8)) !== bit && (cur ^ !!callback(state))) {
        state.flag ^= flag;
        if (state.inited2) {
            emitStateChange(control, true);
        }
        return !cur;
    }
    return cur;
}

function setFlag(control, flag, value) {
    _(control)[FLAG_NAMES[flag >> 1]] = value;
    clearFlag(control, flag);
}

function clearFlag(control, flags) {
    _(control).flag &= 0xff;
    if (flags) {
        computeFn.forEach(function (v, i) {
            return (flags & (1 << i)) && v(control);
        });
    }
}

function isEnabled(control) {
    return getFlag(control, FLAG_ENABLED, function (state) {
        if (isDisabledByToolset(control) || !state.container.renderer.isEnabled(control)) {
            return false;
        }
        if (control.requireChildControls && (!control.controls.some(isEnabled) || control.controls.every(isHidden))) {
            return false;
        }
        return state.enabled !== false && (state.options.enabled || noop).call(control, control) !== false;
    });
}

function isActive(control) {
    return getFlag(control, FLAG_ACTIVE, function (state) {
        return state.active || (state.options.active || noop).call(control, control);
    });
}

function isHidden(control) {
    return getFlag(control, FLAG_VISIBLE, function (state) {
        if (isDisabledByToolset(control)) {
            return true;
        }
        if (!isEnabled(control)) {
            var hiddenWhenDisabled = control.hiddenWhenDisabled;
            if (hiddenWhenDisabled || (hiddenWhenDisabled !== false && control.parent && control.parent.hideDisabledChild)) {
                return true;
            }
        }
        return state.visible === false || (state.options.visible || noop).call(control, control) === false;
    });
}

function isDisabledByToolset(control) {
    return getFlag(control, 8, function (state) {
        var toolsetState = state.toolsetState;
        return toolsetState && (isEnabled(toolsetState) === false || (control.realm && !toolsetState[control.realm]));
    });
}

export {
    FLAG_ENABLED,
    FLAG_ACTIVE,
    FLAG_VISIBLE,
    initFlagState,
    clearFlag,
    setFlag,
    isEnabled,
    isActive,
    isHidden,
    isDisabledByToolset
};
