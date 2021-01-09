import { UIControlCallback, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit, UIControlSpecies } from "./types";

interface LinkButtonConstructor extends UIControlSpeciesInit {
    (name: string, icon: string, value: string, target?: string, options?: UIControlSpeciesOptions): UIControlSpecies;
}

const LinkButton: UIControlSpeciesInitExport<"link", LinkButtonConstructor>;
export default LinkButton;
