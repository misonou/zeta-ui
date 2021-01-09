import { containsOrEquals } from "../include/zeta-dom/domUtil.js";
import UIControlSpecies from "../core/UIControlSpecies.js";

export function parseExecute(options, iter) {
    options.execute = iter.fn();
}

export function parseControlsAndExecute(options, iter) {
    options.controls = iter.nextAll(UIControlSpecies);
    parseExecute(options, iter);
}

export function parseIconAndExecute(options, iter) {
    options.icon = iter.string();
    parseExecute(options, iter);
}

/**
 * @param {Zeta.ZetaEvent & ZetaUI.UIEventContext} e
 * @param {string} role
 */
export function shouldExecuteOnClick(e, role) {
    var elm = e.context.getElementForRole(role);
    return elm && containsOrEquals(elm, e.target);
}
