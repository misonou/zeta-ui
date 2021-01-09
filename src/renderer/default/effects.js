import $ from "../../include/external/jquery.js";
import { runCSSTransition } from "../../include/zeta-dom/cssUtil.js";
import { always } from "../../include/zeta-dom/util.js";
import { bind, getRect } from "../../include/zeta-dom/domUtil.js";
import { IS_TOUCH } from "../../include/zeta-dom/env.js";
import dom from "../../include/zeta-dom/dom.js";

function createRipple(elm, x, y, until) {
    var rect = getRect(elm);
    var p1 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.left, 2);
    var p2 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.right, 2);
    var p3 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.left, 2);
    var p4 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.right, 2);
    var scalePercent = 0.5 + 2 * Math.sqrt(Math.max(p1, p2, p3, p4)) / parseFloat($.css(elm, 'font-size'));

    var $overlay = $('<div class="zui-clickeffect"><i></i></div>').appendTo(elm);
    var $anim = $overlay.children().css({
        top: y - rect.top,
        left: x - rect.left,
    });
    setTimeout(function () {
        $anim.css('transform', $anim.css('transform') + ' scale(' + scalePercent + ')').addClass('animate-in');
    });
    $overlay.css('border-radius', $.css(elm, 'border-radius'));
    always(until, function () {
        runCSSTransition($overlay.children()[0], 'animate-out', function () {
            $overlay.remove();
        });
    });
}

bind(window, IS_TOUCH ? 'touchstart' : 'mousedown', function (e) {
    // @ts-ignore: type inference issue
    var elm = $(e.target).closest('.zui-root .zui-button, .zui-root .zui-buttonlike')[0];
    if (elm) {
        // @ts-ignore: e can be TouchEvent
        var p = (e.touches || [e])[0];
        createRipple(elm, p.clientX, p.clientY, dom.beginDrag());
    }
});

export default null;
