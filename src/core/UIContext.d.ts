/**
 * Represents a two-way binded context of the rendered controls that is exposed to public as a component.
 */
export default class UIContext implements Zeta.Dictionary {
    constructor(store: Zeta.PrivateStore<UIContext, Internal.UIEventContainer>, values?: any);

    /**
     * Returns a simple object containing all binded values.
     */
    toJSON(): object;

    /**
     * Validates all controls.
     */
    validate(): Promise<any>;

    /**
     * Resets all controls' state.
     */
    reset(): void;

    /**
     * Forces all controls to re-render.
     */
    update(): void;

    [s: string]: any;
}
