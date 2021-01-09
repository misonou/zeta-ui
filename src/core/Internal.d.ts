import { UIControlSpeciesOptions, UIEventContext } from "../types";
import UIContext from "./UIContext";
import UIControl from "./UIControl";
import UIControlSpecies from "./UIControlSpecies";
import UIToolset from "./UIToolset";
import UIToolsetState from "./UIToolsetState";

export as namespace Internal;

export declare type UIEventContainer = Zeta.ZetaEventContainer<UIEventContext> & {
    readonly control: UIControl;
    readonly toolset: UIToolset;
    readonly toolsetStates: Map<UIToolset, UIToolsetState>;
    readonly parentContext: UIContext | null;
    readonly parentElement: HTMLElement | null;
    readonly renderer: ZetaUI.UIControlRenderer;
    readonly getSpeciesSpec: (species: UIControlSpecies) => UIControlSpeciesSpec;
};

export interface UIControlSpeciesSpec {
    readonly ctor: typeof UIControl;
    readonly type: string;
    readonly name: string;
    readonly toolset: UIToolset;
    readonly options: UIControlSpeciesOptions;
    readonly handlers: Zeta.Dictionary<Zeta.AnyFunction>;
    readonly defaultExport?: string;
}

export interface UIControlState {
    readonly control: UIControl;
    readonly species: UIControlSpecies;
    readonly container: UIEventContainer;
    readonly toolset: UIToolset;
    readonly options: UIControlSpeciesOptions;
    readonly handlers: Zeta.Dictionary<Zeta.AnyFunction>;
    readonly values: Zeta.Dictionary;
    readonly initialValues: Zeta.Dictionary;
    readonly exports: string[];
    readonly toolsetState: UIToolsetState;
    childContext?: UIContext;
    inited?: boolean;
    inited2?: boolean;
    value?: any;
}
