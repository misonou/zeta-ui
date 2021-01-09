import $ from "./include/external/jquery.js";
import { define } from "./core/define.js";
import { reject } from "./include/zeta-dom/util.js";
import { parseExecute } from "./util/defineUtil.js";
import _ from "./renderer/default/contenteditable.js";

const RichTextInput = define('richtext', {
    template: '<div><div class="zui-richtext-toolbar"></div><label class="zui-textbox"><z:contenteditable></z:contenteditable><div class="zui-textbox-placeholder"><p>{{label}}</p></div></label></div>',
    hideCalloutOnExecute: false,
    preventLeave: true,
    value: '',
    parseOptions: parseExecute,
    init: function (e, self) {
        self.editorOptions = self.options || {};
        self.editorOptions.toolbar = {
            container: $('.zui-richtext-toolbar', e.target)[0]
        };
    },
    validate: function (e, self) {
        if (self.required && !self.editor.extractText()) {
            return reject('required');
        }
    }
});

export default RichTextInput;
