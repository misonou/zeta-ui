import dom from "./include/zeta-dom/dom.js";
import { define } from "./core/define.js";
import UIToolset from "./core/UIToolset.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";
import { snap, setZIndexOver } from "./util/cssUtil.js";
import _Overlay from "./Overlay.js";

function closeDialog(e, self) {
    self.destroy();
}

const Dialog = define('dialog', {
    template: '<div class="zui-root"><z:overlay class="zui-float zui-dialog-inner"><div class="zui-dialog-content"><h2>{{title}}</h2><z:form><p>{{description}}</p><controls></controls></z:form></div><div class="zui-dialog-error error hidden:{{not errorMessage}}">{{errorMessage}}</div><controls of="type == buttonset"/></z:overlay></div>',
    templates: {
        buttonset: '<z:buttonset class="zui-dialog-buttonset"><controls of="danger" show-text="true"></controls><div class="zui-buttonset-pad"></div><controls show-text="true"></controls></z:buttonset>'
    },
    pinnable: true,
    modal: true,
    title: '',
    description: '',
    errorMessage: '',
    parseOptions: parseControlsAndExecute,
    init: function (e, self) {
        var element = self.element;
        var parentElement = self.parentElement;
        var snapTo = parentElement && self.pinnable && screen.availWidth >= 600 && screen.availHeight >= 600 && UIToolset.hasRole(parentElement, 'button buttonlike') ? parentElement : window;

        document.body.appendChild(element);
        if (parentElement) {
            dom.retainFocus(parentElement, element);
        }
        if (self.modal) {
            dom.setModal(element);
        }
        snap(element, snapTo, 'auto', 10);
        setZIndexOver(element, parentElement || document.activeElement);
        setTimeout(function () {
            dom.focus(element);
        });
    },
    error: function (e, self) {
        self.errorMessage = (e.error || '').message || e.error || '';
        e.handled();
    },
    focusout: closeDialog,
    escape: closeDialog,
    afterExecute: function (e, self) {
        if (e.data) {
            if (self.pending) {
                self.on('asyncEnd', function () {
                    closeDialog(e, self);
                });
            } else {
                closeDialog(e, self);
            }
        }
    },
    enter: function (e, self) {
        return self.execute();
    }
});

export default Dialog;
