(function () {
    'use strict';

    function setValue(widget, value, isKeyboardEvent) {
        if (value === null || value === '' || isNaN(value)) {
            value = value ? '0' : '';
            widget.value = null;
        } else {
            var min = parseInt(widget.options.min);
            var max = parseInt(widget.options.max);
            var loop = widget.options.loop && min === min && max === max;
            if ((loop && value < min) || (!loop && max === max && value > max)) {
                value = max;
            } else if ((loop && value > max) || (!loop && min === min && value < min)) {
                value = min;
            }
            widget.value = +value | 0;
            value = String(+value | 0);
        }
        var numOfDigits = String(+widget.options.max || 0).length;
        var currentText = widget.typer.extractText();
        if (widget.options.digits === 'fixed') {
            value = (new Array(numOfDigits + 1).join('0') + value).substr(-numOfDigits);
        }
        if (value !== currentText && (!isKeyboardEvent || currentText.length >= numOfDigits)) {
            widget.typer.invoke(function (tx) {
                tx.selection.selectAll();
                tx.insertText(value);
            });
        }
    }

    function stepValue(tx) {
        setValue(tx.widget, (tx.widget.value || 0) + (tx.commandName === 'stepUp' ? 1 : -1) * tx.widget.options.step);
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
                return preset.value;
            },
            setValue: function (preset, value) {
                setValue(preset, value);
            }
        },
        commands: {
            stepUp: stepValue,
            stepDown: stepValue
        },
        focusout: function (e) {
            setValue(e.widget, e.widget.value);
        },
        contentChange: function (e) {
            setValue(e.widget, parseInt(e.typer.extractText()), e.source === 'keyboard');
        }
    };

    zeta.UI.define('number', {
        template: '<z:textbox/>',
        preventLeave: true,
        value: null,
        preset: preset
    });

})();
