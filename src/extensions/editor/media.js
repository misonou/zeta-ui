(function () {
    'use strict';

    var reMediaType = /\.(?:(jpg|jpeg|png|gif|webp)|(mp4|ogg|webm)|(mp3))(?:\?.*)?$/i;
    var helper = zeta.helper;

    zeta.Editor.widgets.media = {
        element: 'img,audio,video,a:has(>img)',
        text: function (widget) {
            return widget.element.src;
        },
        create: function (tx, options) {
            var element = helper.createElement(reMediaType.test(options.src || options) ? (RegExp.$2 ? 'video' : RegExp.$3 ? 'audio' : 'img') : 'img');
            element.src = options.src || options;
            if (helper.is(element, 'video')) {
                $(element).attr('controls', '');
            }
            tx.insertHtml(element);
        }
    };

    zeta.Editor.defaultOptions.media = true;

    function openDialog(control, callback) {
        var promise;
        var fn = control.context.options.selectMedia;
        if (helper.isFunction(fn)) {
            var mediaType = reMediaType.exec(control.label) && (RegExp.$1 ? 'image' : RegExp.$2 ? 'video' : 'audio');
            promise = fn(mediaType, control.value);
        } else {
            promise = ui.prompt('imageURL', control.value);
        }
        return promise.then(callback);
    }

    function insertMediaButton(type, icon) {
        return ui.button(type, icon, {
            realm: 'widgetAllowed',
            execute: function (self) {
                return openDialog(self, function () {
                    self.context.typer.invoke(function (tx) {
                        tx.insertWidget('media', self.value);
                    });
                });
            }
        });
    }

    var ui = new zeta.UI('zeta.editor.media', {
        contextChange: function (e, self) {
            var selection = self.context.typer.getSelection();
            self.widget = selection.getWidget('media');
            self.widgetAllowed = selection.widgetAllowed('media');
        }
    });

    ui.export('zeta.editor.insertMenu',
        insertMediaButton('image', 'insert_photo'),
        insertMediaButton('video', 'videocam'));

    ui.export('zeta.editor.toolbar', ui.buttonset(
        ui.button('filePicker', {
            realm: 'widget',
            showText: true,
            showIcon: false,
            contextChange: function (e, self) {
                self.value = $(self.state.widget.element).attr('src');
                self.label = (/(?:^|\/)([^/?#]+)(?:\?.+)?$/.exec(self.value) || [])[1] || '';
            },
            execute: function (self) {
                return openDialog(self, function (value) {
                    $(self.state.widget.element).attr('src', value.src || value);
                });
            }
        }),
        ui.textbox('altText', {
            realm: 'widget',
            icon: 'comment',
            contextChange: function (e, self) {
                self.value = $(self.state.widget.element).attr('alt');
            },
            execute: function (self) {
                $(self.state.widget.element).attr('alt', self.value).attr('title', self.value);
            }
        })
    ));

    ui.i18n('en', {
        'insertImage': 'Image',
        'insertVideo': 'Video',
        'altText': 'Alternate text',
        'imageURL': 'Image URL'
    });

})();
