import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";

const ButtonSet = define('buttonset', {
    templates: {
        textbox: '<z:textbox show-placeholder="auto"/>'
    },
    requireChildControls: true,
    hiddenWhenDisabled: true,
    parseOptions: parseControlsAndExecute
});

export default ButtonSet;
