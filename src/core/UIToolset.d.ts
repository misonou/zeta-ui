import { UIGlobalContext, UIControlTypeOptions, UIToolsetOptions, UIControlRenderer, UIControlEventName, UIControlEventHandler, UIControlEventHandlers, UIControlSpeciesInitExport, UIToolsetEventName, UIToolsetEventHandler, UIToolsetEventHandlers } from "../types";
import UIContext from "./UIContext";
import UIControl from "./UIControl";
import UIControlSpecies from "./UIControlSpecies";
import { alert, confirm, prompt, notify } from "../promptFactory";

declare type WithExport<T> = T extends UIControlSpeciesInitExport<infer U, infer V> ? { [P in U]: V } : {};
declare type WithExportVargs<T extends UIControlSpeciesInitExport[]> = T extends [infer U, ...infer TRest] ? WithExport<U> & WithExportVargs<TRest> : {};

export default class UIToolset {
    constructor(name?: string, options?: UIToolsetOptions);

    /**
     * Gets the name of the tool set.
     */
    readonly name: string;

    /**
     * Gets options passed to the constructor.
     */
    readonly options: UIToolsetOptions;

    static defaultRenderer: UIControlRenderer;

    static readonly globalContext: UIGlobalContext;

    alert: typeof alert;

    confirm: typeof confirm;

    prompt: typeof prompt;

    notify: typeof notify;

    /**
     * Adds control species factory methods to the returning UIToolset instance.
     * This method is solely for TypeScript checking.
     * @param types Exports from control type modules.
     */
    use<T extends UIControlSpeciesInitExport[]>(...types: T): UIToolset & WithExportVargs<T>;

    /**
     * Adds event handler to the spcified event.
     * @param event Name of the event.
     * @param handler Event handler.
     */
    on<T extends UIToolsetEventName>(event: T, handler: UIToolsetEventHandler<T>): void;

    /**
     * Adds event handlers to the associated events.
     * @param event A dictionary which each property refer to a different event and the corresponding event handler.
     */
    on(event: UIToolsetEventHandlers): void;

    /**
     * Adds a localized text to a specific message to be displayed.
     * @param language Language of the localized text.
     * @param key A unique ID that identifies a specific message to be localized.
     * @param value Localized text.
     */
    i18n(language: string, key: string, value: string): void;

    /**
     * Adds a collection of localized text to specific messages to be displayed.
     * @param language Language of the localized text.
     * @param object A dictionary which each property defines the localized text to a specific message.
     */
    i18n(language: string, object: Zeta.Dictionary<string>): void;

    /**
     * Creates a placeholder control which will import all controls exported to the specified ID as if they were directly added to the same location.
     * @param id A string represent the placeholder.
     * @returns A control species.
     */
    import(id: string): UIControlSpecies<UIContext>;

    /**
     * Exports controls so that different tool sets can re-use controls defined by each other.
     * @param id A string represent the placeholder.
     * @param controls Controls to be exported to the specified placeholder ID.
     */
    export(id: string, ...controls: UIControlSpecies<UIContext>[]): void;

    /**
     * Defines a control or layout type.
     * @param type Name of the control or layout type.
     * @param specs An object containing options to define behaviors of the control or layout.
     * @param [layoutOnly] If set to true, these behaviors will be included as part of an control but users cannot create a control of this type.
     */
    static define<T extends string>(type: T, specs: UIControlTypeOptions): ZetaUI.UIControlSpeciesInitExport<T, ZetaUI.UIControlSpeciesInit>;

    /**
     * Gets whether a given element has the specified role.
     * @param element A DOM element.
     * @param role A string or an array of strings specifying role names.
     */
    static hasRole(element: Element, role: string | string[]): boolean;

    /**
     * Adds a localized text to a specific message to be displayed.
     * @param toolset Name of tool set.
     * @param language Language of the localized text.
     * @param key A unique ID that identifies a specific message to be localized.
     * @param value Localized text.
     */
    static i18n(toolset: string, language: string, key: string, value: string): void;

    /**
     * Adds a collection of localized text to specific messages to be displayed.
     * @param toolset Name of tool set.
     * @param language Language of the localized text.
     * @param object A dictionary which each property defines the localized text to a specific message.
     */
    static i18n(toolset: string, language: string, object: Zeta.Dictionary<string>): void;
}
