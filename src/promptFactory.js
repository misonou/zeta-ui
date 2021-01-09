import { define, definePrototype, extend, is, isFunction, resolve } from "./include/zeta-dom/util.js";
import { snap } from "./util/cssUtil.js";
import ArgumentIterator from "./core/ArgumentIterator.js";
import UIToolset from "./core/UIToolset.js";
import Dialog from "./Dialog.js";
import Button from "./Button.js";
import SubmitButton from "./SubmitButton.js";
import ButtonSet from "./ButtonSet.js";
import GenericComponent from "./Generic.js";
import TextBox from "./TextBox.js";

var ui = new UIToolset('dialog').use(Dialog, Button, SubmitButton, ButtonSet, GenericComponent, TextBox);
var currentNotify;

ui.i18n('en', {
    action: 'OK',
    cancel: 'Cancel',
    leaveForm: 'There are unsubmitted information on the page. Are you sure to leave?'
});

ui.export('dialog.prompt', ui.dialog({
    preventLeave: false,
    data: null,
    exports: 'title description errorMessage data',
    controls: [
        ui.textbox('value', {
            hiddenWhenDisabled: true,
            exports: 'enabled label'
        }),
        ui.buttonset(
            ui.submit('action', 'done', {
                defaultExport: 'label',
                exports: 'icon'
            }),
            ui.button('cancel', 'close', {
                exports: 'visible',
                execute: function (self) {
                    return self.all.dialog.destroy();
                }
            })
        )
    ],
    execute: function (self) {
        return (isFunction(self.context.callback) || resolve)(self.context.value);
    }
}));

ui.export('dialog.notify', ui.generic({
    template: '<z:overlay class="zui-root zui-snackbar notify:{{kind}}"><div class="zui-float"><z:buttonset><z:label/><z:button icon="close" show-text="false" show-icon="true"/></z:buttonset></div></z:overlay>',
    data: null,
    init: function (e, self) {
        if (currentNotify) {
            currentNotify.destroy();
        }
        extend(self, self.context);
        // @ts-ignore: custom control property
        snap(e.target, self.within || document.body, 'top center inset');
        // @ts-ignore: custom control property
        if (self.timeout) {
            setTimeout(function () {
                self.destroy();
                // @ts-ignore: custom control property
            }, self.timeout);
        }
        currentNotify = self;
    },
    click: function (e, self) {
        self.destroy();
    }
}));


/* --------------------------------------
 * Exports
 * -------------------------------------- */

function initPrompt(targetUI, type, value, message, iter) {
    targetUI = is(targetUI, UIToolset) || ui;
    return targetUI.import('dialog.prompt').render({
        value: value,
        valueEnabled: type === 'prompt',
        valueLabel: message,
        cancelVisible: type !== 'alert',
        action: iter.string(),
        dialogTitle: iter.string(),
        dialogDescription: type === 'prompt' ? iter.string() : message,
        dialogData: iter.next('object') && iter.value,
        callback: iter.fn()
    }).dialog;
}

function alert(message, action, title, data, callback) {
    return initPrompt(this, 'alert', true, message, new ArgumentIterator([action, title, data, callback]));
}

function confirm(message, action, title, data, callback) {
    return initPrompt(this, 'confirm', true, message, new ArgumentIterator([action, title, data, callback]));
}

function prompt(message, value, action, title, description, data, callback) {
    return initPrompt(this, 'prompt', value, message, new ArgumentIterator([action, title, description, data, callback]));
}

function notify(message, kind, timeout, within, data) {
    var targetUI = is(this, UIToolset) || ui;
    var iter = new ArgumentIterator([kind, timeout, within, data]);
    return targetUI.import('dialog.notify').render({
        label: message,
        kind: iter.string() || true,
        timeout: iter.next('number') && iter.value,
        within: iter.next(Node) && iter.value,
        data: iter.next('object') && iter.value
    }).dialog;
}

const factory = { alert, confirm, prompt, notify };
define(UIToolset, factory);
definePrototype(UIToolset, factory);

export {
    alert,
    confirm,
    prompt,
    notify
};
