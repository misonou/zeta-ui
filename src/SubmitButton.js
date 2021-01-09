import { define } from "./core/define.js";
import _ from "./Button.js";

const SubmitButton = define('submit', {
    template: '<z:button/>',
    defaultExport: 'execute',
    parseOptions: function (options, iter) {
        options.icon = iter.string();
        options.execute = function (self) {
            for (var cur = self; cur && !cur.hasRole('form'); cur = cur.parent);
            return cur && cur.execute();
        };
    }
});

export default SubmitButton;
