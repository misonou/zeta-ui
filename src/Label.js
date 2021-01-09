import { define } from "./core/define.js";

const T_SHOWICON = '[ @global.showIcon ?? showIcon ]';
const T_SHOWTEXT = '[ @global.showText ?? showText ]';
const T_ICON = '[ @global.icon ?? icon ]';

const Label = define('label', {
    template: '<span class="hidden:{{[ ! ' + T_SHOWICON + ' || ! ' + T_ICON + ' ] && ! ' + T_SHOWTEXT + '}}" title="{{tooltip || label}}"><i class="material-icons hidden:{{[ ! ' + T_ICON + ' && ' + T_SHOWICON + ' != true ] || ! ' + T_SHOWICON + '}}">{{' + T_ICON + '}}</i>{{? ' + T_SHOWTEXT + ' [ @global.label ?? label ] ""}}</span>',
    showIcon: 'auto',
    showText: true,
    defaultExport: 'label'
});

export default Label;
