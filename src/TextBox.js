import { define } from "./core/define.js";
import { each, extend, isFunction, kv } from "./include/zeta-dom/util.js";
import { parseExecute } from "./util/defineUtil.js";
import _contenteditable from "./renderer/default/contenteditable.js";
import _TextBoxLike from "./TextBoxLike.js";

const PRESET_KEY = '__preset__';
const DEFAULT_PRESET = {
    overrides: {
        getValue: function () {
            return this.extractText();
        }
    }
};

function initOptions(preset, options) {
    var presetDefinition = {};
    var originalInit = (options || '').init;

    options = extend({
        inline: true,
        defaultOptions: false,
        disallowedElement: '*'
    }, kv(PRESET_KEY, extend({}, options)));
    each(preset, function (i, v) {
        (isFunction(v) || i === 'options' || i === 'commands' ? presetDefinition : options)[i] = v;
    });
    each(options[PRESET_KEY], function (i, v) {
        if (!presetDefinition.options || !(i in presetDefinition.options)) {
            options[i] = v;
            delete options[PRESET_KEY][i];
        }
    });
    options.widgets = extend(options.widgets, kv(PRESET_KEY, presetDefinition));
    options.init = function (e) {
        var presetWidget = e.typer.getStaticWidget(PRESET_KEY);
        each(preset.overrides, function (i, v) {
            e.typer[i] = function (value) {
                return v.call(this, presetWidget, value);
            };
        });
        if (isFunction(originalInit)) {
            originalInit.call(options, e);
        }
    };
    return options;
}

const TextBox = define('textbox', {
    template: '<z:textboxlike><z:contenteditable spellcheck="false"></z:contenteditable></z:textboxlike>',
    hideCalloutOnExecute: false,
    preventLeave: true,
    value: '',
    placeholder: '',
    parseOptions: parseExecute,
    init: function (e, self) {
        self.editorOptions = initOptions(self.preset || DEFAULT_PRESET, self.options);
        self.watch('editor', function (editor) {
            self.options = editor.getStaticWidget(PRESET_KEY).options;
            self.editorOptions.options = extend({}, self.options);
        });
    },
    reset: function (e, self) {
        self.options = self.editor.getStaticWidget(PRESET_KEY).options;
        extend(self.options, self.editorOptions.options);
    }
});

export default TextBox;
