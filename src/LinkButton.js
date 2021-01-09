import { define } from "./core/define.js";
import _ from "./ButtonLike.js";

const LinkButton = define('link', {
    template: '<z:buttonlike><a href="{{value}}" target="{{target}}"><z:label show-icon="auto"></z:label></a></z:buttonlike>',
    parseOptions: function (options, iter) {
        options.icon = iter.string();
        options.value = iter.string();
        options.target = iter.string();
    }
});

export default LinkButton;
