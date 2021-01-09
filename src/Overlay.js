import { defineLayout } from "./core/define.js";
import { runCSSTransition } from "./include/zeta-dom/cssUtil.js";

function getOverlayElement(self) {
    return self.getElementForRole('overlay') || self.element;
}

defineLayout('overlay', {
    init: function (e, self) {
        var target = getOverlayElement(self);
        runCSSTransition(target, 'open');
    },
    focusreturn: function (e, self) {
        var target = getOverlayElement(self);
        runCSSTransition(target, 'pop', true);
    },
    beforeDestroy: function (e, self) {
        var target = getOverlayElement(self);
        return runCSSTransition(target, 'closing');
    }
});

export default null;
