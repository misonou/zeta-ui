import { defineLayout } from "../../core/define.js";
import { either } from "../../include/zeta-dom/util.js";
import include from "../../include/external/zeta-editor.js";

function setValue(control, value) {
    var editor = control.editor;
    if (!editor) {
        return;
    }
    if (!editor.focused(true) && value !== editor.getValue()) {
        editor.setValue(value);
    }
    control.setValue(editor.getValue());
}

defineLayout('contenteditable', {
    template: '<div class="zui-editable" contenteditable spellcheck="{{spellcheck}}"></div>',
    init: function (e, self) {
        var target = self.getElementForRole('contenteditable') || self.element;
        self.editor = new include.Editor(target, self.editorOptions);
        self.editor.enable('stateclass', {
            target: self.element,
            focused: ''
        });
        self.editor.on('contentChange', function () {
            if (self.setValue(self.editor.getValue())) {
                self.execute();
            }
        });
        setValue(self, self.value);
    },
    stateChange: function (e, self) {
        if (either(self.editor.enabled(), self.enabled)) {
            self.editor[self.enabled ? 'enable' : 'disable']();
        }
    },
    focusin: function (e, self) {
        if (!self.editor.focused()) {
            self.editor.focus();
        }
    },
    setValue: function (e, self) {
        setValue(self, e.newValue);
        e.handled();
    },
    validate: function (e, self) {
        return self.editor.validate();
    }
});

export default null;
