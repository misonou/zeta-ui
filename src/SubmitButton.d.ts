import { UIControlCallback, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit, UIControlSpecies } from "./types";

interface SubmitButtonConstructor extends UIControlSpeciesInit {
    (name: string, icon: string): UIControlSpecies;
    (name: string, icon: string, options: UIControlSpeciesOptions): UIControlSpecies;
    (name: string, icon: string, execute: UIControlCallback): UIControlSpecies;
    (name: string, icon: string, execute: UIControlCallback, options: UIControlSpeciesOptions): UIControlSpecies;
}

const SubmitButton: UIControlSpeciesInitExport<"submit", SubmitButtonConstructor>;
export default SubmitButton;
