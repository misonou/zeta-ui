import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";

function updateFlag(self) {
    self.value = self.optional ? !!self.value : undefined;
    self.enableChildren = !self.optional || self.value;
}

const FieldSet = define('fieldset', {
    template: '<div class="optional:{{optional && [ ? value checked [ ! value ] ]}}"><div class="zui-fieldset-title"><z:checkbox/><p>{{description}}</p></div><div class="zui-form hidden:{{not enableChildren}}"><children controls/></div></div>',
    templates: {
        textbox: '<z:textbox show-placeholder="always"/>'
    },
    value: false,
    optional: false,
    parseOptions: parseControlsAndExecute,
    init: function (e, self) {
        updateFlag(self);
    },
    propertyChange: function (e, self) {
        if ('optional' in e.newValues || 'value' in e.newValues) {
            updateFlag(self);
        }
    }
});

export default FieldSet;
