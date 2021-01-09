import $ from "../include/external/jquery.js";
import { each, extend, is, isPlainObject, keys, matchWord, setTimeoutOnce } from "../include/zeta-dom/util.js";
import { bind, getRect, containsOrEquals, isVisible, getScrollParent, comparePosition, createTreeWalker, iterateNode, toPlainRect } from "../include/zeta-dom/domUtil.js";

const FLIP_POS = {
    top: 'bottom',
    left: 'right',
    right: 'left',
    bottom: 'top'
};
const DIR_SIGN = {
    top: -1,
    left: -1,
    right: 1,
    bottom: 1
};
const root = document.documentElement;
const snaps = new Map();

function cssFromPoint(x, y, origin, parent) {
    var refRect = getRect(is(parent || origin, Node) || window);
    var dirX = matchWord(origin || y, 'left right') || 'left';
    var dirY = matchWord(origin || y, 'top bottom') || 'top';
    var style = {};
    y = (((x.top || x.clientY || x.y || y) | 0) - refRect.top);
    x = (((x.left || x.clientX || x.x || x) | 0) - refRect.left);
    style[dirX] = (dirX === 'left' ? x : refRect.width - x) + 'px';
    style[dirY] = (dirY === 'top' ? y : refRect.height - y) + 'px';
    style[FLIP_POS[dirX]] = 'auto';
    style[FLIP_POS[dirY]] = 'auto';
    return style;
}

function position(element, to, dir, within, offset) {
    if (!containsOrEquals(root, element)) {
        document.body.appendChild(element);
    }
    $(element).css({
        position: 'fixed',
        maxWidth: '',
        maxHeight: ''
    });
    var oDirX = matchWord(dir, 'left right center') || 'left';
    var oDirY = matchWord(dir, 'top bottom center') || 'bottom';
    var inset = matchWord(dir, 'inset-x inset-y inset') || (FLIP_POS[oDirY] ? 'inset-x' : 'inset-y');
    var refRect = isPlainObject(to) || !to ? toPlainRect((to.left || to.clientX || to.x) | 0, (to.right || to.clientY || to.y) | 0) : getRect(to);
    if (offset && inset !== 'inset') {
        refRect = inset === 'inset-x' ? refRect.expand(0, offset) : refRect.expand(offset, 0);
    }
    var winRect = inset === 'inset' ? refRect.expand(-offset) : getRect(within);
    var elmRect = getRect(element, true);
    var margin = {};
    var point = {};
    var style = {
        transform: ''
    };
    var fn = function (dir, inset, p, pSize, pMax, sTransform) {
        style[pMax] = winRect[pSize] + margin[p] - margin[FLIP_POS[p]] - offset;
        if (!FLIP_POS[dir]) {
            var center = (refRect[FLIP_POS[p]] + refRect[p]) / 2;
            dir = center - winRect[p] < elmRect[pSize] / 2 ? p : winRect[FLIP_POS[p]] - center < elmRect[pSize] / 2 ? FLIP_POS[p] : '';
            if (!dir) {
                style.transform += ' ' + sTransform;
            }
            point[p] = dir ? winRect[dir] : center + margin[p];
            return dir;
        }
        // determine cases of 'normal', 'flip' and 'fit' by available rooms
        var rDir = inset ? FLIP_POS[dir] : dir;
        if (refRect[dir] * DIR_SIGN[rDir] + elmRect[pSize] <= winRect[rDir] * DIR_SIGN[rDir]) {
            point[p] = refRect[dir] + margin[FLIP_POS[rDir]];
        } else if (refRect[FLIP_POS[dir]] * DIR_SIGN[rDir] - elmRect[pSize] > winRect[FLIP_POS[rDir]] * DIR_SIGN[rDir]) {
            dir = FLIP_POS[dir];
            point[p] = refRect[dir] + margin[rDir];
        } else {
            point[p] = winRect[dir];
            style[pMax] = inset ? style[pMax] : Math.abs(refRect[dir] - point[p]) - (DIR_SIGN[dir] * margin[dir]);
            return dir;
        }
        if (!inset) {
            dir = FLIP_POS[dir];
        }
        style[pMax] = Math.abs(winRect[FLIP_POS[dir]] - point[p]);
        return dir;
    };

    var elmRectNoMargin = getRect(element);
    keys(FLIP_POS).forEach(function (v) {
        margin[v] = elmRect[v] - elmRectNoMargin[v];
    });
    var dirX = fn(oDirX, FLIP_POS[oDirY] && inset === 'inset-x', 'left', 'width', 'maxWidth', 'translateX(-50%)');
    var dirY = fn(oDirY, FLIP_POS[oDirX] && inset === 'inset-y', 'top', 'height', 'maxHeight', 'translateY(-50%)');
    $(element).css(extend(style, cssFromPoint(point, dirX + ' ' + dirY)));
}

function snapToElement(element, options) {
    if (isVisible(element) && (options.to === window || isVisible(options.to))) {
        var dir = options.dir;
        if (dir === 'auto') {
            if (options.to === window) {
                dir = 'center inset';
            } else {
                var scrollParent = getScrollParent(options.to);
                var winRect = getRect();
                var rect = getRect(scrollParent === root ? options.to : root);
                var area = [winRect.height * (rect.left - winRect.left), winRect.height * (winRect.right - rect.right), winRect.width * (rect.top - winRect.top), winRect.width * (winRect.bottom - rect.bottom)];
                dir = 'left right top bottom'.split(' ')[area.indexOf(Math.max.apply(null, area))] + ' center';
            }
        }
        position(element, options.to, dir, window, options.margin);
    }
}

function snap(element, to, dir, margin) {
    to = to || root;
    var prop = {
        to: to,
        dir: dir || 'left bottom',
        margin: margin || 0
    };
    snaps.set(element, prop);
    if (!containsOrEquals(root, element)) {
        document.body.appendChild(element);
    }
    setZIndexOver(element, to === window ? document.body : to);
    snapToElement(element, prop);
}

function unsnap(element) {
    snaps.delete(element);
}

function getZIndex(element, pseudo) {
    var style = getComputedStyle(element, pseudo || null);
    return matchWord(style.position, 'absolute fixed relative') && style.zIndex !== 'auto' ? parseInt(style.zIndex) : -1;
}

function getZIndexOver(over) {
    var maxZIndex = -1;
    var iterator = createTreeWalker(document.body, 1, function (v) {
        if (comparePosition(v, over, true)) {
            return 2;
        }
        var zIndex = getZIndex(v);
        if (zIndex >= 0) {
            maxZIndex = Math.max(maxZIndex, zIndex);
            return 2;
        }
        maxZIndex = Math.max(maxZIndex, getZIndex(v, '::before'), getZIndex(v, '::after'));
        return 1;
    });
    iterateNode(iterator);
    return maxZIndex + 1;
}

function setZIndexOver(element, over) {
    element.style.zIndex = getZIndexOver(over);
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
}

function updateSnaps() {
    each(snaps, snapToElement);
}

bind(window, 'resize scroll orientationchange mousemove wheel keyup touchend transitionend', function () {
    setTimeoutOnce(updateSnaps);
}, { passive: true });

export {
    getZIndex,
    getZIndexOver,
    setZIndexOver,
    position,
    snap,
    unsnap
};
