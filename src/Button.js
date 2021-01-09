import { define } from "./core/define.js";
import { parseIconAndExecute, shouldExecuteOnClick } from "./util/defineUtil.js";
import _Label from "./Label.js";

function executeButton(e, self) {
    if (e.type !== 'click' || shouldExecuteOnClick(e, 'button')) {
        return self.execute();
    }
}

const Button = define('button', {
    template: '<button class="danger:{{danger}}"><z:label></z:label><children/></button>',
    danger: false,
    defaultExport: 'execute',
    parseOptions: parseIconAndExecute,
    enter: executeButton,
    click: executeButton
});

export default Button;
