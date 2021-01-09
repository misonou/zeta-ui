import $ from "./include/external/jquery.js";
import { define } from "./core/define.js";
import dom from "./include/zeta-dom/dom.js";
import { bind, containsOrEquals, getRect, matchSelector } from "./include/zeta-dom/domUtil.js";
import { IS_TOUCH } from "./include/zeta-dom/env.js";
import { extend, isFunction, reject, repeat } from "./include/zeta-dom/util.js";
import UIToolset from "./core/UIToolset.js";
import TextBox from "./TextBox.js";
import GenericComponent from "./Generic.js";
import ButtonSet from "./ButtonSet.js";
import Menu from "./Menu.js";
import Dropdown from "./Dropdown.js";
import Button from "./Button.js";
import SubmitButton from "./SubmitButton.js";
import Label from "./Label.js";
import globalContext from "./globalContext.js";

const MS_PER_DAY = 86400000;
const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;
const INPUT_TYPES = {
    datetime: 'datetime-local',
    day: 'date',
    week: 'week',
    month: 'month'
};
const MONTH_NAMES = [];
const WEEKDAYS_NAMES = [];

const ui = new UIToolset('zeta.ui.datepicker').use(GenericComponent, ButtonSet, Menu, Dropdown, Button, SubmitButton, Label, TextBox);
const defaultLocale = globalContext.language;

var controls;
var callout;
var activeTyper;


/* --------------------------------------
 * Helper functions
 * -------------------------------------- */

function range(count, callback) {
    var arr = [];
    for (var i = 0; i < count; i++) {
        arr[i] = callback(i);
    }
    return arr;
}

function loadLabels(lang) {
    var key = lang || 'default';
    var locale = lang || defaultLocale;
    var monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    var weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    var importDefaultLabels = import(
        /* webpackMode: "eager" */
        "./locale/" + locale + "/zeta.ui.datepicker.json"
    );
    importDefaultLabels.then(function (labels) {
        ui.i18n(key, labels.default);
    });
    range(12, function (i) {
        var str = monthFormatter.format(new Date(1970, i));
        MONTH_NAMES[i] = str;
        ui.i18n(key, 'month_' + i, str);
    });
    range(7, function (i) {
        var date = new Date(1970, 0, i);
        WEEKDAYS_NAMES[date.getDay()] = weekdayFormatter.format(date);
    });
}

function getFullYear(d) {
    return d.getFullYear();
}

function getMonth(d) {
    return d.getMonth();
}

function getDate(d) {
    return d.getDate();
}

function getHours(d) {
    return d.getHours();
}

function getMinutes(d) {
    return d.getMinutes();
}

function sameMonth(x, y) {
    return getFullYear(x) === getFullYear(y) && getMonth(x) === getMonth(y);
}

function parseMaxima(d) {
    if (typeof d === 'string' && /^today|([+-]\d+)(day|week|month|year)?$/g.test(d)) {
        return RegExp.$1 ? stepDate(RegExp.$2 || 'day', new Date(), +RegExp.$1) : new Date();
    }
    d = d === null ? undefined : d instanceof Date ? d : new Date(d);
    return isNaN(d) ? undefined : d;
}

function makeTime(h, m) {
    var date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
}

function toNumericValue(mode, value) {
    // timestamp values for native controls are based on local time against local time epoch for "datetime-local" and
    // UTC midnight against UTC epoch for other non-time types; which is exactly the opposite in this library:
    // local time against UTC epoch and local midnight against UTC epoch respectively
    switch (mode) {
        case 'datetime':
            return +value - TIMEZONE_OFFSET;
        case 'month':
            return (getFullYear(value) - 1970) * 12 + getMonth(value);
    }
    return +value + TIMEZONE_OFFSET;
}

function fromNumericValue(mode, value) {
    switch (mode) {
        case 'datetime':
            return new Date(value + TIMEZONE_OFFSET);
        case 'month':
            return new Date(1970, value);
    }
    return new Date(value - TIMEZONE_OFFSET);
}

