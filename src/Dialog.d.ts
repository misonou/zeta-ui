import { UIContext, UIControlSpeciesOptions, UIControlSpeciesInitExport, UIControlCollectionSpeciesInit } from "./types";

interface DialogContext extends UIContext {
    readonly dialog: Promise<any>;
}

interface DialogOption extends UIControlSpeciesOptions<DialogOption> {
    /**
     * Sets whether the dialog can be rendered as a prompt to the button which opens this dialog.
     */
    pinnable?: boolean;

    /**
     * Sets whether the dialog is a modal dialog. Default is true.
     */
    modal?: boolean;
}

interface DialogConstructor extends UIControlCollectionSpeciesInit<DialogOption, DialogContext> {
}

const Dialog: UIControlSpeciesInitExport<"dialog", DialogConstructor>;
export default Dialog;
