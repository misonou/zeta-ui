// @ts-nocheck
import $ from "jquery";
import dom from "zeta-dom/dom";

window.jQuery = $;
window.Promise = Promise;

// qsa is turned off if querySelectorAll is not a native function
// where querying on document fragment requires this feature
Object.defineProperty($.find.support, 'qsa', {
    get: () => true,
    set: () => { }
});

beforeAll(() => dom.ready);

const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;
beforeEach(() => {
    console.error = function () { };
    console.warn = function () { };
    console.log = function () { };
});
afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
});

afterEach(() => {
    $(document.body).empty();
});

expect.extend({
    sameObject(received, actual) {
        if (typeof actual !== 'object' || actual === null) {
            throw new Error('actual must be object');
        }
        const pass = actual === received;
        return { pass, message: () => '' };
    }
});
