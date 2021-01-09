import UIContext from "./UIContext";
import UIControl from "./UIControl";
import UIToolset from "./UIToolset";

export default class UIToolsetState {
    constructor(container: Internal.UIEventContainer, toolset: UIToolset, context: UIContext);

    /**
     * Gets the name of the tool set.
     */
    readonly name: string;

    /**
     * Gets the two-way binded context object created by ControlSpecies#render.
     */
    readonly context: UIContext;

    /**
     * Gets a dictionary containing all controls created by this tool set in the current context.
     */
    readonly all: Zeta.Dictionary<UIControl>;

    /**
     * Gets or sets whether controls of this tool set is enabled or not.
     * This flag takes highest precedence and thus will override individual state of controls.
     */
    enabled: boolean;

    /**
     * Sets the value as the realm flag of controls created with the specified realm name.
     * This flag takes the second highest precedence, other than the enabled flag and thus will override individual state of controls.
     */
    [realm: string]: any;

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
}
