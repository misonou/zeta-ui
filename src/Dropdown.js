import { any, each, isPlainObject, extend, createPrivateStore } from "./include/zeta-dom/util.js";
import { define } from "./core/define.js";
import { parseControlsAndExecute } from "./util/defineUtil.js";
import { parseTemplateConstant } from "./util/common.js";
import UIToolset from "./core/UIToolset.js";
import Button from "./Button.js";
import ButtonLike from "./ButtonLike.js";

const _ = createPrivateStore();

function setDropdownValue(dropdown, value, forceUpdate) {
    var choices = _(dropdown).all(dropdown);
    var defaultChoice;
    var match = any(choices, function (v) {
        defaultChoice = defaultChoice || v;
        return v.value === value;
    });
    if (!match && !dropdown.allowEmpty) {
        match = defaultChoice;
    }
    if (dropdown.setValue(match ? match.value : '') || forceUpdate) {
        dropdown.hintValue = value;
        dropdown.selectedText = (match && dropdown.valueAsLabel ? match : dropdown).label;
        each(choices, function (i, v) {
            v.selected = v === match;
        });
    }
}

function updateDropdownChoices(dropdown, choiceObj) {
    var isArray = Array.isArray(choiceObj);
    var choices = [];
    each(choiceObj, function (i, v) {
        choices[choices.length] = isArray && isPlainObject(v) ? v : {
            value: isArray ? v : parseTemplateConstant(i),
            label: v
        };
    });

    var choiceButton = _(dropdown);
    var newButtons = [];
    for (var i = 0, len = choices.length - Object.keys(choiceButton.all(dropdown)).length; i < len; i++) {
        newButtons[i] = choiceButton;
    }
    dropdown.append(newButtons);
    each(choiceButton.all(dropdown), function (i, v) {
        v.enabled = v.visible = !!choices[0];
        extend(v, choices.shift());
    });
    setDropdownValue(dropdown, dropdown.hintValue, true);
}

const Dropdown = define('dropdown', {
    template: '<z:buttonlike label="{{selectedText}}" show-text="true"><z:label></z:label><z:menu></z:menu></z:buttonlike>',
    requireChildControls: true,
    hideCalloutOnBlur: true,
    hideCalloutOnExecute: true,
    preventLeave: true,
    allowEmpty: true,
    valueAsLabel: true,
    value: '',
    parseOptions: function (options, iter) {
        options.icon = iter.string();
        if (iter.next(Array) || iter.next(Map)) {
            options.choices = iter.value;
            options.value = iter.next('string') || iter.next('number') ? iter.value : '';
        }
        parseControlsAndExecute(options, iter);
    },
    init: function (e, self) {
        _(self, new UIToolset(self.state.name).use(Button).button({
            template: '<z:button class="selected:{{selected}}" show-icon="true" show-text="true"/>',
            execute: function (choice) {
                setDropdownValue(self, choice.value);
                self.execute();
            }
        }));
        self.hintValue = self.value;
        self.selectedText = self.label;
        self.watch('choices', function (cur) {
            updateDropdownChoices(self, cur);
        }, true);
    },
    setValue: function (e, self) {
        updateDropdownChoices(self, self.choices);
        setDropdownValue(self, e.newValue);
        e.handled();
    }
});

export default Dropdown;
