import UIToolset from "src/index";
import Button from "src/Button";
import { click, initBody, mockFn, type } from "../testUtil";

describe('button', () => {
    it('should call execute when clicked', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button('Click me', cb);

        const { div } = initBody(`<div id="div"></div>`);
        def.render(div);

        const button = div.querySelector('button');
        expect(button).not.toBeNull();

        await click(button);
        expect(cb).toBeCalledTimes(1);
    });

    it('should call execute when pressed enter', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button('Click me', cb);

        const { div } = initBody(`<div id="div"></div>`);
        def.render(div);

        const button = div.querySelector('button');
        expect(button).not.toBeNull();

        await type(button, '[enter]');
        expect(cb).toBeCalledTimes(1);
    });

    it('should export execution function by default', () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button('demoButton', cb);

        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        // execute method is exposed to context object
        // same as clicked by user
        expect(context.demoButton).toBeInstanceOf(Function);
        context.demoButton();
        expect(cb).toBeCalledTimes(1);
    });
});
