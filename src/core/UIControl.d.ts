import { UIControlEventHandler, UIControlEventHandlers, UIControlEventName, UIControlOptions } from "../types";
import UIContext from "./UIContext";
import UIControlSpecies from "./UIControlSpecies";
import UIToolsetState from "./UIToolsetState";

export function createContext(getSpeciesSpec: Zeta.PrivateStore<UIControlSpecies, Internal.UIControlSpeciesSpec>, species: UIControlSpecies, renderer: ZetaUI.UIControlRenderer, element: HTMLElement, values: any): UIContext;

export function emitEvent(control: UIControl, event: string, data?: any, bubble?: boolean): void;

export function emitStateChange(control: UIControl, recursive?: boolean): void;

export function emitPropertyChange(control: UIControl, property: string, oldValue: any, newValue: any): void;

export function defineInheritedProperty(name: string, defaultValue: any): void;

export function exportControls(name: string, ...args: UIControlSpecies[]): void;

export function setEventHandlers(type: string, handlers: UIControlEventHandlers): void;

export function foreachControl(control: UIControl, callback: (c: UIControl) => any, enabledOnly?: boolean): void;

export function hasRole(element: Element, role: string): boolean;

export default class UIControl implements Zeta.HasElement, UIControlOptions {
    /**
     * Reserved for internal use.
     */
    constructor(container: Internal.UIEventContainer, species: UIControlSpecies, parent?: UIControl | null, allowExport?: boolean, extraOptions?: UIControlOptions);

    /**
     * Type of the control.
     */
    readonly type: string;

    /**
     * Gets the unique name of the control.
     */
    readonly name: string;

    /**
     * Gets the DOM element associated with this control.
     */
    readonly element: HTMLElement;

    /**
     * Gets the context object exposed to public that is associated with this control.
     */
    readonly context: UIContext;

    /**
     * Gets the state object that associates the tool set which creates this control and this instance of control.
     */
    readonly state: UIToolsetState;

    /**
     * Gets the parent control if this is not the root control.
     */
    readonly parent: UIControl | null;

    readonly previousSibling: UIControl | null;

    readonly nextSibling: UIControl | null;

    /**
     * Gets a collection of child controls.
     */
    readonly controls: UIControl[];

    /**
     * Gets a dictionary of controls created by the same tool set.
     */
    readonly all: Zeta.Dictionary<UIControl>;

    /**
     * Gets the parent context object if this control is instantiated by another control.
     */
    readonly parentContext: UIContext | null;

    readonly parentElement: HTMLElement | null;

    readonly pending: boolean;

    readonly focusedBy: string;

    /**
     * Gets or sets the active state of the control.
     */
    active: boolean;

    /**
     * Gets or sets long description text for display or tooltip.
     */
    description?: string;

    /**
     * Gets or sets whether child controls is enabled. This flag will override the enabled property of child controls.
     */
    enableChildren?: boolean;

    /**
     * Gets or sets whether the control is enabled or not.
     * Only the boolean false value will force the control to be disabled.
     */
    enabled: boolean;

    /**
     * Gets or sets errors associated with this control.
     */
    errors?: any;

    /**
     * Gets or sets whether the control should be automatically hidden when disabled. Default is false.
     */
    hiddenWhenDisabled?: boolean;

    /**
     * Gets or sets whether the menu should be immediately closed after losing focus. Default is true.
     */
    hideCalloutOnBlur?: boolean;

    /**
     * Gets or sets whether the menu should be immediately closed after this control has finished executing. Default is true.
     */
    hideCalloutOnExecute?: boolean;

    /**
     * Gets or sets whether a child control should be hidden when it is disabled. Default is false.
     */
    hideDisabledChild?: boolean;

    /**
     * Gets or sets the icon of a button-like control.
     */
    icon: string;

    /**
     * Gets or sets the label of a button-like control.
     */
    label: string;

    /**
     * Gets or sets placeholder text for text input control.
     */
    placeholder?: string;

    /**
     * Gets or sets whether user should be prompted when navigating away the page.
     */
    preventLeave?: boolean;

    /**
     * Gets or sets whether the control is a required field. Default is false.
     */
    required?: boolean;

    /**
     * Gets or sets whether the control should only be enabled when there are child controls. Default is false.
     */
    requireChildControls?: boolean;

    /**
     * Reserved for internal use.
     */
    shortcut: string;

    /**
     * Gets or sets to forcibly turn on or off icon for button-like control. Default is null.
     */
    showIcon?: 'auto' | boolean;

    /**
     * Gets or sets to forcibly turn on or off icon for button-like control. Default is null.
     */
    showText?: boolean;

    /**
     * Gets or sets whether validation is performed when new value is being set.
     */
    validateOnSetValue?: boolean;

    /**
     * Gets or sets the value of the control.
     */
    value: any;

    /**
     * Gets or sets the visibility of the control.
     * Only the boolean false value will force the control to be hidden.
     */
    visible: boolean;

    /**
     * Sets whether this and descendant controls should wait for async execution. Default is true.
     */
    waitForExecution?: boolean;

    /**
     * Add new controls that is not predefined in control species as the children of this control.
     * @param control A control or a list of controls to be added.
     */
    append(control: UIControlSpecies | UIControlSpecies[], clear?: boolean): void;

    /**
     * Determines whether this control is the parent of another control.
     * @param other A control.
     * @returns true if this control is the parent of the given control.
     */
    contains(other: UIControl): boolean;

    /**
     * Removes this and all descendant controls from the control tree.
     */
    destroy(): void;

    /**
     * Gets the element responsible for the given layout role.
     * @param role
     */
    getElementForRole(role: string): HTMLElement | undefined;

    /**
     * Gets a dictionary contains property values defined on this control for template substitution.
     * @param raw If specified to true, raw values before template substitution are returned.
     */
    getTemplateContext(raw?: boolean): Zeta.Dictionary;

    /**
     * Set focus to this control.
     */
    focus(): void;

    /**
     * Determines whether the control consists of the specified layout type or provides the specified functional role.
     * @param role Name of layout type or functional role (e.g. button or buttonlist).
     * @returns true if the control has the specified layout type of functional role.
     */
    hasRole(role: string): boolean;

    /**
     * Adds event handler to the spcified event.
     * @param event Name of the event.
     * @param handler Event handler.
     */
    on<T extends UIControlEventName | string>(event: T, handler: UIControlEventHandler<T>): Zeta.UnregisterCallback;

    /**
     * Adds event handlers to the associated events.
     * @param event A dictionary which each property refer to a different event and the corresponding event handler.
     */
    on(event: UIControlEventHandlers): Zeta.UnregisterCallback;

    /**
     * Resets control to its initial state.
     */
    reset(): void;

    /**
     * Sets the value of the control and returns if the operation is successful.
     * @param value Value to be set.
     * @returns true if the value of the control is updated.
     */
    setValue(value: any): boolean;

    /**
     * Performs validation on this and all descendent controls.
     */
    validate(): Promise<any>;

    /**
     * Observes changes to the specified property.
     * @param prop Name of the property to be observed.
     * @param callback Callback to be fired when there are changes to the specified property.
     */
    watch(prop: string, callback?: (newValue: any, oldValue: any, prop: string, self: this) => void, fireInit?: boolean);

    /**
     * Executes operation defined by the control.
     * @param [value] Value to be set before execution.
     * @returns execute A promise object that will be resolved or rejected upon the result of execution.
     */
    execute(value?: any): Promise<any>;
}
