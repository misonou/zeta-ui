var defaultLocale = 'en';
if (typeof process !== 'undefined' && process.env.ZETA_UI_LOCALE) {
    defaultLocale = process.env.ZETA_UI_LOCALE;
}

/** @type {ZetaUI.UIGlobalContext} */
const globalContext = {
    language: defaultLocale
};
export default globalContext;
