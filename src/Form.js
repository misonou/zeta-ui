import Promise from "./include/external/promise-polyfill.js";
import { lock } from "./include/zeta-dom/domLock.js";
import { defineHiddenProperty, mapGet, mapRemove, resolve } from "./include/zeta-dom/util.js";
import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";
import { confirm } from "./promptFactory.js";

const guards = new WeakMap();
const deferreds = new WeakMap();

function ensureFormPromise(form, store) {
    return mapGet(store, form, function () {
        var obj = {};
        obj.promise = new Promise(function (resolve, reject) {
            obj.resolve = resolve;
            obj.reject = reject;
        });
        return obj;
    });
}

function settleFormPromise(form, store, resolveOrReject, data) {
    var deferred = mapRemove(store, form);
    if (deferred) {
        deferred[resolveOrReject ? 'resolve' : 'reject'](data);
    }
}

function initForm(form) {
    var deferred = ensureFormPromise(form, deferreds);
    defineHiddenProperty(form.context, form.name, deferred.promise);
    settleFormPromise(form, guards, true);
}

const Form = define('form', {
    templates: {
        buttonset: '<z:buttonset><children controls show-text="true"/></z:buttonset>',
        textbox: '<z:textbox show-placeholder="always"/>'
    },
    parseOptions: parseControlsAndExecute,
    defaultExport: 'promise',
    preventLeave: true,
    init: function (e, self) {
        initForm(self);
    },
    childExecuted: function (e, self) {
        if (e.source !== 'script' && e.control.preventLeave && !guards.get(self)) {
            lock(self.element, ensureFormPromise(self, guards).promise, function () {
                return self.preventLeave ? confirm('leaveForm') : resolve();
            });
        }
    },
    beforeExecute: function (e, self) {
        settleFormPromise(self, guards, true);
    },
    executed: function (e, self) {
        settleFormPromise(self, deferreds, true, e.data !== null ? e.data : self.value !== undefined ? self.value : self.context.toJSON());
        self.reset();
    },
    cancelled: function (e, self) {
        settleFormPromise(self, deferreds, false);
    },
    destroy: function (e, self) {
        settleFormPromise(self, deferreds, false);
    },
    reset: function (e, self) {
        if (!deferreds.get(self)) {
            initForm(self);
        }
    }
});

export default Form;
