import { define } from "./core/define.js";
import { parseExecute, shouldExecuteOnClick } from "./util/defineUtil.js";

function checkboxToggleValue(e, self) {
    if (e.type !== 'click' || shouldExecuteOnClick(e, 'checkbox')) {
        self.value = !self.value;
        return self.type === 'checkbox' ? self.execute() : e.handled();
    }
}

const Checkbox = define('checkbox', {
    template: '<z:button class="checked:{{value}}" show-icon="false" show-text="true"/>',
    value: false,
    preventLeave: true,
    parseOptions: parseExecute,
    click: checkboxToggleValue,
    enter: checkboxToggleValue,
    space: checkboxToggleValue
});

export default Checkbox;
