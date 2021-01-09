import { define } from "./core/define.js";
import UIControlSpecies from "./core/UIControlSpecies.js";
import _ButtonLike from "./ButtonLike.js";

const Callout = define('callout', {
    template: '<div><controls of="not parent.alwaysShowCallout && parent.controls where enabled as _enabled && _enabled.length == 1 && _enabled.0.id == id"></controls><z:buttonlike class="hidden:{{[ not alwaysShowCallout ] && controls where enabled length == 1}}"><z:label></z:label></z:buttonlike><z:menu></z:menu></div>',
    requireChildControls: true,
    hideCalloutOnExecute: true,
    hideCalloutOnBlur: true,
    alwaysShowCallout: true,
    parseOptions: function (options, iter) {
        options.icon = iter.string();
        options.controls = iter.nextAll(UIControlSpecies);
    }
});

export default Callout;
