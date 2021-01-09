import { UIControlCallback, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit, UIControlSpecies } from "./types";

interface CheckboxOption extends UIControlSpeciesOptions<CheckboxOption> {
}

interface CheckboxConstructor extends UIControlSpeciesInit<CheckboxOption> {
    (name: string, options?: CheckboxOption): UIControlSpecies;
    (name: string, execute: UIControlCallback<CheckboxOption>, options?: CheckboxOption): UIControlSpecies;
}

const Checkbox: UIControlSpeciesInitExport<"checkbox", CheckboxConstructor>;
export default Checkbox;
