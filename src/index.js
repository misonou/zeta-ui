import defaultRenderer from "./renderer/default/index.js";
import globalContext from "./globalContext.js";
import UIToolset from "./core/UIToolset.js";
import { extend } from "./include/zeta-dom/util.js";

extend(UIToolset, {
    defaultRenderer,
    globalContext
});
export default UIToolset;
