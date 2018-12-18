(function ($, zeta) {
    'use strict';

    var helper = zeta.helper;

    function createRipple(elm, x, y, until) {
        var rect = helper.getRect(elm);
        var p1 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.left, 2);
        var p2 = Math.pow(y - rect.top, 2) + Math.pow(x - rect.right, 2);
        var p3 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.left, 2);
        var p4 = Math.pow(y - rect.bottom, 2) + Math.pow(x - rect.right, 2);
        var scalePercent = 0.5 + 2 * Math.sqrt(Math.max(p1, p2, p3, p4)) / parseFloat($.css(elm, 'font-size'));

        var $overlay = $('<div class="zeta-clickeffect"><i></i></div>').appendTo(elm);
        var $anim = $overlay.children().css({
            top: y - rect.top,
            left: x - rect.left,
        });
        setTimeout(function () {
            $anim.css('transform', $anim.css('transform') + ' scale(' + scalePercent + ')').addClass('animate-in');
        });
        $overlay.css('border-radius', $.css(elm, 'border-radius'));
        helper.always(until, function () {
            helper.runCSSTransition($overlay.children()[0], 'animate-out', function () {
                $overlay.remove();
            });
        });
    }

    helper.bind(window, zeta.IS_TOUCH ? 'touchstart' : 'mousedown', function (e) {
        var p = (e.touches || [e])[0];
        for (var elm = e.target; elm; elm = elm.parentNode) {
            if (helper.is(elm, '.zeta-ui button, .zeta-ui .has-clickeffect')) {
                createRipple(elm, p.clientX, p.clientY, zeta.dom.drag(e));
                return;
            }
        }
    });

}(jQuery, zeta));