function normalizeDate(options, date) {
    var min = parseMaxima(options.min);
    var max = parseMaxima(options.max);
    date = new Date(+(date < min ? min : date > max ? max : date));
    switch (options.mode || options) {
        case 'week':
            date.setDate(getDate(date) - date.getDay());
            break;
        case 'month':
            date.setDate(1);
            break;
    }
    if ((options.mode || options) !== 'datetime') {
        date.setHours(0, 0, 0, 0);
    } else {
        date.setSeconds(0, 0);
    }
    return date;
}

function stepDate(mode, date, dir, step) {
    switch (mode) {
        case 'minute':
            var d = dir / Math.abs(dir);
            return new Date(+date + 60000 * ((((d > 0 ? step : 0) - (getMinutes(date) % step)) || (step * d)) + (step * (dir - d))));
        case 'day':
            return new Date(+date + MS_PER_DAY * dir);
        case 'week':
            return new Date(+date + MS_PER_DAY * 7 * dir);
        case 'month':
            return new Date(getFullYear(date), getMonth(date) + dir, getDate(date));
        case 'year':
            return new Date(getFullYear(date) + dir, getMonth(date), getDate(date));
    }
}

function formatDate(mode, date) {
    switch (mode) {
        case 'month':
            return MONTH_NAMES[getMonth(date)] + ' ' + getFullYear(date);
        case 'week':
            var end = stepDate('day', date, 6);
            return MONTH_NAMES[getMonth(date)] + ' ' + getDate(date) + ' - ' + (getMonth(end) !== getMonth(date) ? MONTH_NAMES[getMonth(end)] + ' ' : '') + getDate(end) + ', ' + getFullYear(date);
    }
    var monthPart = MONTH_NAMES[getMonth(date)] + ' ' + getDate(date) + ', ' + getFullYear(date);
    return mode === 'datetime' ? monthPart + ' ' + (getHours(date) || 12) + ':' + ('0' + getMinutes(date)).slice(-2) + ' ' + (getHours(date) >= 12 ? 'PM' : 'AM') : monthPart;
}

function showMonth(self, date) {
    if (isNaN(+date)) {
        return;
    }
    if (typeof date === 'number') {
        date = stepDate('month', self.currentMonth, date);
    }
    var min = parseMaxima(self.min);
    var max = parseMaxima(self.max);
    var currentMonth = normalizeDate({
        mode: 'month',
        min: min,
        max: max
    }, date);
    var y = getFullYear(currentMonth);
    var m = getMonth(currentMonth);
    var all = controls.year.all(self)[0].all;
    var firstDay = currentMonth.getDay();
    var $buttons = $('td', self.element).removeClass('selected disabled');

    if (!self.currentMonth || !sameMonth(currentMonth, self.currentMonth)) {
        var numDays = new Date(y, m + 1, 0).getDate();
        var numDaysLast = new Date(y, m, 0).getDate();
        $buttons.removeClass('prev cur next today');
        $buttons.each(function (i, v) {
            if (i < firstDay) {
                $(v).children().text(i + 1 - firstDay + numDaysLast).end().addClass('prev');
            } else if (i >= numDays + firstDay) {
                $(v).children().text(i + 1 - firstDay - numDays).end().addClass('next');
            } else {
                $(v).children().text(i + 1 - firstDay).end().addClass('cur');
            }
        });
        var today = new Date();
        if (sameMonth(currentMonth, today)) {
            $buttons.eq(getDate(today) + firstDay - 1).addClass('today');
        }
        $('tr:last', self.element).toggle(firstDay + numDays > 35);

        all.year.choices = range(11, function (v) {
            return y + v - 5;
        });
        self.currentMonth = currentMonth;
    }
    all.year.value = y;
    all.month.value = m;

    var isMinMonth = min && sameMonth(currentMonth, min);
    var isMaxMonth = max && sameMonth(currentMonth, max);
    all.prevMonth.enabled = !isMinMonth;
    all.nextMonth.enabled = !isMaxMonth;
    if (isMinMonth) {
        $buttons.slice(0, getDate(min) + firstDay - 1).addClass('disabled');
    }
    if (isMaxMonth) {
        $buttons.slice(getDate(max) + firstDay).addClass('disabled');
    }

    var selected = sameMonth(currentMonth, self.value);
    if (selected || (self.mode === 'week' && sameMonth(currentMonth, stepDate('day', self.value, 6)))) {
        switch (self.mode) {
            case 'day':
                $buttons.eq(getDate(self.value) + firstDay - 1).addClass('selected');
                break;
            case 'week':
                $buttons.slice(selected ? getDate(self.value) + firstDay - 1 : 0).slice(0, 7).addClass('selected');
                break;
            case 'month':
                $buttons.filter('td.cur').addClass('selected');
                break;
        }
    }
    $(self.element).toggleClass('select-range', self.mode !== 'day');
}

