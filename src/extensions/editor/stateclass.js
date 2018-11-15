(function ($, zeta) {
    'use strict';

    var helper = zeta.helper;

    function toggleClass(widget, className, value) {
        var options = widget.options;
        if (options[className]) {
            helper.setState(helper.is(options.target, Node) || $(widget.typer.element).parents(options.target).addBack()[0], options[className], value);
        }
    }

    zeta.Editor.widgets.stateclass = {
        options: {
            target: null,
            disabled: 'disabled',
            focused: 'focused',
            empty: 'empty'
        },
        focusin: function (e) {
            toggleClass(e.widget, 'focused', true);
        },
        focusout: function (e) {
            toggleClass(e.widget, 'focused', false);
        },
        stateChange: function (e) {
            toggleClass(e.widget, 'disabled', !e.typer.enabled());
        },
        typing: function (e) {
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        },
        contentChange: function (e) {
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        },
        init: function (e) {
            toggleClass(e.widget, 'empty', !e.typer.hasContent());
        }
    };

}(jQuery, zeta));
