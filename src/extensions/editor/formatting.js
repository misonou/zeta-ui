(function ($, zeta) {
    'use strict';

    var ALIGN_VALUE = {
        justifyLeft: 'left',
        justifyRight: 'right',
        justifyCenter: 'center',
        justifyFull: 'justify'
    };
    var STYLE_TAGNAME = {
        bold: 'b,strong',
        italic: 'i,em',
        underline: 'u',
        strikeThrough: 'strike'
    };
    var STYLE_CHECK = {
        bold: ['fontWeight', 'bold 700'],
        italic: ['fontStyle', 'italic'],
        underline: ['textDecoration', 'underline'],
        strikeThrough: ['textDecoration', 'line-through']
    };
    var LIST_STYLE_TYPE = {
        '1': 'decimal',
        'A': 'upper-alpha',
        'a': 'lower-alpha',
        'I': 'upper-roman',
        'i': 'lower-roman'
    };

    var Typer = zeta.Editor;
    var helper = zeta.helper;
    var dom = zeta.dom;
    var extend = helper.extend;
    var each = helper.each;
    var removeNode = helper.removeNode;

    var reFormat = /^([a-z\d]*)(?:\.(.+))?/i;
    var reCompatFormat = /^(p|h[1-6])(?:\.(.+))?$/i;

    function outermost(elements) {
        return elements.filter(function (v) {
            return !elements.some(function (w) {
                return w !== v && w.contains(v);
            });
        });
    }

    function getTextAlign(element) {
        var textAlign = $(element).css('text-align');
        var direction = $(element).css('direction');
        switch (textAlign) {
            case '-webkit-left':
            case '-webkit-right':
            case '-webkit-center':
                return textAlign.slice(8);
            case 'start':
                return direction === 'ltr' ? 'left' : 'right';
            case 'end':
                return direction === 'ltr' ? 'right' : 'left';
            default:
                return textAlign;
        }
    }

    function computePropertyValue(elements, property) {
        var value;
        $(elements).each(function (i, v) {
            var my;
            if (property === 'textAlign') {
                my = getTextAlign(v);
            } else if (property === 'inlineClass') {
                my = $(v).attr('class') || '';
            } else {
                my = $(v).css(property);
            }
            value = (value === '' || (value && value !== my)) ? '' : my;
        });
        return value || '';
    }

    function compatibleFormatting(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        return a === b || (reCompatFormat.test(a) && reCompatFormat.test(b));
    }

    function createElementWithClassName(tagName, className) {
        var element = helper.createElement(tagName);
        if (className) {
            element.className = className;
        }
        return element;
    }

    function replaceElement(oldElement, newElement) {
        newElement = helper.is(newElement, Node) || createElementWithClassName(newElement);
        return $(newElement).append(oldElement.childNodes).replaceAll(oldElement)[0];
    }

    function applyInlineStyle(tx, wrapElm, unwrapSpec, currentState, styleCheck) {
        var selection = tx.selection;
        var paragraphs = selection.getParagraphElements();
        if (selection.isCaret && !currentState) {
            tx.insertHtml(wrapElm);
            wrapElm.appendChild(helper.createTextNode());
            selection.moveToText(wrapElm, -0);
        } else {
            var textNodes = selection.getSelectedTextNodes();
            paragraphs.forEach(function (v) {
                if (!styleCheck || !helper.matchWord(window.getComputedStyle(v)[styleCheck[0]], styleCheck[1])) {
                    if (!currentState) {
                        $(v).find(textNodes).wrap(wrapElm);
                    } else {
                        var $unwrapNodes = $(textNodes, v).parentsUntil(v).filter(unwrapSpec);
                        var $rewrapNodes = $unwrapNodes.contents().filter(function (i, v) {
                            return textNodes.every(function (w) {
                                return !helper.containsOrEquals(v, w);
                            });
                        });
                        $unwrapNodes.contents().unwrap();
                        $rewrapNodes.wrap(wrapElm);
                    }
                }
            });
            selection.select(textNodes[0], 0, textNodes[textNodes.length - 1], -0);
        }
        $(paragraphs).find(unwrapSpec).filter(':has(' + unwrapSpec + ')').each(function (i, v) {
            $(v).contents().unwrap().filter(function (i, v) {
                return v.nodeType === 3;
            }).wrap(v);
        });
        $(paragraphs).find('span[class=""],span:not([class])').contents().unwrap();
        $(paragraphs).find(unwrapSpec).each(function (i, v) {
            if (helper.sameElementSpec(v.previousSibling, v)) {
                $(v.childNodes).appendTo(v.previousSibling);
                removeNode(v);
            }
        });
    }

    /* ********************************
     * Commands
     * ********************************/

    function justifyCommand(tx) {
        $(tx.selection.getParagraphElements()).attr('align', ALIGN_VALUE[tx.commandName]);
    }

    function inlineStyleCommand(tx) {
        var kind = tx.commandName;
        applyInlineStyle(tx, createElementWithClassName(STYLE_TAGNAME[kind].split(',')[0]), STYLE_TAGNAME[kind], tx.widget[kind], STYLE_CHECK[kind]);
    }

    function listCommand(tx, type) {
        var tagName = tx.commandName === 'insertOrderedList' || type ? 'ol' : 'ul';
        var html = '<' + tagName + (type || '').replace(/^.+/, ' type="$&"') + '>';
        var filter = function (i, v) {
            return helper.is(v, tagName) && ($(v).attr('type') || '') === (type || '');
        };
        var lists = [];
        each(tx.selection.getParagraphElements(), function (i, v) {
            if (!$(v).is('ol>li,ul>li')) {
                var list = $(v).prev().filter(filter)[0] || $(v).next().filter(filter)[0] || $(html).insertAfter(v)[0];
                $(v)[helper.comparePosition(v, list) < 0 ? 'prependTo' : 'appendTo'](list);
                replaceElement(v, 'li');
                lists.push(list);
            } else if (!$(v.parentNode).filter(filter)[0]) {
                replaceElement(v.parentNode, $(html)[0]);
                lists.push(v.parentNode);
            } else if ($(v).is('li') && $.inArray(v.parentNode, lists) < 0) {
                outdentCommand(tx, [v]);
            }
        });
    }

    function indentCommand(tx, elements) {
        elements = $.makeArray(elements || outermost(tx.selection.getParagraphElements()));
        each(elements, function (i, v) {
            var list = $(v).parent('ul,ol')[0] || $(v).prev('ul,ol')[0] || $('<ul>').insertBefore(v)[0];
            var newList = list;
            if (newList === v.parentNode) {
                var prevItem = $(v).prev('li')[0] || $('<li>').insertBefore(v)[0];
                newList = $(prevItem).children('ul,ol')[0] || $(list.cloneNode(false)).appendTo(prevItem)[0];
            }
            $(replaceElement(v, 'li')).appendTo(newList);
            if ($(newList).parent('li')[0]) {
                $(helper.createTextNode('\u00a0')).insertBefore(newList);
            }
            if (!list.children[0]) {
                removeNode(list);
            }
        });
    }

    function outdentCommand(tx, elements) {
        elements = $.makeArray(elements || outermost(tx.selection.getParagraphElements()));
        each(elements, function (i, v) {
            var list = $(v).parent('ul,ol')[0];
            var parentList = $(list).parent('li')[0];
            if ($(v).next('li')[0]) {
                if (parentList) {
                    $(list.cloneNode(false)).append($(v).nextAll()).appendTo(v);
                } else {
                    $(list.cloneNode(false)).append($(v).nextAll()).insertAfter(list);
                    $(v).children('ul,ol').insertAfter(list);
                }
            }
            if (parentList) {
                $(v).insertAfter(parentList);
                if (!helper.trim(tx.typer.extractText(parentList))) {
                    removeNode(parentList);
                }
            } else {
                $(replaceElement(v, 'p')).insertAfter(list);
            }
            if (!list.children[0]) {
                removeNode(list);
            }
        });
    }

    function updateInlineStyle(e) {
        var elements = e.typer.getSelection().getSelectedElements();
        e.widget.inlineClass = computePropertyValue($(elements).filter('span'), 'inlineClass');
        each(STYLE_CHECK, function (i, v) {
            e.widget[i] = !!helper.matchWord(computePropertyValue(elements, v[0]), v[1]);
        });
    }

    function updateFormatting(e) {
        var selection = e.typer.getSelection();
        var element = selection.getParagraphElements().slice(-1)[0];
        if ($(element).is('li')) {
            element = $(element).closest('ol, ul')[0] || element;
        }
        var tagName = element && element.tagName.toLowerCase();
        var tagNameWithClasses = tagName + ($(element).attr('class') || '').replace(/^(.)/, '.$1');
        var textAlign = computePropertyValue(selection.getSelectedElements(), 'textAlign');
        extend(e.widget, {
            justifyLeft: textAlign === 'left',
            justifyCenter: textAlign === 'center',
            justifyRight: textAlign === 'right',
            justifyFull: textAlign === 'justify',
            formatting: tagName,
            formattingWithClassName: tagNameWithClasses
        });
    }

    Typer.widgets.inlineStyle = {
        stateChange: updateInlineStyle,
        contentChange: updateInlineStyle,
        commands: {
            bold: inlineStyleCommand,
            italic: inlineStyleCommand,
            underline: inlineStyleCommand,
            strikeThrough: inlineStyleCommand,
            superscript: inlineStyleCommand,
            subscript: inlineStyleCommand,
            applyClass: function (tx, className) {
                applyInlineStyle(tx, createElementWithClassName('span', className), 'span');
            }
        }
    };

    Typer.widgets.formatting = {
        stateChange: updateFormatting,
        contentChange: updateFormatting,
        enter: function (e) {
            if (e.typer.widgetEnabled('lineBreak') && helper.is(e.typer.getSelection().startNode, Typer.NODE_EDITABLE_PARAGRAPH)) {
                e.typer.invoke('insertLineBreak');
            } else {
                e.typer.invoke('insertLine');
            }
            e.handled();
        },
        commands: {
            justifyCenter: justifyCommand,
            justifyFull: justifyCommand,
            justifyLeft: justifyCommand,
            justifyRight: justifyCommand,
            formatting: function (tx, value) {
                var m = /^([a-z\d]*)(?:\.(.+))?/i.exec(value) || [];
                if (m[1] === 'ol' || m[1] === 'ul') {
                    tx.insertWidget('list', m[1] === 'ol' && '1');
                } else {
                    $(tx.selection.getParagraphElements()).not('li').each(function (i, v) {
                        if (m[1] && !helper.is(v, m[1]) && compatibleFormatting(m[1], v.tagName)) {
                            replaceElement(v, createElementWithClassName(m[1] || 'p', m[2]));
                        } else {
                            v.className = m[2] || '';
                        }
                    });
                }
            },
            insertLine: function (tx) {
                tx.insertText('\n\n');
            },
            insertLineBefore: function (tx) {
                var widget = tx.selection.focusNode.widget;
                if (widget.id !== '__root__') {
                    tx.selection.select(widget.element, true);
                    tx.insertText('\n\n');
                }
            }
        }
    };

    Typer.widgets.lineBreak = {
        enter: function (e) {
            e.typer.invoke('insertLineBreak');
            e.handled();
        },
        shiftEnter: function (e) {
            e.typer.invoke('insertLineBreak');
            e.handled();
        },
        commands: {
            insertLineBreak: function (tx) {
                tx.insertHtml('<br>');
            }
        }
    };

    Typer.widgets.list = {
        element: 'ul,ol',
        editable: 'ul,ol',
        textFlow: true,
        create: listCommand,
        remove: function (tx) {
            outdentCommand(tx, tx.widget.element.children);
        },
        extract: function (e) {
            // ensure the list element (UL/OL) is extracted
            // nothing actually to be done
        },
        receive: function (e) {
            if (helper.sameElementSpec(e.widget.element, e.receivedNode)) {
                e.preventDefault();
                e.typer.invoke(function (tx) {
                    tx.insertHtml(e.receivedNode.childNodes);
                });
            }
        },
        tab: function (e) {
            e.typer.invoke('indent');
        },
        shiftTab: function (e) {
            e.typer.invoke('outdent');
        },
        init: function (e) {
            $(e.widget.element).filter('ol').attr('type-css-value', LIST_STYLE_TYPE[$(e.widget.element).attr('type')] || 'decimal');
            if ($(e.widget.element).parent('li')[0] && !e.widget.element.previousSibling) {
                $(helper.createTextNode()).insertBefore(e.widget.element);
            }
        },
        contentChange: function (e) {
            if (!$(e.widget.element).children('li')[0]) {
                e.typer.invoke(function (tx) {
                    removeNode(e.widget.element);
                });
            }
        },
        setup: function (e) {
            e.typer.on('tab', function (e) {
                e.typer.invoke(indentCommand);
                e.handled();
            });
        },
        commands: {
            indent: indentCommand,
            outdent: outdentCommand
        }
    };

    extend(Typer.defaultOptions, {
        lineBreak: true,
        formatting: true,
        inlineStyle: true,
        list: true
    });

    dom.setShortcut({
        bold: 'ctrlB',
        italic: 'ctrlI',
        underline: 'ctrlU',
        justifyLeft: 'ctrlShiftL',
        justifyCenter: 'ctrlShiftE',
        justifyRight: 'ctrlShiftR',
        insertLineBefore: 'ctrlEnter'
    });

    /* ********************************
     * Controls
     * ********************************/

    var ui = new zeta.UI('zeta.editor.formatting', {
        contextChange: function (e, self) {
            each('formatting inlineStyle list', function (i, v) {
                self[v] = self.context.typer.widgetEnabled(v);
            });
        }
    });

    function isEnabled(control, widget) {
        var selection = control.context.typer.getSelection();
        return !!(widget === 'inlineStyle' ? (selection.startNode.nodeType & (Typer.NODE_PARAGRAPH | Typer.NODE_EDITABLE_PARAGRAPH | Typer.NODE_INLINE)) : selection.getParagraphElements()[0]);
    }

    function simpleCommandButton(command, widgetId) {
        return ui.button(command, ICONS[command], {
            realm: widgetId,
            execute: command,
            active: function (self) {
                var widget = self.context.typer.getStaticWidget(widgetId);
                return widget && widget[command];
            },
            enabled: function (self) {
                return isEnabled(self, widgetId);
            }
        });
    }

    function orderedListButton(type, description) {
        return ui.button(helper.camel(LIST_STYLE_TYPE[type]), {
            description: description,
            execute: function (self) {
                self.context.typer.invoke(function (tx) {
                    tx.insertWidget('list', type);
                });
            },
            active: function (self) {
                var widget = self.context.typer.getSelection().getWidget('list');
                return widget && $(widget.element).attr('type') === type;
            }
        });
    }

    var ICONS = {
        bold: '\ue238',          // format_bold
        italic: '\ue23f',        // format_italic
        underline: '\ue249',     // format_underlined
        strikeThrough: '\ue257', // strikethrough_s
        unorderedList: '\ue241', // format_list_bulleted
        orderedList: '\ue242',   // format_list_numbered
        indent: '\ue23e',        // format_indent_increase
        outdent: '\ue23d',       // format_indent_decrease
        justifyLeft: '\ue236',   // format_align_left
        justifyCenter: '\ue234', // format_align_center
        justifyRight: '\ue237',  // format_align_right
        justifyFull: '\ue235'    // format_align_justify
    };

    var inlineStyleClear = ui.buttonlist(ui.button('inlineStyleClear', function (self) {
        self.context.typer.invoke('applyClass', '');
    }), { after: '*' });

    ui.export('zeta.editor.toolbar', ui.buttonset(
        ui.dropdown('paragraph', {
            realm: 'formatting',
            execute: 'formatting',
            visible: function (self) {
                return isEnabled(self, 'formatting') && self.controls.length > 0;
            },
            contextChange: function (e, self) {
                var selection = self.context.typer.getSelection();
                var widget = self.context.typer.getStaticWidget('formatting');
                var curElm = (selection.startNode === selection.endNode ? selection.startNode : selection.focusNode).element;
                var isClassName = helper.any(self.controls, function (v) {
                    return v.value === widget.formattingWithClassName;
                });
                self.choices = helper.map(self.context.options.formattings, function (v, i) {
                    return !reFormat.test(i) || compatibleFormatting(curElm.tagName, RegExp.$1) ? {
                        value: i,
                        label: v
                    } : null;
                });
                self.value = isClassName ? isClassName.value : widget.formatting;
            }
        }),
        ui.dropdown('inlineStyle', {
            realm: 'inlineStyle',
            execute: 'applyClass',
            init: function (e, self) {
                self.choices = self.context.options.inlineClass;
                self.append(inlineStyleClear);
            },
            visible: function (self) {
                return isEnabled(self, 'inlineStyle') && self.controls.length > 1;
            },
            contextChange: function (e, self) {
                var widget = self.context.typer.getStaticWidget('inlineStyle');
                self.value = widget.inlineClass;
            }
        }),
        simpleCommandButton('bold', 'inlineStyle'),
        simpleCommandButton('italic', 'inlineStyle'),
        simpleCommandButton('underline', 'inlineStyle'),
        simpleCommandButton('strikeThrough', 'inlineStyle'),
        ui.button('unorderedList', ICONS.unorderedList, {
            realm: 'list',
            execute: function (self) {
                self.context.typer.invoke(function (tx) {
                    tx.insertWidget('list');
                });
            },
            active: function (self) {
                var widget = self.context.typer.getSelection().getWidget('list');
                return widget && helper.is(widget.element, 'ul');
            },
            enabled: function (self) {
                return isEnabled(self, 'list') && self.context.typer.getSelection().widgetAllowed('list');
            }
        }),
        ui.callout('orderedList', ICONS.orderedList,
            orderedListButton('1', '1, 2, 3, 4'),
            orderedListButton('a', 'a, b, c, d'),
            orderedListButton('A', 'A, B, C, D'),
            orderedListButton('i', 'i, ii, iii, iv'),
            orderedListButton('I', 'I, II, III, IV'), {
                realm: 'list',
                active: function (self) {
                    var widget = self.context.typer.getSelection().getWidget('list');
                    return widget && helper.is(widget.element, 'ol');
                },
                enabled: function (self) {
                    return isEnabled(self, 'list') && self.context.typer.getSelection().widgetAllowed('list');
                }
            }),
        simpleCommandButton('indent', 'list'),
        simpleCommandButton('outdent', 'list'),
        simpleCommandButton('justifyLeft', 'formatting'),
        simpleCommandButton('justifyCenter', 'formatting'),
        simpleCommandButton('justifyRight', 'formatting'),
        simpleCommandButton('justifyFull', 'formatting')
    ));

    ui.i18n('en', {
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underlined',
        strikeThrough: 'Strikethrough',
        unorderedList: 'Bullet list',
        orderedList: 'Numbered list',
        indent: 'Indent',
        outdent: 'Outdent',
        justifyLeft: 'Align left',
        justifyCenter: 'Align center',
        justifyRight: 'Align right',
        justifyFull: 'Align justified',
        paragraph: 'Formatting',
        inlineStyle: 'Text style',
        inlineStyleClear: 'Clear style',
        decimal: 'Decimal numbers',
        lowerAlpha: 'Alphabetically ordered list, lowercase',
        upperAlpha: 'Alphabetically ordered list, uppercase',
        lowerRoman: 'Roman numbers, lowercase',
        upperRoman: 'Roman numbers, uppercase',
        format_p: 'Paragraph',
        format_h1: 'Header 1',
        format_h2: 'Header 2',
        format_h3: 'Header 3',
        format_h4: 'Header 4',
        format_h5: 'Header 5',
        format_h6: 'Header 6',
        format_table: 'Table',
        format_td: 'Table cell',
        format_th: 'Table header',
        format_ul: 'Unordered list',
        format_ol: 'Ordered list',
        format_li: 'List item',
        format_blockquote: 'Blockquote'
    });

}(jQuery, zeta));
