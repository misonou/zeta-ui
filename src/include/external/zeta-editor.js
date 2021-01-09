// @ts-nocheck

module.exports = {
    get Editor() {
        try {
            return (window.zeta && zeta.Editor) || require('zeta-editor');
        } catch (e) { }
    }
};
