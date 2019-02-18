(function ($, zeta) {
    'use strict';

    function normalizeUrl(url) {
        var anchor = document.createElement('a');
        anchor.href = url || '';
        if (location.protocol === anchor.protocol && location.hostname === anchor.hostname && (location.port === anchor.port || (location.port === '' && anchor.port === (location.protocol === 'https:' ? '443' : '80')))) {
            // for browsers incorrectly report URL components with a relative path
            // the supplied value must be at least an absolute path on the origin
            return anchor.pathname.replace(/^(?!\/)/, '/') + anchor.search + anchor.hash;
        }
        return url;
    }

    zeta.Editor.widgets.link = {
        element: 'a[href]',
        inline: true,
        create: function (tx, value) {
            value = normalizeUrl(value);
            if (tx.selection.focusNode.widget.id === 'link') {
                tx.invoke('setURL', value);
            } else {
                tx.insertHtml($('<a>').text(tx.selection.getSelectedText() || value).attr('href', value)[0]);
            }
        },
        remove: 'keepText',
        setup: function (e) {
            e.typer.on('contentChange', function (e) {
               var keyName = e.sourceKeyName;
               if (keyName === 'enter' || keyName === 'space') {
                    var selection = e.typer.getSelection().clone();
                    selection.moveByCharacter(-1);
                    if (selection.getCaret('start').moveByWord(-1) && selection.focusNode.widget.id !== 'link' && /^([a-z]+:\/\/\S+)|(\S+@\S+\.\S+)/g.test(selection.getSelectedText())) {
                        var link = RegExp.$1 || ('mailto:' + RegExp.$2);
                        e.typer.invoke(function (tx) {
                            var originalSelection = tx.selection.clone();
                            e.typer.snapshot(true);
                            e.typer.select(selection);
                            tx.insertWidget('link', link);
                            e.typer.select(originalSelection);
                        });
                    }
                }
            });
        },
        init: function (e) {
            e.widget.element.style.cursor = 'text';
        },
        ctrlClick: function (e) {
            window.open(e.widget.element.href);
        },
        commands: {
            setURL: function (tx, value) {
                tx.widget.element.href = normalizeUrl(value);
            },
            unlink: function (tx) {
                tx.removeWidget(tx.widget);
            }
        }
    };

    zeta.Editor.defaultOptions.link = true;

    var ui = new zeta.UI('zeta.editor.link', {
        contextChange: function (e, self) {
            var typer = self.context.typer;
            if (typer) {
                var selection = typer.getSelection();
                self.widget = selection.getWidget('link');
                self.widgetAllowed = selection.widgetAllowed('link');
            }
        }
    });

    var dialog = ui.dialog(
        ui.textbox('text', true),
        ui.textbox('href', true),
        ui.checkbox('blank'),
        ui.buttonset(
            ui.button('remove', 'delete', {
                danger: true,
                execute: function (self) {
                    self.parentContext.typer.invoke('unlink');
                    return self.all.dialog.destroy();
                },
                visible: function (self) {
                    return self.parentContext.typer.hasCommand('unlink');
                }
            }),
            ui.submit('ok', 'done'),
            ui.button('cancel', 'close', function (self) {
                return self.all.dialog.destroy();
            })
        )
    );

    function openDialog(self) {
        var typer = self.context.typer;
        var element = (self.state.widget || '').element;
        var currentValue;
        if (element) {
            currentValue = {
                href: element.getAttribute('href'),
                text: element.textContent,
                blank: element.getAttribute('target') === '_blank'
            };
        } else {
            var selectedText = typer.getSelection().getSelectedText();
            currentValue = {
                href: /^[a-z]+:\/\//g.test(selectedText) ? selectedText : '',
                text: selectedText,
                blank: false
            };
        }
        var fn = self.context.options.selectLink;
        var promise;
        if (typeof fn === 'function') {
            promise = fn(currentValue);
        } else {
            promise = dialog.render(currentValue).dialog;
        }
        return promise.then(function (value) {
            if (!value) {
                return null;
            }
            var href = value.href || value;
            var text = value.text || href;
            typer.invoke(function (tx) {
                if (!element) {
                    element = $('<a href="">').text(text)[0];
                    tx.insertHtml(element);
                    tx.selection.select(element, 'contents');
                }
                $(element).text(text);
                $(element).attr('target', value.blank ? '_blank' : null);
                typer.invoke('setURL', href);
            });
        });
    }

    ui.export('zeta.editor.toolbar',
        ui.button('insertLink', 'insert_link', {
            realm: 'widgetAllowed',
            after: 'insertWidgets',
            execute: openDialog,
            active: function (self) {
                return self.state.widget;
            },
            contextChange: function (e, self) {
                self.label = self.state.widget ? 'editLink' : 'insertLink';
            }
        })
    );

    ui.export('zeta.editor.contextmenu', ui.buttonlist(
        ui.button('open', {
            realm: 'widget',
            shortcut: 'ctrlClick',
            execute: function (self) {
                window.open(self.state.widget.element.href);
            }
        }),
        ui.button('editLink', {
            realm: 'widget',
            execute: openDialog
        }),
        ui.button('removeLink', {
            realm: 'widget',
            execute: 'unlink'
        })
    ));

    ui.i18n('en', {
        insertLink: 'Insert hyperlink',
        editLink: 'Edit hyperlink',
        removeLink: 'Remove hyperlink',
        remove: 'Remove',
        text: 'Text',
        href: 'Link URL',
        blank: 'Open in new window',
        open: 'Open hyperlink',
        cancel: 'Cancel',
        ok: 'OK',
    });

}(jQuery, zeta));
