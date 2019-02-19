(function () {
    'use strict';

    var SHOW_DIALOG = zeta.IS_TOUCH;

    var helper = zeta.helper;
    var dom = zeta.dom;
    var ui = new zeta.UI('zeta.ui.keyword');
    var activeInput;
    var activeDialog;
    var callout;

    function initCallout() {
        callout = ui.menu(
            ui.dropdown({
                template: '<z:buttonlist/>',
                execute: function (self) {
                    insertItem(callout.preset, self.value);
                    callout.preset.typer.focus();
                },
                contextChange: function (e, self) {
                    self.choices = self.context.suggestions;
                }
            }), {
                hideCalloutOnBlur: false,
                hideCalloutOnExecute: false
            }
        ).render();
    }

    function encode(v, keepWS) {
        var a = document.createTextNode(keepWS ? v : v.replace(/\s/g, '\u00a0')),
            b = document.createElement('div');
        b.appendChild(a);
        return b.innerHTML;
    }

    function toValue(v) {
        return v.value;
    }

    function toValueObject(v) {
        if (typeof v !== 'object') {
            return {
                value: v,
                label: v
            };
        }
        return v;
    }

    function sortValues(a, b) {
        return a.value.localeCompare(b.value);
    }

    function valueChanged(x, y) {
        return x.length !== y.length || x.some(function (v) {
            return y.indexOf(v) < 0;
        });
    }

    function fuzzyMatch(haystack, needle) {
        haystack = String(haystack || '');
        var vector = [];
        var str = haystack.toLowerCase();
        var j = 0;
        var lastpos = -1;
        for (var i = 0; i < needle.length; i++) {
            var l = needle.charAt(i).toLowerCase();
            if (l == ' ') {
                continue;
            }
            j = str.indexOf(l, j);
            if (j == -1) {
                return {
                    firstIndex: Infinity,
                    consecutiveMatches: -1,
                    formattedText: haystack
                };
            }
            vector[vector.length] = j - lastpos - 1;
            lastpos = j++;
        }
        var firstIndex = vector[0];
        var consecutiveMatches = /^(0+)/.test(vector.slice(0).sort().join('')) && RegExp.$1.length;
        var formattedText = '';
        j = 0;
        for (i = 0; i < vector.length; i++) {
            formattedText += haystack.substr(j, vector[i]) + '**' + haystack[j + vector[i]] + '**';
            j += vector[i] + 1;
        }
        formattedText += haystack.slice(j);
        return {
            firstIndex: firstIndex,
            consecutiveMatches: consecutiveMatches,
            formattedText: formattedText.replace(/\*\*(\ *)\*\*/g, '$1')
        };
    }

    function getSuggestions(preset, value, exclude) {
        var suggestions = preset.options.suggestions || preset.options.allowedValues || [];
        if (helper.isFunction(suggestions)) {
            suggestions = suggestions(value);
        }
        return helper.when(suggestions).then(function (suggestions) {
            suggestions = suggestions.map(toValueObject);
            suggestions.forEach(function (v) {
                preset.knownValues[v.value] = v.label;
            });
            if (exclude) {
                suggestions = suggestions.filter(function (v) {
                    return exclude.indexOf(v.value) < 0;
                });
            }
            return suggestions;
        });
    }

    function processSuggestions(suggestions, needle, count) {
        suggestions = suggestions.filter(function (v) {
            helper.extend(v, fuzzyMatch(v.label, needle));
            [v.value].concat(v.matches || []).forEach(function (w) {
                var m = fuzzyMatch(w, needle);
                v.firstIndex = Math.min(v.firstIndex, m.firstIndex);
                v.consecutiveMatches = Math.max(v.consecutiveMatches, m.consecutiveMatches);
            });
            return v.firstIndex !== Infinity;
        });
        suggestions.sort(function (a, b) {
            return ((b.consecutiveMatches - a.consecutiveMatches) + (a.firstIndex - b.firstIndex)) || sortValues(a, b);
        });
        return suggestions.slice(0, count);
    }

    function showSuggestions(preset) {
        var value = preset.typer.extractText();
        var promise = getSuggestions(preset, value, preset.typer.getValue());
        promise.then(function (suggestions) {
            if (preset.typer.focused()) {
                suggestions = processSuggestions(suggestions, value, preset.options.suggestionCount);
                if (value && preset.options.allowFreeInput && !suggestions.some(function (v) {
                    return v.label === value;
                })) {
                    suggestions.push({
                        value: value,
                        label: value,
                        formattedText: '*' + value + '*'
                    });
                }
                if (!callout) {
                    initCallout();
                }
                callout.preset = preset;
                callout.suggestions = suggestions.map(function (v) {
                    return {
                        value: v.value,
                        label: v.formattedText,
                        icon: v.icon || ''
                    };
                });
                callout.update();
                dom.retainFocus(preset.typer.element, callout.element);
                callout.showMenu(preset.typer.element);
                preset.typer.focus();
            }
        });
    }

    function showSuggestionDialog(preset, control) {
        var knownValues = getSuggestions(preset);
        activeDialog = true;
        ui.dialog({
            title: control.label,
            description: control.placeholder,
            controls: [
                ui.textbox('newValue', {
                    enter: function (e, self) {
                        self.all.list.append(ui.checkbox({
                            label: self.value,
                            entry: self.value,
                            value: true,
                            description: 'new value',
                            before: '*'
                        }));
                        return self.execute();
                    },
                    visible: function () {
                        return preset.options.allowFreeInput;
                    }
                }),
                ui.buttonlist('list', {
                    templates: {
                        checkbox: '<z:checkbox show-icon="true"/>'
                    }
                }),
                ui.buttonset(
                    ui.submit('done', 'done'),
                    ui.button('cancel', 'close', function (self) {
                        self.all.dialog.destroy();
                    })
                )
            ],
            childExecuted: function (e, self) {
                self.value = self.all.list.controls.filter(function (v) {
                    return v.value;
                }).map(function (v) {
                    return v.entry;
                });
            },
            init: function (e, self) {
                var currentValues = preset.typer.getValue();
                self.all.dialog.value = currentValues.slice(0);

                knownValues.then(function (knownValues) {
                    var allValues = knownValues.map(toValue);
                    knownValues = knownValues.concat(currentValues.filter(function (v) {
                        return allValues.indexOf(v) < 0;
                    }).map(toValueObject));
                    knownValues.sort(sortValues);
                    self.all.list.append(knownValues.map(function (v) {
                        var checked = currentValues.indexOf(v.value) >= 0;
                        return ui.checkbox({
                            label: v.label,
                            icon: v.icon,
                            entry: v.value,
                            value: checked,
                            before: checked ? '*' : ''
                        });
                    }));
                });
            },
            destroy: function (e, self) {
                activeDialog = false;
            }
        }).render().dialog.then(function (values) {
            preset.typer.setValue(values);
        });
    }

    function insertItem(preset, value) {
        if (!value || preset.typer.getValue().indexOf(value.value || value) >= 0) {
            return;
        }
        if (typeof value !== 'object') {
            value = {
                value: value,
                label: preset.knownValues[value] || value
            };
        }
        var span = $('<span class="zeta-keyword" data-value="' + encode(value.value, true) + '">' + encode(value.label) + '<i>delete</i></span>')[0];
        var lastChild = preset.typer.rootNode.lastChild;
        preset.typer.invoke(function (tx) {
            tx.selection.selectAll();
            if (lastChild) {
                tx.selection.baseCaret.moveTo(lastChild.element, false);
            }
            tx.insertHtml(span);
        });
        if (!preset.options.allowFreeInput) {
            getSuggestions(preset, value.value).then(function () {
                if (!preset.knownValues[value.value]) {
                    $(span).addClass('invalid');
                }
            });
        }
    }

    var preset = {
        options: {
            required: false,
            allowFreeInput: true,
            allowedValues: null,
            suggestionCount: 5,
            suggestions: false
        },
        overrides: {
            getValue: function (preset) {
                return $('span', this.element).map(function (i, v) {
                    return String($(v).data('value'));
                }).get();
            },
            setValue: function (preset, values) {
                values = (helper.isArray(values) || String(values).split(/\s+/)).filter(function (v) {
                    return v;
                });
                if (valueChanged(values, this.getValue())) {
                    this.invoke(function (tx) {
                        tx.selection.selectAll();
                        tx.insertText('');
                        values.forEach(function (v) {
                            insertItem(preset, v);
                        });
                    });
                }
            },
            validate: function (preset) {
                if (preset.options.required && !this.getValue().length) {
                    return helper.reject('required');
                }
                if ($('.invalid', this.element)[0]) {
                    return helper.reject('invalid-value');
                }
            }
        },
        widgets: {
            tag: {
                element: 'span',
                inline: true,
                editable: 'none',
                click: function (e) {
                    if (e.target !== e.widget.element) {
                        $(e.widget.element).detach();
                    }
                }
            }
        },
        init: function (e) {
            e.typer.select(e.typer.element, -0);
            e.widget.knownValues = {};
        },
        focusin: function (e) {
            if (!SHOW_DIALOG) {
                showSuggestions(e.widget);
            } else {
                showSuggestionDialog(e.widget, activeInput);
            }
        },
        focusout: function (e) {
            insertItem(e.widget, e.typer.extractText());
            if (!SHOW_DIALOG) {
                callout.hideMenu();
            }
        },
        click: function (e) {
            if (SHOW_DIALOG && !activeDialog) {
                showSuggestionDialog(e.widget, activeInput);
            }
        },
        upArrow: function (e) {
            dom.focus(callout.element);
            e.handled();
        },
        downArrow: function (e) {
            dom.focus(callout.element);
            e.handled();
        },
        textInput: function (e) {
            var lastChild = e.typer.rootNode.lastChild;
            if (lastChild && helper.compareRangePosition(e.typer.getSelection(), lastChild.element) < 0) {
                e.typer.select(e.typer.element, -0);
            }
        },
        enter: function (e) {
            var suggestions = callout.suggestions;
            insertItem(e.widget, suggestions.length === 1 || (suggestions[0] && suggestions[0].label === '**' + e.widget.knownValues[suggestions[0].value] + '**') ? suggestions[0].value : e.typer.extractText());
            e.handled();
        },
        escape: function (e) {
            if (helper.containsOrEquals(document, callout.element)) {
                callout.hideMenu();
                e.handled();
            }
        },
        contentChange: function (e) {
            if (!SHOW_DIALOG && e.source !== 'script') {
                showSuggestions(e.widget);
            }
        }
    };

    zeta.UI.define('keyword', {
        template: '<z:textbox/>',
        preventLeave: true,
        options: {},
        value: [],
        preset: preset,
        init: function (e, self) {
            self.watch('required', function (required) {
                self.options.required = required;
            }, true);
        },
        focusin: function (e, self) {
            activeInput = self;
        },
        setValue: function (e, self) {
            var newValue = e.newValue || [];
            if (valueChanged(e.oldValue, newValue)) {
                self.setValue(newValue);
                self.editor.setValue(newValue);
            }
            e.handled();
        }
    });

    ui.i18n('en', {
        newValue: 'Enter new value',
        done: 'Done',
        cancel: 'Cancel'
    });

})();
