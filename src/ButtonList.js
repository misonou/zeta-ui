import { define } from "./core/define.js";
import { each } from "./include/zeta-dom/util.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";

/**
 * @param {ZetaUI.UIControl} control
 * @param {'previousSibling' | 'nextSibling'} prop
 */
function getNextVisible(control, prop) {
    for (var cur = control[prop]; cur && !cur.visible; cur = cur[prop]);
    return cur;
}

const ButtonList = define('buttonlist', {
    template: '<div class="sep-before:{{showSeparatorBefore}} sep-after:{{showSeparatorAfter}}"><children show-text="true" show-icon="true" controls/></div>',
    templates: {
        button: '<z:button><span class="zui-label zui-label-description">{{description ?? [ shortcut :zui-shortcut ]}}</span></z:button>',
    },
    showIcon: true,
    showText: true,
    showSeparatorBefore: false,
    showSeparatorAfter: false,
    requireChildControls: true,
    hiddenWhenDisabled: true,
    parseOptions: parseControlsAndExecute,
    stateChange: function (e, self) {
        each(self.controls, function (i, v) {
            if (v.type === 'buttonlist') {
                var prevVisible = getNextVisible(v, 'previousSibling');
                var nextVisible = getNextVisible(v, 'nextSibling');
                // @ts-ignore
                v.showSeparatorBefore = !!prevVisible;
                // @ts-ignore
                v.showSeparatorAfter = !!nextVisible && nextVisible.type !== 'buttonlist'
            }
        });
    }
});

export default ButtonList;
