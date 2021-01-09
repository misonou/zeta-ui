import UIToolset from "src/index";
import Button from "src/Button";
import GenericComponent from "src/Generic";
import { body, delay, initBody, mockFn, verifyCalls, _ } from "../testUtil";
import { catchAsync } from "zeta-dom/util";
import dom from "zeta-dom/dom";

const { objectContaining } = expect;

describe('UIControl.enabled', () => {
    it('should call enabled option callback if provided', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn().mockReturnValue(true);
        const def = ui.button({
            enabled: cb,
            init: function () {
                expect(this.enabled).toBe(true);
                expect(cb).toBeCalled();
            }
        });
        const { div } = initBody(`<div id="div"></div>`);
        def.render(div);
        await delay();
        expect.hasAssertions();
    });
});

describe('UIControl.execute', () => {
    it('should validate control', () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            validate: cb
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        context.button();
        expect(cb).toBeCalledTimes(1);
    });

    it('should reject and not execute when validation failed', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            validate: mockFn().mockRejectedValue(42),
            execute: cb,
            beforeExecute: cb,
            executed: cb,
            afterExecute: cb
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).rejects.toBe(42);
        expect(cb).not.toBeCalled();
    });

    it('should reject and not execute when control is already executing', async () => {
        const ui = new UIToolset().use(Button);
        const def = ui.button({
            execute: function (self) {
                expect(self.execute()).rejects.toBeUndefined();
            }
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).resolves.toBeUndefined();
        expect.assertions(2);
    });

    it('should reject and not execute when control is disabled', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            enabled: false,
            execute: cb
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).rejects.toBeUndefined();
        expect(cb).not.toBeCalled();
    });

    it('should reject and not execute when control is hidden', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            visible: false,
            execute: cb
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).rejects.toBeUndefined();
        expect(cb).not.toBeCalled();
    });

    it('should emit beforeExecute, executed and afterExecute event', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            execute: mockFn().mockReturnValueOnce(null).mockRejectedValueOnce(42),
            beforeExecute: cb,
            executed: cb,
            afterExecute: cb
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await catchAsync(context.button());
        verifyCalls(cb, [
            [objectContaining({ type: 'beforeExecute' }), _],
            [objectContaining({ type: 'executed' }), _],
            [objectContaining({ type: 'afterExecute' }), _]
        ]);
        cb.mockClear();

        await catchAsync(context.button());
        verifyCalls(cb, [
            [objectContaining({ type: 'beforeExecute' }), _],
            [objectContaining({ type: 'afterExecute' }), _]
        ]);
    });

    it('should emit childExecuted to parent controls', async () => {
        const ui = new UIToolset().use(Button, GenericComponent);
        const cb = mockFn();
        const def = ui.generic('parent1', {
            childExecuted: cb,
            controls: [
                ui.generic('parent2', {
                    childExecuted: cb,
                    controls: [ui.button()]
                })
            ]
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await catchAsync(context.button());
        verifyCalls(cb, [
            [objectContaining({ type: 'childExecuted', control: objectContaining({ name: 'button' }) }), objectContaining({ name: 'parent2' })],
            [objectContaining({ type: 'childExecuted', control: objectContaining({ name: 'button' }) }), objectContaining({ name: 'parent1' })]
        ])
    });

    it('should emit event with string value of execute option', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn();
        const def = ui.button({
            execute: 'customEvent'
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);
        const cleanup = dom.on(body, 'customEvent', cb);

        await catchAsync(context.button());
        cleanup();
        expect(cb).nthCalledWith(1, objectContaining({ type: 'customEvent' }), _);
    });
});

describe('UIControl.waitForExecution', () => {
    it('should return a promise that waits for execution result', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn().mockReturnValueOnce(42);
        const def = ui.button({
            waitForExecution: true,
            execute: function () {
                return delay(200).then(cb);
            }
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).resolves.toEqual(42);
        expect(cb).toBeCalledTimes(1);
    });

    it('should return a promise that rejects with execution error', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn().mockRejectedValue(42);
        const def = ui.button({
            waitForExecution: true,
            execute: function () {
                return delay(200).then(cb);
            }
        });
        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).rejects.toEqual(42);
        expect(cb).toBeCalledTimes(1);
    });

    it('does not capture execution result when waitForExecution is false', async () => {
        const ui = new UIToolset().use(Button);
        const cb = mockFn().mockReturnValueOnce(42);
        const def = ui.button({
            waitForExecution: false,
            execute: function () {
                return delay(200).then(cb);
            }
        });

        const { div } = initBody(`<div id="div"></div>`);
        const context = def.render(div);

        await expect(context.button()).resolves.toBeUndefined();
        expect(cb).toBeCalledTimes(0);
    });
});
