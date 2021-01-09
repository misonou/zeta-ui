import ArgumentIterator from "./core/ArgumentIterator";
import UIContext from "./core/UIContext";
import UIControl from "./core/UIControl";
import UIControlSpecies from "./core/UIControlSpecies";
import UIToolset from "./core/UIToolset";
import UIToolsetState from "./core/UIToolsetState";
import * as PromptFactory from "./promptFactory";
import { Typer, TyperOptions } from "zeta-editor/types";

export as namespace ZetaUI;

export { default as DisplayValue } from "./core/DisplayValue";
export { default as UIContext } from "./core/UIContext";
export { default as UIControl } from "./core/UIControl";
export { default as UIControlSpecies } from "./core/UIControlSpecies";
export { default as UIToolset } from "./core/UIToolset";
export { default as UIToolsetState } from "./core/UIToolsetState";
export { Typer } from "zeta-editor/types";

export interface UIGlobalContext {
    language: string;
}

export type UIControlWithOption<T = UIControlSpeciesOptions> = UIControl & Pick<T, Exclude<keyof T, keyof UIControl | UIControlEventName | 'controls' | 'template' | 'templates'>>;
export type UIControlCallback<T = UIControlSpeciesOptions> = (this: UIControlWithOption<T>, self: UIControlWithOption<T>) => any;

export type UIControlEventHandler<T extends UIControlEventName, U = {}> = Zeta.ZetaEventHandler<T, UIControlEventMap, UIControlWithOption<U>>;
export type UIControlEventHandlers<T = {}> = Zeta.ZetaEventHandlers<UIControlEventName, UIControlEventMap, UIControlWithOption<T>>;
export type UIControlEventName = Zeta.ZetaDOMEventName | 'init' | 'setValue' | 'propertyChange' | 'stateChange' | 'contextChange' | 'executed' | 'childExecuted' | 'beforeExecute' | 'afterExecute' | 'reset' | 'validate' | 'beforeDestroy';
export type UIControlEventMap = Zeta.ZetaDOMEventMap & {
    childExecuted: UIControlChildExecutedEvent;
    propertyChange: UIControlPropertyChangeEvent;
    setValue: UIControlSetValueEvent;
}

export interface UIEventContext extends Zeta.ZetaEventContextBase<UIControl> {
}

export interface UIControlChildExecutedEvent extends Zeta.ZetaEventBase {
    /**
     * Gets the child control that has just been executed.
     */
    readonly control: UIControl;
}

export interface UIControlPropertyChangeEvent extends Zeta.ZetaEventBase {
    /**
     * Gets a dictionary containing old values of the changed properties.
     */
    readonly oldValues: Zeta.Dictionary;

    /**
     * Gets a dictionary containing new values of the changed properties.
     */
    readonly newValues: Zeta.Dictionary;
}

export interface UIControlSetValueEvent extends Zeta.ZetaAsyncHandleableEvent {
    /**
     * Gets the old value of the property about to be changed.
     */
    readonly oldValue: any;

    /**
     * Gets the new value supplied to the property about to be changed.
     */
    readonly newValue: any;
}

export type UIToolsetEventHandler<T extends UIToolsetEventName, U = {}> = Zeta.ZetaEventHandler<T, UIToolsetEventMap, UIToolsetState>;
export type UIToolsetEventHandlers<T = {}> = Zeta.ZetaEventHandlers<UIToolsetEventName, UIToolsetEventMap, UIToolsetState>;
export type UIToolsetEventName = 'contextChange';
export type UIToolsetEventMap = {};

export interface UIToolsetOptions {
    labels?: Zeta.Dictionary<string>;
    contextChange?: UIToolsetEventHandler<'contextChange'>;
}

/**
 * Defines options available when creating control or layout types, and control species.
 */
export interface UIControlOptions {
    name?: string;

    realm?: string;

    /**
     * A whitespace-separated list of word containing names of controls, or * for all, of which this controls should be rendered after.
     */
    after?: string;

    /**
     * A whitespace-separated list of word containing names of controls, or * for all, of which this controls should be rendered before.
     */
    before?: string;

    cssClass?: string;

    defaultExport?: string;

    /**
     * Sets the description of a control.
     */
    description?: string;

    /**
     * Sets whether child controls is enabled. This flag will override the enabled property of child controls.
     */
    enableChildren?: boolean;

    exports?: string | string[];

    /**
     * Sets whether the control should be automatically hidden when disabled. Default is false.
     */
    hiddenWhenDisabled?: boolean;

    /**
     * Sets whether the menu should be immediately closed after losing focus. Default is true.
     */
    hideCalloutOnBlur?: boolean;

    /**
     * Sets whether the menu should be immediately closed after this control has finished executing. Default is true.
     */
    hideCalloutOnExecute?: boolean;

    /**
     * Sets whether a child control should be hidden when it is disabled. Default is false.
     */
    hideDisabledChild?: boolean;

    /**
     * Sets the icon for button-like control. Currently only material icons are supported.
     */
    icon?: string;

