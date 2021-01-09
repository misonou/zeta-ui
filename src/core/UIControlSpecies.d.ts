import { UIControl, UIControlOptions } from "../types";
import UIContext from "./UIContext";
import UIToolset from "./UIToolset";

/**
 * Represents a predefined control with specified behavior which can be rendered later.
 */
export default class UIControlSpecies<T extends UIContext = UIContext> {
    /**
     * Reserved for internal use.
     */
    constructor(toolset: UIToolset, type: string, baseClass: typeof UIControl, name: string, options: UIControlOptions);

    /**
     * Name of the control.
     */
    readonly name: string;

    /**
     * Type of the control.
     */
    readonly type: string;

    /**
     * Render the control in a new detached DOM element.
     * @param context Initial state or context.
     */
    render(context?: Zeta.Dictionary): T;

    /**
     * Render the control inside the given DOM element.
     * @param element A DOM element which the control is rendered as its child.
     * @param context Initial state or context.
     */
    render(element: Element, context?: Zeta.Dictionary): T;

    /**
     * Clones the control with some options overriden.
     * @param options A dictionary containing options to override.
     */
    clone(options?: Zeta.Dictionary): UIControlSpecies<T>;
}