function initControls() {
    var dropdownOptions = {
        template: '<z:callout label="{{selectedText}}" show-text="true"/>'
    };
    var monthChoices = new Map();
    range(12, function (v) {
        monthChoices.set(v, 'month_' + v);
    });
    controls = {
        year: ui.dropdown('year', function (self) {
            // @ts-ignore: parent is not null
            return showMonth(self.parent, new Date(self.value, getMonth(self.parent.currentMonth)));
        }, dropdownOptions),
        month: ui.dropdown('month', monthChoices, function (self) {
            // @ts-ignore: parent is not null
            return showMonth(self.parent, new Date(getFullYear(self.parent.currentMonth), self.value));
        }, dropdownOptions),
        prev: ui.button('prevMonth', '\ue314', function (self) {
            return showMonth(self.parent, -1);
        }),
        setToday: ui.button('setToday', '\ue8df', function (self) {
            // @ts-ignore: parent is not null
            return self.parent.execute(new Date());
        }),
        next: ui.button('nextMonth', '\ue315', function (self) {
            return showMonth(self.parent, 1);
        }),
        hour: ui.number('hour', {
            options: {
                min: 0,
                max: 23,
                loop: true
            },
            execute: function (self) {
                // @ts-ignore: parent is not null
                self.parent.execute(makeTime(self.value, self.all.minute.value));
            }
        }),
        timeSeperator: ui.label('timeSeperator'),
        minute: ui.number('minute', {
            options: {
                min: 0,
                max: 59,
                digits: 'fixed',
                loop: true
            },
            execute: function (self) {
                // @ts-ignore: parent is not null
                self.parent.execute(makeTime(self.all.hour.value, self.value));
            }
        }),
        meridiem: ui.button('meridiem', {
            value: false,
            label: 'am',
            showText: true,
            propertyChange: function (e, self) {
                self.label = self.value ? 'pm' : 'am';
            },
            execute: function (self) {
                self.value = !self.value;
                // @ts-ignore: parent is not null
                self.parent.execute(makeTime(self.all.hour.value % 12 + (self.value ? 12 : 0), self.all.minute.value));
            }
        })
    };
}

function initDatepickerCallout() {
    var executed = function (e, self) {
        var date = new Date(+self.all.calendar.value);
        date.setHours(getHours(self.all.clock.value), getMinutes(self.all.clock.value));
        if (activeTyper) {
            activeTyper.setValue(date);
        }
    };
    var calender = ui.calendar({
        executed: executed,
        contextChange: function (e, self) {
            // @ts-ignore: custom control property
            self.min = callout.min;
            // @ts-ignore: custom control property
            self.max = callout.max;
            // @ts-ignore: custom control property
            self.mode = callout.mode === 'datetime' ? 'day' : callout.mode;
        }
    });
    var clock = ui.clock({
        hiddenWhenDisabled: true,
        executed: executed,
        contextChange: function (e, self) {
            // @ts-ignore: custom control property
            self.step = callout.minuteStep;
            self.enabled = callout.mode === 'datetime';
        }
    });
    var okButton = ui.submit('done', 'done', {
        execute: function (self) {
            callout.hideMenu();
        }
    });
    callout = ui.menu(
        ui.buttonset(calender, clock),
        ui.generic({
            controls: [ui.buttonset(okButton)],
            template: '<z:generic><controls layout="dialog"/></z:generic>'
        }), {
        hideCalloutOnBlur: false
    }).render();
}

function stepValue(tx) {
    var options = tx.widget.options;
    var date = stepDate(options.mode === 'datetime' ? 'minute' : options.mode, tx.typer.getValue() || new Date(), tx.commandName === 'stepUp' ? -1 : 1, options.minuteStep);
    tx.typer.setValue(date);
}


