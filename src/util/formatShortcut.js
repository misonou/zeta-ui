import waterpipe from "../include/external/waterpipe.js";
import { lcfirst, ucfirst } from "../include/zeta-dom/util.js";
import { IS_MAC } from "../include/zeta-dom/env.js";

const MAC_CTRLKEY = {
    ctrl: '\u2318',
    alt: '\u2325',
    shift: '\u21e7',
    enter: '\u21a9',
    tab: '\u2135',
    pageUp: '\u21de',
    pageDown: '\u21df',
    backspace: '\u232b',
    escape: '\u238b',
    leftArrow: '\u2b60',
    upArrow: '\u2b61',
    rightArrow: '\u2b62',
    downArrow: '\u2b63',
    home: '\u2b66',
    end: '\u2b68'
};

function formatShortcutWin(value) {
    return waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
        return ucfirst(v) + '+';
    });
}
function formatShortcutMac(value) {
    var flag = {};
    var str = waterpipe.string(value).replace(/ctrl|alt|shift/gi, function (v) {
        v = lcfirst(v);
        flag[v] = MAC_CTRLKEY[v];
        return '';
    });
    return (flag.alt || '') + (flag.shift || '') + (flag.ctrl || '') + (MAC_CTRLKEY[lcfirst(str)] || str);
}

const formatShortcut = IS_MAC ? formatShortcutMac : formatShortcutWin;
export default formatShortcut;
