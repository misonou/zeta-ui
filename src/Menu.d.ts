import { UIContext, UIControlSpeciesInitExport, UIControlCollectionSpeciesInit, UIControlSpeciesOptions } from "./types";

interface MenuContext extends UIContext {
    readonly element: HTMLElement;

    showMenu(to, dir, within): void;
    hideMenu(): void;
}

const Menu: UIControlSpeciesInitExport<"menu", UIControlCollectionSpeciesInit<UIControlSpeciesOptions, MenuContext>>;
export default Menu;
