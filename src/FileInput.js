import $ from "./include/external/jquery.js";
import { define } from "./core/define.js";
import { makeArray } from "./include/zeta-dom/util.js";
import { parseIconAndExecute } from "./util/defineUtil.js";

function resetFileInput(e) {
    var input = $(':file', e.target)[0];
    var originalParent = input.parentNode;
    var form = document.createElement('form');
    form.appendChild(input);
    form.reset();
    // @ts-ignore: originalParent is not null
    $(input).prependTo(originalParent);
}

const FileInput = define('file', {
    template: '<z:buttonlike><z:label show-icon="auto"></z:label><input type="file" multiple="{{multiple}}"/></z:buttonlike>',
    autoReset: true,
    multiple: false,
    parseOptions: parseIconAndExecute,
    reset: resetFileInput,
    init: function (e, self) {
        $(':file', e.target).on('change', function (e) {
            // @ts-ignore: e.target is file input
            self.execute(makeArray(e.target.files));
        });
    },
    afterExecute: function (e, self) {
        if (self.autoReset) {
            resetFileInput(e);
        }
    }
});

export default FileInput;
