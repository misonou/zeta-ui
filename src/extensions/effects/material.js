(function ($, zeta) {
    'use strict';

    var helper = zeta.helper;

    $(document.documentElement).on(zeta.IS_TOUCH ? 'touchstart' : 'mousedown', '.zeta-ui button, .zeta-ui .has-clickeffect', function (e) {
        var elm = e.currentTarget;
        var p = (e.touches || [e])[0];
        var x = p.clientX;
        var y = p.clientY;
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
        helper.always(zeta.dom.drag(e), function () {
            helper.runCSSTransition($overlay.children()[0], 'animate-out').then(function () {
                $overlay.remove();
            });
        });
    });

}(jQuery, zeta));
