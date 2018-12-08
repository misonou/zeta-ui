(function ($, zeta) {
    'use strict';

    var helper = zeta.helper;
    var toolbar;
    var contextmenu;
    var activeToolbar;
    var canAccessClipboard;

    function detectClipboardInaccessible(callback) {
        if (canAccessClipboard === false) {
            callback();
        } else if (!canAccessClipboard) {
            var unbind = helper.bind(document, 'paste', function () {
                canAccessClipboard = true;
            });
            setTimeout(function () {
                unbind();
                if (!canAccessClipboard) {
                    canAccessClipboard = false;
                    callback();
                }
            });
        }
    }

    function positionToolbar(toolbar) {
        var height = $(toolbar.element).height();
        var rect = helper.getRect(toolbar.widget || toolbar.typer);
        if (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0) {
            // invisible element or IE bug related - https://connect.microsoft.com/IE/feedback/details/881970
            return;
        }
        var position = {
            position: 'fixed',
            left: rect.left,
            top: Math.max(0, rect.top - height - 10)
        };
        var r = toolbar.typer.getSelection().extendCaret.getRect();
        if (r.top >= position.top && r.top <= position.top + height) {
            position.top = r.bottom + 10;
        }
        $(toolbar.element).css(position);
    }

    function showToolbar(toolbar) {
        if (activeToolbar !== toolbar) {
            hideToolbar();
            activeToolbar = toolbar;
            $(toolbar.element).appendTo(document.body);
            helper.setZIndexOver(toolbar.element, toolbar.typer.element);
        }
        positionToolbar(toolbar);
    }

    function hideToolbar(toolbar) {
        if (activeToolbar && (toolbar || activeToolbar) === activeToolbar) {
            $(activeToolbar.element).detach();
            activeToolbar.position = '';
            activeToolbar = null;
        }
    }

    function createToolbar(typer, options, type) {
        var container = document.createElement('div');
        var context = type.render(container, {
            typer: typer,
            options: options
        });
        if (!context.element) {
            context.element = container;
        }
        typer.retainFocus(context.element);
        if (options.container && type !== contextmenu) {
            $(container).appendTo(options.container);
        } else {
            $(container).addClass('zeta-float');
        }
        return context;
    }

    zeta.Editor.widgets.toolbar = {
        options: {
            container: '',
            formattings: {
                p: 'Paragraph',
                h1: 'Heading 1',
                h2: 'Heading 2',
                h3: 'Heading 3',
                h4: 'Heading 4'
            },
            inlineClasses: {}
        },
        init: function (e) {
            e.widget.toolbar = createToolbar(e.typer, e.widget.options, toolbar);
        },
        focusin: function (e) {
            var toolbar = e.widget.toolbar;
            toolbar.update();
            if (!toolbar.options.container) {
                showToolbar(toolbar);
            }
        },
        focusout: function (e) {
            hideToolbar(e.widget.toolbar);
        },
        rightClick: function (e) {
            var toolbar = e.widget.contextmenu || (e.widget.contextmenu = createToolbar(e.typer, e.widget.options, contextmenu));
            toolbar.update();
            setTimeout(function () {
                // fix IE11 rendering issue when mousedown on contextmenu
                // without moving focus beforehand
                zeta.dom.focus(toolbar.element);
                toolbar.showMenu({
                    x: e.clientX,
                    y: e.clientY
                });
            });
            e.preventDefault();
        },
        stateChange: function (e) {
            var toolbar = e.widget.toolbar;
            toolbar.update();
            if (activeToolbar === toolbar) {
                if (e.typer.enabled()) {
                    positionToolbar(toolbar);
                } else {
                    hideToolbar(toolbar);
                }
            }
        }
    };

    helper.bind(window, 'scroll', function () {
        if (activeToolbar) {
            positionToolbar(activeToolbar);
        }
    });

    /* ********************************
     * Built-in Controls
     * ********************************/

    var ui = new zeta.UI('zeta.editor');

    function childExecuted(e, self) {
        if (e.source === 'mouse') {
            self.context.typer.focus();
        }
    }

    toolbar = ui.buttonset(
        ui.callout('insertWidgets', 'widgets', ui.import('zeta.editor.insertMenu')),
        ui.import('zeta.editor.toolbar'), {
            showText: false,
            childExecuted: childExecuted
        });

    contextmenu = ui.menu(
        ui.buttonlist(
            ui.button('undo', '\ue166', {
                execute: 'undo',
                enabled: function (self) {
                    return self.context.typer.canUndo();
                }
            }),
            ui.button('redo', '\ue15a', {
                execute: 'redo',
                enabled: function (self) {
                    return self.context.typer.canRedo();
                }
            }), {
                hiddenWhenDisabled: false
            }
        ),
        ui.buttonlist(
            ui.button('selectAll', 'select_all', {
                execute: 'selectAll'
            }),
            ui.button('selectParagraph', {
                hiddenWhenDisabled: true,
                execute: function (self) {
                    var selection = self.context.typer.getSelection();
                    selection.select(selection.startNode.element, 'contents');
                    selection.focus();
                },
                enabled: function (self) {
                    return self.context.typer.getSelection().isCaret;
                }
            })
        ),
        ui.buttonlist(
            ui.button('cut', 'content_cut', {
                shortcut: 'ctrlX',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('cut');
                }
            }),
            ui.button('copy', 'content_copy', {
                shortcut: 'ctrlC',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('copy');
                }
            }),
            ui.button('paste', 'content_paste', {
                shortcut: 'ctrlV',
                execute: function (self) {
                    self.context.typer.focus();
                    document.execCommand('paste');
                    detectClipboardInaccessible(function () {
                        ui.alert('clipboardError');
                    });
                }
            })
        ),
        ui.import('zeta.editor.contextmenu'), {
            childExecuted: childExecuted
        }
    );

    ui.i18n('en', {
        undo: 'Undo',
        redo: 'Redo',
        cut: 'Cut',
        copy: 'Copy',
        paste: 'Paste',
        selectAll: 'Select all',
        selectParagraph: 'Select paragraph',
        insertWidgets: 'Insert',
        clipboardError: 'Unable to access clipboard due to browser security. Please use Ctrl+V or [Paste] from browser\'s menu.',
    });

}(jQuery, zeta));
