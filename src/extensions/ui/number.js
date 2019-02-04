(function ($, zeta) {
    'use strict';

    function setValue(widget, value) {
        if (value === null || value === '' || isNaN(value)) {
            value = value ? '0' : '';
        } else {
            var min = widget.options.min;
            var max = widget.options.max;
            var loop = widget.options.loop && min !== null && max !== null;
            if ((loop && value < min) || (!loop && max !== null && value > max)) {
                value = max;
            } else if ((loop && value > max) || (!loop && min !== null && value < min)) {
                value = min;
            }
            value = String(+value | 0);
        }
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

    function stepValue(tx) {
        setValue(tx.widget, (tx.typer.getValue() || 0) + (tx.commandName === 'stepUp' ? 1 : -1) * tx.widget.options.step);
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
                var value = parseInt(this.extractText());
                return isNaN(value) ? null : value;
            },
            setValue: function (preset, value) {
                setValue(preset, value);
            }
        },
        commands: {
            stepUp: stepValue,
            stepDown: stepValue
        },
        contentChange: function (e) {
            if (e.source !== 'keyboard') {
                setValue(e.widget, e.typer.getValue());
            }
        }
    };

    zeta.UI.define('number', {
        template: '<z:textbox/>',
        preventLeave: true,
        value: null,
        preset: preset
    });

}(jQuery, zeta));