/* --------------------------------------
 * Control types
 * -------------------------------------- */

const Calendar = define('calendar', {
    template: '<div><div class="zui-calendar-header"><z:buttonset show-text="false"/></div><div class="zui-calendar-body"><table></table></div></div>',
    hideCalloutOnExecute: false,
    value: null,
    mode: 'day',
    min: null,
    max: null,
    setValue: function (e, self) {
        var value = normalizeDate(this, e.newValue);
        self.selectedDate = value;
        self.value = value;
        showMonth(self, value);
    },
    init: function (e, self) {
        if (!controls) {
            initControls();
        }
        self.append([controls.year, controls.month, controls.prev, controls.setToday, controls.next]);

        var updateValue = function () {
            self.value = normalizeDate(self, self.selectedDate);
        };
        self.watch('mode', updateValue);
        self.watch('min', updateValue);
        self.watch('max', updateValue);

        var $table = $('table', self.element);
        $(repeat('<tr></tr>', 7)).appendTo($table);
        $(repeat('<th></th>', 7)).appendTo($table.find('tr:first'));
        $(repeat('<td></td>', 7)).appendTo($table.find('tr+tr'));
        $('<button>').appendTo($table.find('td'));
        $table.find('th').text(function (i) {
            return WEEKDAYS_NAMES[i];
        });
        $table.find('td').on('click', function () {
            var monthDelta = $(this).hasClass('prev') ? -1 : $(this).hasClass('next') ? 1 : 0;
            // @ts-ignore: type inference issue
            self.execute(new Date(getFullYear(self.currentMonth), getMonth(self.currentMonth) + monthDelta, +this.textContent));
        });
        if (!self.value) {
            self.value = new Date();
        } else {
            showMonth(self, 0);
        }
    },
    mousewheel: function (e, self) {
        if (self.context === callout) {
            showMonth(self, e.data);
            e.handled();
        }
    },
    contextChange: function (e, self) {
        showMonth(self, self.currentMonth || self.value || new Date());
    }
});

const Clock = define('clock', {
    template: '<div><div class="zui-clock-face"><s hand="h"></s><s hand="m"></s><i></i><i></i></div><z:buttonset/></div>',
    hideCalloutOnExecute: false,
    step: 1,
    value: null,
    init: function (e, self) {
        if (!controls) {
            initControls();
        }
        self.append([controls.hour, controls.timeSeperator, controls.minute, controls.meridiem]);
        self.watch('step', function (step) {
            // only allow minute interval that is a factor of 60
            // to maintain consistent step over hours
            if (60 % step) {
                self.step = 1;
            }
            controls.minute.all(self)[0].options.step = step;
        }, true);
        self.setValue(new Date());
    },
    setValue: function (e, self) {
        var date = e.newValue;
        var all = controls.hour.all(self)[0].all;
        all.hour.value = getHours(date) || 12;
        all.minute.value = getMinutes(date);
        all.meridiem.value = getHours(date) >= 12;
        $('s[hand="h"]', self.element).css('transform', 'rotate(' + (getHours(date) * 30 + getMinutes(date) * 0.5 - 90) + 'deg)');
        $('s[hand="m"]', self.element).css('transform', 'rotate(' + (getMinutes(date) * 6 - 90) + 'deg)');
    },
    mousedown: function (e, self) {
        if (matchSelector(e.target, 's')) {
            // @ts-ignore: parent is not null
            var rect = getRect(e.target.parentNode);
            var promise = dom.beginDrag(function (x, y) {
                var rad = Math.atan2(y - rect.centerY, x - rect.centerX) / Math.PI;
                var curM = getMinutes(self.value);
                var curH = getHours(self.value);
                if (e.target.getAttribute('hand') === 'm') {
                    // @ts-ignore: custom control property
                    var m = (Math.round((rad * 30 + 75) / self.step) * self.step) % 60;
                    if (m !== curM) {
                        var deltaH = Math.floor(Math.abs(curM - m) / 30) * (m > curM ? -1 : 1);
                        self.setValue(makeTime(curH + deltaH, m));
                    }
                } else {
                    var h = Math.round(rad * 6 + 15) % 12 + (controls.meridiem.all(self)[0].value ? 12 : 0);
                    if (h !== curH) {
                        self.setValue(makeTime(h, curM));
                    }
                }
            });
            promise.then(function () {
                self.execute();
            });
        }
    },
    mousewheel: function (e, self) {
        self.setValue(stepDate('minute', self.value, e.data, self.step));
        self.mousewheelTimeout = self.mousewheelTimeout || setTimeout(function () {
            self.mousewheelTimeout = null;
            self.execute();
        });
        e.preventDefault();
        e.handled();
    }
});

