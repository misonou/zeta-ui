import { UIContext, UIControlSpeciesInitExport, UIControlSpeciesInit, UITextInputOptions } from "./types";

interface KeywordValue {
    icon?: string;
    label: string;
    value: any;
}

interface KeywordInputOption extends UITextInputOptions<KeywordInputOption> {
    options?: {
        allowFreeInput?: boolean;
        allowedValues?: (string | KeywordValue)[],
        suggestionCount?: number;
        suggestions?: (string | KeywordValue)[] | ((typedValue: string) => PromiseLike<(string | KeywordValue)[]>)
    }
}

interface KeywordInputConstructor extends UIControlSpeciesInit<KeywordInputOption> {
}

const KeywordInput: UIControlSpeciesInitExport<"keyword", KeywordInputConstructor>;
export default KeywordInput;