    /**
     * Sets the label for button-like control.
     */
    label?: string;

    /**
     * Sets whether user should be prompted when navigating away the page.
     */
    preventLeave?: boolean;

    /**
     * Sets whether the control is a required field. Default is false.
     */
    required?: boolean;

    /**
     * Sets whether the control should only be enabled when there are child controls. Default is false.
     */
    requireChildControls?: boolean;

    /**
     * Sets to forcibly turn on or off icon for button-like control. Default is null.
     */
    showIcon?: 'auto' | boolean;

    /**
     * Sets to forcibly turn on or off icon for button-like control. Default is null.
     */
    showText?: boolean;

    /**
     * Sets whether validation is performed when new value is being set.
     */
    validateOnSetValue?: boolean;

    /**
     * Sets the initial value of the control. When used in defining control types, presence of the value property will cause the registration of two-way binding to the context object.
     */
    value?: any;

    /**
     * Sets whether this and descendant controls should wait for async execution. Default is true.
     */
    waitForExecution?: boolean;
}

/**
 * Defines generic options available when creating controls.
 * @template T Interface that defines additional options specific to that control type.
 */
export interface UIControlSpeciesOptions<T = {}> extends UIControlOptions, UIControlEventHandlers<T>, Zeta.Dictionary {
    /**
     * Sets to override default template specified by the control type.
     */
    template?: string;

    /**
     * Defines child controls that will be appended under this control during initialization.
     */
    controls?: UIControlSpecies[];

    /**
     * Defines the action of execution of the control by Control#execute.
     * If a string is given, mixin method or supported commands of focused component with the specified name will be executed.
     */
    execute?: string | UIControlCallback<this>;

    /**
     * Defines a dynamic handler to determine the enable state of a control.
     * This handler will not be called if the control is forcibly enabled or disabled.
     */
    enabled?: UIControlCallback<this> | boolean;

    /**
     * Defines a dynamic handler to determine the visible state of a control.
     * This handler will not be called if the control is forcibly hidden.
     */
    visible?: UIControlCallback<this> | boolean;

    /**
     * Defines a dynamic handler to determine the active state of a control.
     * This handler will not be called if the control is forcibly active.
     */
    active?: UIControlCallback<this> | boolean;
}

/**
 * Defines options available when creating control or layout types.
 */
export interface UIControlTypeOptions<T = {}> extends UIControlOptions, UIControlEventHandlers<T>, Zeta.Dictionary {
    /**
     * Defines default template for this control or layout type.
     */
    template?: string;

    /**
     * Overrides default templates when child control is rendered under this control or layout type.
     */
    templates?: Zeta.Dictionary<string>;

    /**
     * Defines editor behaviors if this control or layout type renders an editor.
     */
    preset?: UIControlPresetOptions;

    /**
     * Consumes arguments supplied to the species constructor to construct options for shorthand method.
     */
    parseOptions?: (options: Zeta.Dictionary, iter: ArgumentIterator) => void;
}

export interface UIControlPresetOptions extends TyperOptions {
    /**
     * Defines available options that can be set when a text input field of this type is to be created.
     */
    options?: Zeta.Dictionary;

    /**
     * Defines to override default logic to certain editors' methods.
     */
    overrides?: Partial<Record<'getValue' | 'setValue' | 'hasContent' | 'validate', (this: Typer, ...args) => any>>;
}

export interface UITextInputOptions<T> extends UIControlSpeciesOptions<T> {
    /**
     * Gets of sets the placeholder of a text input which is shown when the input is empty.
     */
    placeholder?: string;
}

/**
 * Represents signatures, including shorthands, of the function to create control of certain type.
 * @template O Interface that defines the list of options.
 */
export interface UIControlSpeciesInit<O = UIControlSpeciesOptions, T extends UIContext = UIContext> {
    (): UIControlSpecies<T>;
    (options: O): UIControlSpecies<T>;
    (name: string): UIControlSpecies<T>;
    (name: string, options: O): UIControlSpecies<T>;
}

export interface UIControlCollectionSpeciesInit<O = UIControlSpeciesOptions, T extends UIContext = UIContext> extends UIControlSpeciesInit<O, T> {
    (...controls: [...UIControlSpecies[]]): UIControlSpecies<T>;
    (...controls: [...UIControlSpecies[], O]): UIControlSpecies<T>;
    (name: string, ...controls: [...UIControlSpecies[]]): UIControlSpecies<T>;
    (name: string, ...controls: [...UIControlSpecies[], O]): UIControlSpecies<T>;
}

export interface UIControlSpeciesInitExport<T extends string, U extends UIControlSpeciesInit> extends U {
}

export interface UIControlRenderer {
    append(control: UIControl, parent: Zeta.HasElement, suppressEvent?: boolean): void;
    remove(control: UIControl): void;
    getElementForRole(control: UIControl, role: string): HTMLElement | undefined;
    getRoles(control: UIControl): string[];
    isEnabled(control: UIControl): boolean;
}

export type UIPromptFactory = typeof PromptFactory;
