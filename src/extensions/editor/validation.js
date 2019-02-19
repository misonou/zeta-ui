(function () {
    'use strict';

    function filter(value, options, currentLength) {
        if (options.invalidCharsRegex) {
            value = value.replace(options.invalidCharsRegex, '');
        }
        if (options.maxlength) {
            value = value.substr(0, options.maxlength - currentLength);
        }
        return value;
    }

    zeta.Editor.widgets.validation = {
        options: {
            invalidChars: '',
            allowChars: '',
            maxlength: 0
        },
        init: function (e) {
            var options = e.widget.options;
            if (options.invalidChars) {
                options.invalidCharsRegex = new RegExp('[' + options.invalidChars.replace(/[\[\]\\^]/g, '\\$&') + ']', 'g');
            }
            if (options.allowChars) {
                options.invalidCharsRegex = new RegExp('[^' + options.allowChars.replace(/[\[\]\\^]/g, '\\$&') + ']', 'g');
            }
        },
        contentChange: function (e) {
            if (e.source === 'script') {
                var value = e.typer.extractText();
                var filteredText = filter(value, e.widget.options, 0);
                if (filteredText !== value) {
                    e.typer.setValue(filteredText);
                }
            }
        },
        textInput: function (e) {
            var filteredText = filter(e.data, e.widget.options, e.typer.extractText().length - e.typer.getSelection().getSelectedText().length);
            if (filteredText !== e.data) {
                e.handled();
                if (filteredText) {
                    e.typer.invoke(function (tx) {
                        tx.insertText(filteredText);
                    });
                }
            }
        }
    };

})();
