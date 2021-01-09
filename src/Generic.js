import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";

const GenericComponent = define('generic', {
    parseOptions: parseControlsAndExecute
});

export default GenericComponent;
