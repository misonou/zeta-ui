import { UIContext, UIControlCallback, UIControlSpecies, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlSpeciesInit } from "./types";

interface FileInputConstructor extends UIControlSpeciesInit<UIControlSpeciesOptions> {
    (name: string, icon: string, options?: UIControlSpeciesOptions): UIControlSpecies;
    (name: string, icon: string, execute: UIControlCallback, options?: UIControlSpeciesOptions): UIControlSpecies;
}

const FileInput: UIControlSpeciesInitExport<"file", FileInputConstructor>;
export default FileInput;
