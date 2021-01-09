import { UIControlCallback, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit, UIControlSpecies } from "./types";

interface ButtonOption extends UIControlSpeciesOptions<ButtonOption> {
    /**
     * Sets whether the button should be places in danger zone.
     */
    danger?: boolean;

    /**
     * Sets whether the button should be initially in the pinned state.
     */
    pinned?: boolean;

    /**
     * Reserved for internal use.
     */
    shortcut?: string;
}

interface ButtonConstructor extends UIControlSpeciesInit<ButtonOption> {
    (name: string, icon: string): UIControlSpecies;
    (name: string, icon: string, options: ButtonOption): UIControlSpecies;
    (name: string, icon: string, execute: UIControlCallback<ButtonOption>): UIControlSpecies;
    (name: string, icon: string, execute: UIControlCallback<ButtonOption>, options: ButtonOption): UIControlSpecies;
}

const Button: UIControlSpeciesInitExport<"button", ButtonConstructor>;
export default Button;
