import { defineLayout } from "./core/define.js";
import { matchSelector } from "./include/zeta-dom/domUtil.js";
import _Label from "./Label.js";

defineLayout('textboxlike', {
    template: '<label class="zui-textbox keep-placeholder:{{showPlaceholder == always && ! $placeholder}}"><z:label show-text="false" show-icon="auto"></z:label><div class="zui-textbox-wrapper" data-label="{{? $placeholder label}}"><div class="zui-textbox-inner"><children></children><div class="zui-textbox-placeholder">{{placeholder || label}}</div></div><div class="zui-textbox-error"></div><div class="zui-textbox-clear"></div></div></label>',
    click: function (e, self) {
        if (matchSelector(e.target, '.zui-textbox-clear')) {
            self.execute('');
            self.editor.focus();
        }
    }
});

export default null;
