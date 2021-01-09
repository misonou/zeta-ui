import { UIContext, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlCollectionSpeciesInit } from "./types";

interface FormContext extends UIContext {
    readonly form: Promise<any>;
}

interface FormConstructor extends UIControlCollectionSpeciesInit<UIControlSpeciesOptions, FormContext> {
}

const Form: ZetaUUIControlSpeciesInitExport<"form", FormConstructor>;
export default Form;
