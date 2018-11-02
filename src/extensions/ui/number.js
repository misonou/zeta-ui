(function ($, zeta) {
    'use strict';

    function setValueAndUpdate(widget, value) {
        value = +value || 0;
        var min = widget.options.min;
        var max = widget.options.max;
        var loop = widget.options.loop && min !== null && max !== null;
        if ((loop && value < min) || (!loop && max !== null && value > max)) {
            value = max;
        } else if ((loop && value > max) || (!loop && min !== null && value < min)) {
            value = min;
        }
        value = String(+value || 0);
        if (widget.options.digits === 'fixed') {
            var numOfDigits = String(+widget.options.max || 0).length;
            value = (new Array(numOfDigits + 1).join('0') + value).substr(-numOfDigits);
        }
        if (value !== widget.typer.extractText()) {
            widget.typer.invoke(function (tx) {
                tx.selection.selectAll();
                tx.insertText(value);
            });
        }
    }

    function setValue(widget, delta) {
        setValueAndUpdate(widget, (widget.typer.getValue() || 0) + (delta || 0) * widget.options.step);
    }

    var preset = {
        validation: {
            allowChars: '0-9'
        },
        options: {
            max: null,
            min: null,
            digits: 'auto',
            step: 1,
            loop: false
        },
        overrides: {
            getValue: function (preset) {
                return parseInt(this.extractText());
            },
            setValue: function (preset, value) {
                setValueAndUpdate(preset, value);
            },
            hasContent: function () {
                return !!this.extractText();
            },
            validate: function (preset) {
                return true;
            }
        },
        focusout: function (e) {
            setValue(e.widget);
        },
        mousewheel: function (e) {
            setValue(e.widget, -e.data);
            e.handled();
        },
        upArrow: function (e) {
            setValue(e.widget, 1);
            e.handled();
        },
        downArrow: function (e) {
            setValue(e.widget, -1);
            e.handled();
        },
        contentChange: function (e) {
            if (e.source !== 'keyboard') {
                setValue(e.widget);
            }
        }
    };

    zeta.UI.define('number', {
        template: '<z:textbox/>',
        preventLeave: true,
        value: 0,
        preset: preset
    });

}(jQuery, zeta));
