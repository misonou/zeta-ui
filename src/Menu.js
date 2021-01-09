import { runCSSTransition } from "./include/zeta-dom/cssUtil.js";
import { bind, containsOrEquals, getClass, removeNode, setClass } from "./include/zeta-dom/domUtil.js";
import dom from "./include/zeta-dom/dom.js";
import { each, is, defineHiddenProperty, catchAsync } from "./include/zeta-dom/util.js";
import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";
import { position, snap } from "./util/cssUtil.js";

function getNextItem(self, cur, dir) {
    var arr = [];
    (function getButtonList(control) {
        each(control.controls, function (i, v) {
            if (v.hasRole('buttonlist') && !v.hasRole('menu')) {
                getButtonList(v);
            } else if (v.hasRole('button') && v.enabled && v.visible) {
                arr[arr.length] = v;
            }
        });
    }(self));
    var i = arr.indexOf(cur);
    return arr[i < 0 ? 0 : i + dir];
}

function showCallout(self, to, dir, within, offset) {
    var callout = self.callout;
    if (self.parent && containsOrEquals(self.element, callout)) {
        setClass(callout, 'hidden', false);
        position(callout, self.element, 'right top inset-y');
    } else {
        if (self.calloutParent) {
            snap(callout, self.calloutParent);
        } else if (is(to, Node)) {
            snap(callout, to, dir, offset);
        } else {
            position(callout, to, dir, within, offset);
        }
        dom.focus(callout);
        if (getClass(callout, 'closing')) {
            setClass(callout, 'open', false);
            setClass(callout, 'closing', false);
        }
        catchAsync(runCSSTransition(callout, 'open'));
    }
}

function hideCallout(self) {
    var callout = self.callout;
    if (self.parent && containsOrEquals(self.element, callout)) {
        setClass(callout, 'hidden', true);
    } else {
        catchAsync(runCSSTransition(callout, 'closing', function () {
            removeNode(callout);
        }));
    }
    self.activeButton = null;
}

function isSubMenu(self) {
    if (self.parent) {
        for (var cur = self.parent; cur && cur.hasRole('buttonlist') && !cur.hasRole('menu'); cur = cur.parent);
        return !cur || cur.hasRole('menu');
    }
}

const Menu = define('menu', {
    template: '<div scrollable class="zui-root zui-float"><z:buttonlist/></div>',
    waitForExecution: false,
    parseOptions: parseControlsAndExecute,
    init: function (e, self) {
        var callout = e.context.getElementForRole('menu') || self.element;
        if (isSubMenu(self)) {
            bind(self.element, {
                mouseenter: showCallout.bind(null, self),
                mouseleave: hideCallout.bind(null, self)
            });
        } else if (!self.parent && callout === self.element) {
            defineHiddenProperty(self.context, 'showMenu', showCallout.bind(null, self));
            defineHiddenProperty(self.context, 'hideMenu', hideCallout.bind(null, self));
            defineHiddenProperty(self.context, 'element', callout);
        } else {
            self.calloutParent = callout.parentNode;
            dom.retainFocus(self.element, callout);
            removeNode(callout);
        }
        bind(self.element, 'mousemove', function () {
            self.activeButton = null;
        });
        setClass(callout, 'is-' + self.type, true);
        self.callout = callout;
        self.activeButton = null;
        self.watch('activeButton', function (cur, old) {
            (old || {}).active = false;
            (cur || {}).active = true;
            (cur || self).focus();
        });
        hideCallout(self);
    },
    focusin: function (e, self) {
        if (e.source === 'keyboard' && !self.parent) {
            showCallout(self);
            self.activeButton = getNextItem(self, self, 1);
        }
    },
    focusout: function (e, self) {
        self.activeButton = null;
        if (self.hideCalloutOnBlur) {
            hideCallout(self);
        }
    },
    click: function (e, self) {
        if (!containsOrEquals(self.callout, e.target)) {
            showCallout(self);
            e.handled();
        }
    },
    keystroke: function (e, self) {
        var cur = self.activeButton;
        var dir = /^(up|down|left|right)Arrow$/.test(e.data) && RegExp.$1[0];
        if (dir === 'l') {
            if (!self.parent) {
                e.handled();
            } else if (cur) {
                hideCallout(self);
                e.handled();
            }
        } else if (dir === 'r') {
            showCallout(self);
            self.activeButton = cur || getNextItem(self, self, 1);
            e.handled();
        } else if (dir && (cur || !self.parent || self.calloutParent)) {
            self.activeButton = getNextItem(self, cur, dir === 'u' ? -1 : 1) || cur;
            e.handled();
        }
    },
    childExecuted: function (e, self) {
        self.activeButton = null;
        // @ts-ignore: type inference issue
        for (var cur = e.control; cur && cur !== self.parent; cur = cur.parent) {
            if (!cur.hideCalloutOnExecute) {
                return;
            }
        }
        hideCallout(self);
    },
    beforeDestroy: function (e, self) {
        hideCallout(self);
    }
});

export default Menu;