const DatePicker = define('datepicker', {
    template: '<z:textbox/>',
    preventLeave: true,
    value: '',
    options: {},
    init: function (e, self) {
        if (IS_TOUCH) {
            var mode = self.options.mode || self.preset.options.mode;
            self.nativeInput = $('<input type="' + INPUT_TYPES[mode] + '">').appendTo(self.element)[0];
            bind(self.nativeInput, 'change', function (e) {
                self.setValue(fromNumericValue(mode, self.nativeInput.valueAsNumber));
            });
        }
    },
    focusin: function (e, self) {
        if (IS_TOUCH) {
            var mode = self.options.mode || self.preset.options.mode;
            if (!self.value) {
                self.value = new Date();
            }
            // input type "datetime-local" does not support valueAsDate so we need to use with valueAsNumber (timestamp)
            self.nativeInput.valueAsNumber = toNumericValue(mode, self.value);
            self.nativeInput.focus();
            e.preventDefault();
        }
    },
    preset: {
        options: {
            mode: 'day',
            minuteStep: 1,
            min: null,
            max: null,
            required: false,
            formatDate: null
        },
        overrides: {
            getValue: function (preset) {
                return preset.selectedDate ? normalizeDate(preset.options, preset.selectedDate) : null;
            },
            setValue: function (preset, date) {
                date = date ? normalizeDate(preset.options, date) : null;
                preset.selectedDate = date;
                preset.softSelectedDate = null;

                var text = '';
                if (date && !isNaN(+date)) {
                    var format = function (fn) {
                        return isFunction(fn) && fn(preset.options.mode, date);
                    };
                    text = format(preset.options.formatDate) || format(formatDate);
                }
                if (text !== this.extractText()) {
                    this.invoke(function (tx) {
                        tx.selection.selectAll();
                        tx.insertText(text);
                    });
                    if (this === activeTyper) {
                        callout.calendar = callout.clock = preset.selectedDate || new Date();
                    }
                }
            },
            validate: function (preset) {
                if (preset.options.required && !!preset.selectedDate) {
                    return reject('required');
                }
            }
        },
        commands: {
            stepUp: stepValue,
            stepDown: stepValue
        },
        contentChange: function (e) {
            if (e.typer === activeTyper && e.source !== 'script') {
                var date = new Date(e.typer.extractText());
                if (!isNaN(+date)) {
                    callout.calendar = callout.clock = normalizeDate(e.widget.options, date);
                }
                e.widget.softSelectedDate = date;
            }
        },
        click: function (e) {
            if (e.typer === activeTyper) {
                callout.showMenu(e.typer.element, 'left bottom', null, 10);
            }
        },
        escape: function (e) {
            if (containsOrEquals(document, callout.element)) {
                callout.hideMenu();
                e.handled();
            }
        },
        focusin: function (e) {
            if (!callout) {
                initDatepickerCallout();
            }
            e.typer.retainFocus(callout.element);
            activeTyper = e.typer;

            var options = e.widget.options;
            var value = e.typer.getValue() || new Date();
            extend(callout, {
                mode: options.mode,
                minuteStep: options.minuteStep,
                min: options.min,
                max: options.max,
                calendar: value,
                clock: value
            });
            callout.update();
            if (e.source !== 'script') {
                callout.showMenu(e.typer.element, 'left bottom', null, 10);
            }
        },
        focusout: function (e) {
            if (e.typer === activeTyper) {
                var softDate = e.widget.softSelectedDate;
                e.typer.setValue(!softDate || isNaN(+softDate) ? e.widget.selectedDate : softDate);
                activeTyper = null;
                callout.hideMenu();
            }
        }
    }
});

loadLabels();

export {
    DatePicker,
    Calendar,
    Clock
}
