import { UIContext, UIControlSpeciesInitExport, UIControlSpeciesInit, UITextInputOptions } from "./types";

interface NumberInputOption extends UITextInputOptions<NumberInputOption> {
    options?: {
        max?: number | null;
        min?: number | null;
        digits?: number | 'auto';
        step?: number;
        loop?: boolean;
    }
}

interface NumberInputConstructor extends UIControlSpeciesInit<NumberInputOption> {
}

const NumberInput: UIControlSpeciesInitExport<"number", NumberInputConstructor>;
export default NumberInput;
