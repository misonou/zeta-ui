(function ($, zeta) {
    'use strict';

    var helper = zeta.helper;

    function toggleClass(widget, className, value) {
        var target = widget.options.target;
        helper.setState(helper.is(target, Node) || $(widget.typer.element).parents(target).addBack()[0], widget.options[className], value);
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
