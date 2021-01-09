import { UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlCollectionSpeciesInit, UIControlSpecies } from "./types";

interface CalloutOption extends UIControlSpeciesOptions<CalloutOption> {
    /**
     * Whether to always behave as a callout button if there is only one enabled child button.
     * If set to false, clicking the callout button will directly execute the child button as if clicking that child button.
     * Default is true.
     */
    alwaysShowCallout?: boolean;
}

interface CalloutConstructor extends UIControlCollectionSpeciesInit<CalloutOption> {
    (name: string, icon: string, ...controls: [...UIControlSpecies[]]): UIControlSpecies;
    (name: string, icon: string, ...controls: [...UIControlSpecies[], O]): UIControlSpecies;
}

const Callout: UIControlSpeciesInitExport<"callout", CalloutConstructor>;
export default Callout;
