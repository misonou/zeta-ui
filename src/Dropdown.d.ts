import { UIContext, UIControlCallback, UIControlSpecies, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit } from "./types";

interface DropdownOption extends UIControlSpeciesOptions<DropdownOption> {
    /**
     * An array, dictionary or map containing options of the dropdown menu.
     */
    choices?: [] | Zeta.Dictionary<any> | Map<any, any>;

    /**
     * Sets whether the label of the dropdown menu will be changed according to selected option.
     */
    valueAsLabel?: boolean;
}

interface DropdownConstructor extends UIControlSpeciesInit<DropdownOption> {
    (name: string, execute: UIControlCallback<DropdownOption>, options?: DropdownOption);
    (name: string, choices: [] | Map<any, any>, execute?: UIControlCallback<DropdownOption>, options?: DropdownOption);
}

const Dropdown: UIControlSpeciesInitExport<"dropdown", DropdownConstructor>;
export default Dropdown;
