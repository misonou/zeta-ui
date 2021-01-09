import { UIContext, UIControlSpeciesInitExport, UIControlSpeciesInit, UITextInputOptions, UIControlSpeciesOptions } from "./types";

interface DatePickerOption extends UITextInputOptions<DatePickerOption> {
    options?: {
        mode?: 'day' | 'datetime' | 'week' | 'month';
        minuteStep?: number;
        min?: Date | string | number | null;
        max?: Date | string | number | null;
        formatDate?: (date: Date) => string;
    }
}

interface DatePickerConstructor extends UIControlSpeciesInit<DatePickerOption> {
}

interface CalendarOption extends UIControlSpeciesOptions<CalendarOption> {
    mode?: 'day' | 'datetime' | 'week' | 'month';
    min?: Date | string | number | null;
    max?: Date | string | number | null;
}

interface CalendarConstructor extends UIControlSpeciesInit<CalendarOption> {
}

interface ClockOption extends UIControlSpeciesOptions<ClockOption> {
    mode?: 'day' | 'datetime' | 'week' | 'month';
    min?: Date | string | number | null;
    max?: Date | string | number | null;
}

interface ClockConstructor extends UIControlSpeciesInit<ClockOption> {
    step?: number;
}

export const DatePicker: UIControlSpeciesInitExport<"datepicker", DatePickerConstructor>;
export const Calendar: UIControlSpeciesInitExport<"calendar", CalendarConstructor>;
export const Clock: UIControlSpeciesInitExport<"clock", ClockConstructor>;
