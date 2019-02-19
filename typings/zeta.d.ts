/// <reference types="jquery"/>

/**
 * Namespace object containing all functionalites of the zeta library.
 */
declare const zeta: Zeta;

declare const shim: {
    readonly MutationObserver: typeof MutationObserver;
    readonly Map: MapConstructor;
    readonly Set: SetConstructor;
    readonly WeakMap: WeakMapConstructor;
};


/**
 * Source file: helper.js
 */

declare namespace Zeta {
    type Rangeish = Range | Node | HasRange;
    type Rectish = Rect | ClientRect | HasRect;
    type Pointish = Point | Offset | MouseEvent | Touch;
    type HtmlContent = string | Node | Node[] | NodeList | JQuery<any>;
    type IteratorNodeFilterResult = 1 | 2 | 3;
    type IteratorNodeFilter<T> = (node: T) => IteratorNodeFilterResult;
    type MapResultValue<T> = T | T[] | null | undefined;
    type IterateCallbackOrNull<T, R> = null | ((node: T) => MapResultValue<R>);
    type EventType<E extends string, M> = (M & { [s: string]: ZetaEvent })[E];
    type Direction = 'left' | 'top' | 'right' | 'bottom';
    type Direction2D = Direction
        | 'left bottom' | 'left top' | 'right bottom' | 'right top'
        | 'left bottom inset-x' | 'left top inset-x' | 'right bottom inset-x' | 'right top inset-x'
        | 'left bottom inset-y' | 'left top inset-y' | 'right bottom inset-y' | 'right top inset-y'
        | 'left bottom inset' | 'left top inset' | 'right bottom inset' | 'right top inset'
        | 'left center' | 'top center' | 'right center' | 'bottom center' | 'center'
        | 'left center inset' | 'top center inset' | 'right center inset' | 'bottom center inset' | 'center inset' | 'auto';
    type KeyNameModifier = 'shift' | 'ctrl' | 'alt' | 'ctrlShift' | 'altShift' | 'ctrlAlt' | 'ctrlAltShift';
    type KeyNameSpecial = 'backspace' | 'tab' | 'enter' | 'pause' | 'capsLock' | 'escape' | 'space' | 'pageUp' | 'pageDown' | 'end' | 'home' | 'leftArrow' | 'upArrow' | 'rightArrow' | 'downArrow' | 'insert' | 'delete' | 'leftWindow' | 'rightWindowKey' | 'select' | 'numpad0' | 'numpad1' | 'numpad2' | 'numpad3' | 'numpad4' | 'numpad5' | 'numpad6' | 'numpad7' | 'numpad8' | 'numpad9' | 'multiply' | 'add' | 'subtract' | 'decimalPoint' | 'divide' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | 'numLock' | 'scrollLock' | 'semiColon' | 'equalSign' | 'comma' | 'dash' | 'period' | 'forwardSlash' | 'backtick' | 'openBracket' | 'backSlash' | 'closeBracket' | 'singleQuote'
        | 'shiftBackspace' | 'shiftTab' | 'shiftEnter' | 'shiftShift' | 'shiftCtrl' | 'shiftAlt' | 'shiftPause' | 'shiftCapsLock' | 'shiftEscape' | 'shiftSpace' | 'shiftPageUp' | 'shiftPageDown' | 'shiftEnd' | 'shiftHome' | 'shiftLeftArrow' | 'shiftUpArrow' | 'shiftRightArrow' | 'shiftDownArrow' | 'shiftInsert' | 'shiftDelete' | 'shiftLeftWindow' | 'shiftRightWindowKey' | 'shiftSelect' | 'shiftNumpad0' | 'shiftNumpad1' | 'shiftNumpad2' | 'shiftNumpad3' | 'shiftNumpad4' | 'shiftNumpad5' | 'shiftNumpad6' | 'shiftNumpad7' | 'shiftNumpad8' | 'shiftNumpad9' | 'shiftMultiply' | 'shiftAdd' | 'shiftSubtract' | 'shiftDecimalPoint' | 'shiftDivide' | 'shiftF1' | 'shiftF2' | 'shiftF3' | 'shiftF4' | 'shiftF5' | 'shiftF6' | 'shiftF7' | 'shiftF8' | 'shiftF9' | 'shiftF10' | 'shiftF11' | 'shiftF12' | 'shiftNumLock' | 'shiftScrollLock' | 'shiftSemiColon' | 'shiftEqualSign' | 'shiftComma' | 'shiftDash' | 'shiftPeriod' | 'shiftForwardSlash' | 'shiftBacktick' | 'shiftOpenBracket' | 'shiftBackSlash' | 'shiftCloseBracket' | 'shiftSingleQuote'
        | 'ctrlBackspace' | 'ctrlTab' | 'ctrlEnter' | 'ctrlShift' | 'ctrlCtrl' | 'ctrlAlt' | 'ctrlPause' | 'ctrlCapsLock' | 'ctrlEscape' | 'ctrlSpace' | 'ctrlPageUp' | 'ctrlPageDown' | 'ctrlEnd' | 'ctrlHome' | 'ctrlLeftArrow' | 'ctrlUpArrow' | 'ctrlRightArrow' | 'ctrlDownArrow' | 'ctrlInsert' | 'ctrlDelete' | 'ctrl0' | 'ctrl1' | 'ctrl2' | 'ctrl3' | 'ctrl4' | 'ctrl5' | 'ctrl6' | 'ctrl7' | 'ctrl8' | 'ctrl9' | 'ctrlA' | 'ctrlB' | 'ctrlC' | 'ctrlD' | 'ctrlE' | 'ctrlF' | 'ctrlG' | 'ctrlH' | 'ctrlI' | 'ctrlJ' | 'ctrlK' | 'ctrlL' | 'ctrlM' | 'ctrlN' | 'ctrlO' | 'ctrlP' | 'ctrlQ' | 'ctrlR' | 'ctrlS' | 'ctrlT' | 'ctrlU' | 'ctrlV' | 'ctrlW' | 'ctrlX' | 'ctrlY' | 'ctrlZ' | 'ctrlLeftWindow' | 'ctrlRightWindowKey' | 'ctrlSelect' | 'ctrlNumpad0' | 'ctrlNumpad1' | 'ctrlNumpad2' | 'ctrlNumpad3' | 'ctrlNumpad4' | 'ctrlNumpad5' | 'ctrlNumpad6' | 'ctrlNumpad7' | 'ctrlNumpad8' | 'ctrlNumpad9' | 'ctrlMultiply' | 'ctrlAdd' | 'ctrlSubtract' | 'ctrlDecimalPoint' | 'ctrlDivide' | 'ctrlF1' | 'ctrlF2' | 'ctrlF3' | 'ctrlF4' | 'ctrlF5' | 'ctrlF6' | 'ctrlF7' | 'ctrlF8' | 'ctrlF9' | 'ctrlF10' | 'ctrlF11' | 'ctrlF12' | 'ctrlNumLock' | 'ctrlScrollLock' | 'ctrlSemiColon' | 'ctrlEqualSign' | 'ctrlComma' | 'ctrlDash' | 'ctrlPeriod' | 'ctrlForwardSlash' | 'ctrlBacktick' | 'ctrlOpenBracket' | 'ctrlBackSlash' | 'ctrlCloseBracket' | 'ctrlSingleQuote'
        | 'ctrlShiftBackspace' | 'ctrlShiftTab' | 'ctrlShiftEnter' | 'ctrlShiftShift' | 'ctrlShiftCtrl' | 'ctrlShiftAlt' | 'ctrlShiftPause' | 'ctrlShiftCapsLock' | 'ctrlShiftEscape' | 'ctrlShiftSpace' | 'ctrlShiftPageUp' | 'ctrlShiftPageDown' | 'ctrlShiftEnd' | 'ctrlShiftHome' | 'ctrlShiftLeftArrow' | 'ctrlShiftUpArrow' | 'ctrlShiftRightArrow' | 'ctrlShiftDownArrow' | 'ctrlShiftInsert' | 'ctrlShiftDelete' | 'ctrlShift0' | 'ctrlShift1' | 'ctrlShift2' | 'ctrlShift3' | 'ctrlShift4' | 'ctrlShift5' | 'ctrlShift6' | 'ctrlShift7' | 'ctrlShift8' | 'ctrlShift9' | 'ctrlShiftA' | 'ctrlShiftB' | 'ctrlShiftC' | 'ctrlShiftD' | 'ctrlShiftE' | 'ctrlShiftF' | 'ctrlShiftG' | 'ctrlShiftH' | 'ctrlShiftI' | 'ctrlShiftJ' | 'ctrlShiftK' | 'ctrlShiftL' | 'ctrlShiftM' | 'ctrlShiftN' | 'ctrlShiftO' | 'ctrlShiftP' | 'ctrlShiftQ' | 'ctrlShiftR' | 'ctrlShiftS' | 'ctrlShiftT' | 'ctrlShiftU' | 'ctrlShiftV' | 'ctrlShiftW' | 'ctrlShiftX' | 'ctrlShiftY' | 'ctrlShiftZ' | 'ctrlShiftLeftWindow' | 'ctrlShiftRightWindowKey' | 'ctrlShiftSelect' | 'ctrlShiftNumpad0' | 'ctrlShiftNumpad1' | 'ctrlShiftNumpad2' | 'ctrlShiftNumpad3' | 'ctrlShiftNumpad4' | 'ctrlShiftNumpad5' | 'ctrlShiftNumpad6' | 'ctrlShiftNumpad7' | 'ctrlShiftNumpad8' | 'ctrlShiftNumpad9' | 'ctrlShiftMultiply' | 'ctrlShiftAdd' | 'ctrlShiftSubtract' | 'ctrlShiftDecimalPoint' | 'ctrlShiftDivide' | 'ctrlShiftF1' | 'ctrlShiftF2' | 'ctrlShiftF3' | 'ctrlShiftF4' | 'ctrlShiftF5' | 'ctrlShiftF6' | 'ctrlShiftF7' | 'ctrlShiftF8' | 'ctrlShiftF9' | 'ctrlShiftF10' | 'ctrlShiftF11' | 'ctrlShiftF12' | 'ctrlShiftNumLock' | 'ctrlShiftScrollLock' | 'ctrlShiftSemiColon' | 'ctrlShiftEqualSign' | 'ctrlShiftComma' | 'ctrlShiftDash' | 'ctrlShiftPeriod' | 'ctrlShiftForwardSlash' | 'ctrlShiftBacktick' | 'ctrlShiftOpenBracket' | 'ctrlShiftBackSlash' | 'ctrlShiftCloseBracket' | 'ctrlShiftSingleQuote'
        | 'ctrlAltBackspace' | 'ctrlAltTab' | 'ctrlAltEnter' | 'ctrlAltShift' | 'ctrlAltCtrl' | 'ctrlAltAlt' | 'ctrlAltPause' | 'ctrlAltCapsLock' | 'ctrlAltEscape' | 'ctrlAltSpace' | 'ctrlAltPageUp' | 'ctrlAltPageDown' | 'ctrlAltEnd' | 'ctrlAltHome' | 'ctrlAltLeftArrow' | 'ctrlAltUpArrow' | 'ctrlAltRightArrow' | 'ctrlAltDownArrow' | 'ctrlAltInsert' | 'ctrlAltDelete' | 'ctrlAlt0' | 'ctrlAlt1' | 'ctrlAlt2' | 'ctrlAlt3' | 'ctrlAlt4' | 'ctrlAlt5' | 'ctrlAlt6' | 'ctrlAlt7' | 'ctrlAlt8' | 'ctrlAlt9' | 'ctrlAltA' | 'ctrlAltB' | 'ctrlAltC' | 'ctrlAltD' | 'ctrlAltE' | 'ctrlAltF' | 'ctrlAltG' | 'ctrlAltH' | 'ctrlAltI' | 'ctrlAltJ' | 'ctrlAltK' | 'ctrlAltL' | 'ctrlAltM' | 'ctrlAltN' | 'ctrlAltO' | 'ctrlAltP' | 'ctrlAltQ' | 'ctrlAltR' | 'ctrlAltS' | 'ctrlAltT' | 'ctrlAltU' | 'ctrlAltV' | 'ctrlAltW' | 'ctrlAltX' | 'ctrlAltY' | 'ctrlAltZ' | 'ctrlAltLeftWindow' | 'ctrlAltRightWindowKey' | 'ctrlAltSelect' | 'ctrlAltNumpad0' | 'ctrlAltNumpad1' | 'ctrlAltNumpad2' | 'ctrlAltNumpad3' | 'ctrlAltNumpad4' | 'ctrlAltNumpad5' | 'ctrlAltNumpad6' | 'ctrlAltNumpad7' | 'ctrlAltNumpad8' | 'ctrlAltNumpad9' | 'ctrlAltMultiply' | 'ctrlAltAdd' | 'ctrlAltSubtract' | 'ctrlAltDecimalPoint' | 'ctrlAltDivide' | 'ctrlAltF1' | 'ctrlAltF2' | 'ctrlAltF3' | 'ctrlAltF4' | 'ctrlAltF5' | 'ctrlAltF6' | 'ctrlAltF7' | 'ctrlAltF8' | 'ctrlAltF9' | 'ctrlAltF10' | 'ctrlAltF11' | 'ctrlAltF12' | 'ctrlAltNumLock' | 'ctrlAltScrollLock' | 'ctrlAltSemiColon' | 'ctrlAltEqualSign' | 'ctrlAltComma' | 'ctrlAltDash' | 'ctrlAltPeriod' | 'ctrlAltForwardSlash' | 'ctrlAltBacktick' | 'ctrlAltOpenBracket' | 'ctrlAltBackSlash' | 'ctrlAltCloseBracket' | 'ctrlAltSingleQuote'
        | 'altBackspace' | 'altTab' | 'altEnter' | 'altShift' | 'altCtrl' | 'altAlt' | 'altPause' | 'altCapsLock' | 'altEscape' | 'altSpace' | 'altPageUp' | 'altPageDown' | 'altEnd' | 'altHome' | 'altLeftArrow' | 'altUpArrow' | 'altRightArrow' | 'altDownArrow' | 'altInsert' | 'altDelete' | 'alt0' | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5' | 'alt6' | 'alt7' | 'alt8' | 'alt9' | 'altA' | 'altB' | 'altC' | 'altD' | 'altE' | 'altF' | 'altG' | 'altH' | 'altI' | 'altJ' | 'altK' | 'altL' | 'altM' | 'altN' | 'altO' | 'altP' | 'altQ' | 'altR' | 'altS' | 'altT' | 'altU' | 'altV' | 'altW' | 'altX' | 'altY' | 'altZ' | 'altLeftWindow' | 'altRightWindowKey' | 'altSelect' | 'altNumpad0' | 'altNumpad1' | 'altNumpad2' | 'altNumpad3' | 'altNumpad4' | 'altNumpad5' | 'altNumpad6' | 'altNumpad7' | 'altNumpad8' | 'altNumpad9' | 'altMultiply' | 'altAdd' | 'altSubtract' | 'altDecimalPoint' | 'altDivide' | 'altF1' | 'altF2' | 'altF3' | 'altF4' | 'altF5' | 'altF6' | 'altF7' | 'altF8' | 'altF9' | 'altF10' | 'altF11' | 'altF12' | 'altNumLock' | 'altScrollLock' | 'altSemiColon' | 'altEqualSign' | 'altComma' | 'altDash' | 'altPeriod' | 'altForwardSlash' | 'altBacktick' | 'altOpenBracket' | 'altBackSlash' | 'altCloseBracket' | 'altSingleQuote'
        | 'altShiftBackspace' | 'altShiftTab' | 'altShiftEnter' | 'altShiftShift' | 'altShiftCtrl' | 'altShiftAlt' | 'altShiftPause' | 'altShiftCapsLock' | 'altShiftEscape' | 'altShiftSpace' | 'altShiftPageUp' | 'altShiftPageDown' | 'altShiftEnd' | 'altShiftHome' | 'altShiftLeftArrow' | 'altShiftUpArrow' | 'altShiftRightArrow' | 'altShiftDownArrow' | 'altShiftInsert' | 'altShiftDelete' | 'altShift0' | 'altShift1' | 'altShift2' | 'altShift3' | 'altShift4' | 'altShift5' | 'altShift6' | 'altShift7' | 'altShift8' | 'altShift9' | 'altShiftA' | 'altShiftB' | 'altShiftC' | 'altShiftD' | 'altShiftE' | 'altShiftF' | 'altShiftG' | 'altShiftH' | 'altShiftI' | 'altShiftJ' | 'altShiftK' | 'altShiftL' | 'altShiftM' | 'altShiftN' | 'altShiftO' | 'altShiftP' | 'altShiftQ' | 'altShiftR' | 'altShiftS' | 'altShiftT' | 'altShiftU' | 'altShiftV' | 'altShiftW' | 'altShiftX' | 'altShiftY' | 'altShiftZ' | 'altShiftLeftWindow' | 'altShiftRightWindowKey' | 'altShiftSelect' | 'altShiftNumpad0' | 'altShiftNumpad1' | 'altShiftNumpad2' | 'altShiftNumpad3' | 'altShiftNumpad4' | 'altShiftNumpad5' | 'altShiftNumpad6' | 'altShiftNumpad7' | 'altShiftNumpad8' | 'altShiftNumpad9' | 'altShiftMultiply' | 'altShiftAdd' | 'altShiftSubtract' | 'altShiftDecimalPoint' | 'altShiftDivide' | 'altShiftF1' | 'altShiftF2' | 'altShiftF3' | 'altShiftF4' | 'altShiftF5' | 'altShiftF6' | 'altShiftF7' | 'altShiftF8' | 'altShiftF9' | 'altShiftF10' | 'altShiftF11' | 'altShiftF12' | 'altShiftNumLock' | 'altShiftScrollLock' | 'altShiftSemiColon' | 'altShiftEqualSign' | 'altShiftComma' | 'altShiftDash' | 'altShiftPeriod' | 'altShiftForwardSlash' | 'altShiftBacktick' | 'altShiftOpenBracket' | 'altShiftBackSlash' | 'altShiftCloseBracket' | 'altShiftSingleQuote'
        | 'ctrlAltShiftBackspace' | 'ctrlAltShiftTab' | 'ctrlAltShiftEnter' | 'ctrlAltShiftShift' | 'ctrlAltShiftCtrl' | 'ctrlAltShiftAlt' | 'ctrlAltShiftPause' | 'ctrlAltShiftCapsLock' | 'ctrlAltShiftEscape' | 'ctrlAltShiftSpace' | 'ctrlAltShiftPageUp' | 'ctrlAltShiftPageDown' | 'ctrlAltShiftEnd' | 'ctrlAltShiftHome' | 'ctrlAltShiftLeftArrow' | 'ctrlAltShiftUpArrow' | 'ctrlAltShiftRightArrow' | 'ctrlAltShiftDownArrow' | 'ctrlAltShiftInsert' | 'ctrlAltShiftDelete' | 'ctrlAltShift0' | 'ctrlAltShift1' | 'ctrlAltShift2' | 'ctrlAltShift3' | 'ctrlAltShift4' | 'ctrlAltShift5' | 'ctrlAltShift6' | 'ctrlAltShift7' | 'ctrlAltShift8' | 'ctrlAltShift9' | 'ctrlAltShiftA' | 'ctrlAltShiftB' | 'ctrlAltShiftC' | 'ctrlAltShiftD' | 'ctrlAltShiftE' | 'ctrlAltShiftF' | 'ctrlAltShiftG' | 'ctrlAltShiftH' | 'ctrlAltShiftI' | 'ctrlAltShiftJ' | 'ctrlAltShiftK' | 'ctrlAltShiftL' | 'ctrlAltShiftM' | 'ctrlAltShiftN' | 'ctrlAltShiftO' | 'ctrlAltShiftP' | 'ctrlAltShiftQ' | 'ctrlAltShiftR' | 'ctrlAltShiftS' | 'ctrlAltShiftT' | 'ctrlAltShiftU' | 'ctrlAltShiftV' | 'ctrlAltShiftW' | 'ctrlAltShiftX' | 'ctrlAltShiftY' | 'ctrlAltShiftZ' | 'ctrlAltShiftLeftWindow' | 'ctrlAltShiftRightWindowKey' | 'ctrlAltShiftSelect' | 'ctrlAltShiftNumpad0' | 'ctrlAltShiftNumpad1' | 'ctrlAltShiftNumpad2' | 'ctrlAltShiftNumpad3' | 'ctrlAltShiftNumpad4' | 'ctrlAltShiftNumpad5' | 'ctrlAltShiftNumpad6' | 'ctrlAltShiftNumpad7' | 'ctrlAltShiftNumpad8' | 'ctrlAltShiftNumpad9' | 'ctrlAltShiftMultiply' | 'ctrlAltShiftAdd' | 'ctrlAltShiftSubtract' | 'ctrlAltShiftDecimalPoint' | 'ctrlAltShiftDivide' | 'ctrlAltShiftF1' | 'ctrlAltShiftF2' | 'ctrlAltShiftF3' | 'ctrlAltShiftF4' | 'ctrlAltShiftF5' | 'ctrlAltShiftF6' | 'ctrlAltShiftF7' | 'ctrlAltShiftF8' | 'ctrlAltShiftF9' | 'ctrlAltShiftF10' | 'ctrlAltShiftF11' | 'ctrlAltShiftF12' | 'ctrlAltShiftNumLock' | 'ctrlAltShiftScrollLock' | 'ctrlAltShiftSemiColon' | 'ctrlAltShiftEqualSign' | 'ctrlAltShiftComma' | 'ctrlAltShiftDash' | 'ctrlAltShiftPeriod' | 'ctrlAltShiftForwardSlash' | 'ctrlAltShiftBacktick' | 'ctrlAltShiftOpenBracket' | 'ctrlAltShiftBackSlash' | 'ctrlAltShiftCloseBracket' | 'ctrlAltShiftSingleQuote';
    type KeyNameSingleCharacter = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
    type ClickName = 'click' | 'rightClick' | 'doubleClick' | 'ctrlClick' | 'shiftClick' | 'altClick' | 'ctrlShiftClick' | 'ctrlAltClick' | 'altShiftClick' | 'ctrlAltShiftClick';

    interface Point {
        x: number;
        y: number;
    }

    interface Offset {
        left: number;
        top: number;
    }

    interface Rect {
        readonly width: number;
        readonly height: number;
        readonly centerX: number;
        readonly centerY: number;

        top: number;
        left: number;
        right: number;
        bottom: number;

        /**
         * Returns a new rect that represent the specified side of this rect.
         * @param side A string referring one of the four side of a rect.
         * @returns A new rect object.
         */
        collapse(side: Direction, offset?: number): Rect;

        /**
         * Returns a new rect that has the same size but at a different position.
         * @param x Number of pixels to move in X-axis.
         * @param y Number of pixels to move in Y-axis.
         * @returns A new rect object.
         */
        translate(x: number, y: number): Rect;
    }

    interface HasRange {
        /**
         * Gets a DOM range represented by or associated with the object.
         */
        getRange(): Range;
    }

    interface HasRect {
        /**
         * Gets a region on screen represented by or associated with the object.
         */
        getRect(): Rect;
    }

    interface HasElement {
        /**
         * The element represented by or associated with the object.
         */
        readonly element: HTMLElement;
    }

    interface Iterator<T> {
        /**
         * Moves the iterator to previous node. If there is no previous node iterable, the iterator will stay on the same node.
         * @returns The previous node, or null if there is no such node.
         */
        previousNode(): T | null;

        /**
         * Moves the iterator to next node. If there is no next node iterable, the iterator will stay on the same node.
         * @returns The next node, or null if there is no such node.
         */
        nextNode(): T | null;
    }

    interface Dictionary<T> {
        /**
         * Gets the value or object associated with the key.
         */
        [name: string]: T;
    }

    interface ArgumentIterator {
        /**
         * Gets the value of the current argument.
         */
        readonly value: any;

        /**
         * Gets whether all arguments has been consumed.
         */
        readonly done: boolean;

        /**
         * Tests whether the next argument is of the specified type or an instance of the specified constructor.
         * If so, the value of next argument will be set on ArgumentIterator#value.
         * @param type A string referring a JavaScript primitive type or an constructor.
         * @returns true if next argument matches the type.
         */
        next(type: 'string' | 'number' | 'boolean' | 'object' | 'function' | Function): boolean | undefined;

        /**
         * Consumes consecutive arguments that are of the specified primitive type.
         * @param type A string referring a JavaScript primitive type.
         * @returns An array containing arguments of the specified type supplied.
         */
        nextAll<T extends 'string' | 'number' | 'boolean' | 'object' | 'function'>(type: T): T extends 'string' ? string[] : T extends 'number' ? number[] : T extends 'boolean' ? boolean[] : T extends 'object' ? object[] : T extends 'function' ? ((...args) => any)[] : any[];

        /**
         * Consumes consecutive arguments that are instances of the specified constructor.
         * @param type A constructor.
         * @returns An array containing arguments of the specified type supplied.
         */
        nextAll<T extends new (...args: any[]) => any>(type: T): InstanceType<T>[];

        /**
         * Tests and consumes the next arguments if it is a string.
         */
        string(): string | undefined;

        /**
         * Tests and consumes the next arguments if it is a function.
         */
        fn(): ((...args: any[]) => any) | undefined;
    }

    /**
     * Data store to associate private data to objects, filling the use case of private variables.
     */
    interface PrivateStore {
        /**
         * Gets private data associated with the specified object.
         */
        (target: object): any;

        /**
         * Sets private data associated with the specified object.
         */
        (target: object, data: any): any;
    }
}

interface Zeta {
    /**
     * Whether current browser is Internet Explorer.
     */
    readonly IS_IE: boolean;

    /**
     * Whether current browser is Internet Explorer 10.
     */
    readonly IS_IE10: boolean;

    /**
     * Whether current device is running iOS.
     */
    readonly IS_IOS: boolean;

    /**
     * Whether current device is running macOS.
     */
    readonly IS_MAC: boolean;

    /**
     * Whether current device supports touch events.
     */
    readonly IS_TOUCH: boolean;

    readonly Container: ZetaContainerStatic;
    readonly Editor: TyperStatic;
    readonly UI: ZetaUI;

    /**
     * Gets the object containing functions for DOM operations.
     */
    readonly dom: ZetaDOM;

    /**
     * Gets the object containing utility functions.
     */

    readonly helper: ZetaHelper;

    /**
     * Gets the polyfill constructors used by this library.
     */
    readonly shim: typeof shim;
}

interface ZetaHelper {
    /**
     * Copys all properties that is not with undefined value to the object supplied as the first argument.
     * Object values are copied by reference.
     * @param obj An object where properties to be copied to.
     * @param args One or more objects which their properties are copied.
     * @returns The same instance of object supplied as the first argument.
     */
    extend<T extends object>(obj: T, ...args): T & Zeta.Dictionary<any>;

    /**
     * Copys all properties that is not with undefined value to the object supplied as the second argument.
     * @param deep If set to true, object values are copied by value.
     * @param obj An object where properties to be copied to.
     * @param args One or more objects which their properties are copied.
     * @returns The same instance of object supplied as the second argument.
     */
    extend<T extends object>(deep: true, obj: T, ...args): T & Zeta.Dictionary<any>;

    /**
     * A function that performs nothing.
     */
    noop(...args): void;


    /**
     * Creates an iterator that process arguments.
     * @param args A list of arguments.
     */
    readArgs(args: any[] | IArguments): Zeta.ArgumentIterator;

    /**
     * Tests whether the value is an array.
     * @param obj An input value to be tested.
     * @returns The same instance of array if it is a simple object; otherwise false.
     */
    isArray(obj: any): any[] | false;

    /**
     * Tests whether the value is a function.
     * @param obj An input value to be tested.
     * @returns The same instance of function if it is a function; otherwise false.
     */
    isFunction(obj: any): ((...args) => any) | false;

    /**
     * Tests whether the value is a simple object, i.e. created with object literal {}, or with no prototype chain.
     * @param obj An input value to be tested.
     * @returns The same instance of object if it is a simple object; otherwise false.
     */
    isPlainObject(obj: any): object | false;

    /**
     * Iterates through items of the given array or array-like object and performs action on each item.
     * @param obj An array or an array-like object.
     * @param callback Function that will be executed in the context of each item.
     */
    each<T>(obj: T[] | ArrayLike<T>, callback: (i: number, v: T) => any): void;

    /**
     * Iterates through items of the given set and performs action on each item.
     * @param obj A set object.
     * @param callback  Function that will be executed in the context of each item. Unlike Set#forEach, an index for each item is supplied as the key argument of the callback.
     */
    each<T>(obj: Set<T>, callback: (i: number, v: T) => any): void;

    /**
     * Iterates through items of the given map and performs action on each map entry.
     * @param obj A map object.
     * @param callback Function that will be executed in the context of each map entry.
     */
    each<K, V>(obj: Map<K, V>, callback: (i: K, v: V) => any): void;

    /**
     * Iterates through properties of the given object and performs action on each property key-value pair.
     * @param obj An object.
     * @param callback Function that will be executed in the context of each key-value pair.
     */
    each(obj: any, callback: (i: any, v: any) => any): void;

    /**
     * Creates an array containing items that is mapped from each item of the given array or array-like object.
     * @param obj An array or an array-like object.
     * @param callback Function called for each original item which returns one or more items to the result array. If null or undefined is returned, it will not be included in the result array.
     * @returns An array containing resulting items from the callback.
     */
    map<T, R>(obj: T[] | ArrayLike<T>, callback: (v: T, i: number) => Zeta.MapResultValue<R>): R[];

    /**
     * Creates an array containing items that is mapped from each item of the given set.
     * @param obj A set object.
     * @param callback Function called for each original item which returns one or more items to the result array. If null or undefined is returned, it will not be included in the result array.
     * @returns An array containing resulting items from the callback.
     */
    map<T, R>(obj: Set<T>, callback: (v: T, i: number) => Zeta.MapResultValue<R>): R[];

    /**
     * Creates an array containing items that is mapped from each item of the given map.
     * @param obj A map object.
     * @param callback Function called for each original item which returns one or more items to the result array. If null or undefined is returned, it will not be included in the result array.
     * @returns An array containing resulting items from the callback.
     */
    map<K, V, R>(obj: Map<K, V>, callback: (v: V, i: K) => Zeta.MapResultValue<R>): R[];

    /**
     * Creates an array containing items that is mapped from each property key-value pair of the given object.
     * @param obj An object.
     * @param callback Function called for each original item which returns one or more items to the result array. If null or undefined is returned, it will not be included in the result array.
     * @returns An array containing resulting items from the callback.
     */
    map<R>(obj: any, callback: (v: any, i: any) => Zeta.MapResultValue<R>): R[];

    /**
     * Extracts the first item in the given array or array-like object that satifies a condition.
     * @param obj An array or an array-like object.
     * @param callback Function called for each original item which determines if the item satifies a condition.
     * @returns The first item that satisfy the condition; or false if there is none.
     */
    any<T>(obj: T[] | ArrayLike<T>, callback: (v: T, i: number) => any): T | false;

    /**
     * Extracts the first item in the given set that satifies a condition.
     * @param obj A set object.
     * @param callback Function called for each original item which determines if the item satifies a condition.
     * @returns The first item that satisfy the condition; or false if there is none.
     */
    any<T>(obj: Set<T>, callback: (v: T, i: number) => any): T | false;

    /**
     * Extracts the first item in the given map that satifies a condition.
     * @param obj A map object.
     * @param callback Function called for each original item which determines if the item satifies a condition.
     * @returns The first item that satisfy the condition; or false if there is none.
     */
    any<K, V>(obj: Map<K, V>, callback: (v: V, i: K) => any): V | false;

    /**
     * Extracts the first value in the properties of the given object that satifies a condition.
     * @param obj An object.
     * @param callback Function called for each original item which determines if the item satifies a condition.
     * @returns The first item that satisfy the condition; or false if there is none.
     */
    any(obj: any, callback: (v: any, i: any) => any): any;

    /**
     * Iterates the given array or array-like object until a non-falsy value is returned by the given callback.
     * @param obj An array or an array-like object.
     * @param callback Function called for each original item which either returns a non-falsy value to stop iteration or a falsy value to continue.
     * @returns The non-falsy value returned by the last invocation of the given callback.
     */
    single<T, R>(obj: T[] | ArrayLike<T>, callback: (v: T, i: number) => R): R | false;

    /**
     * Iterates the given set until a non-falsy value is returned by the given callback.
     * @param obj A set object.
     * @param callback Function called for each original item which either returns a non-falsy value to stop iteration or a falsy value to continue.
     * @returns The non-falsy value returned by the last invocation of the given callback.
     */
    single<T, R>(obj: Set<T>, callback: (v: T, i: number) => R): R | false;

    /**
     * Iterates the given map until a non-falsy value is returned by the given callback.
     * @param obj A map object.
     * @param callback Function called for each original item which either returns a non-falsy value to stop iteration or a falsy value to continue.
     * @returns The non-falsy value returned by the last invocation of the given callback.
     */
    single<K, V, R>(obj: Map<K, V>, callback: (v: V, i: K) => R): R | false;

    /**
     * Iterates properties of the given object until a non-falsy value is returned by the given callback.
     * @param obj An object.
     * @param callback Function called for each original item which either returns a non-falsy value to stop iteration or a falsy value to continue.
     * @returns The non-falsy value returned by the last invocation of the given callback.
     */
    single<R>(obj: any, callback: (v: any, i: string) => R): R | false;

    /**
     * Creates an object with a single property with the specified name and value.
     * @param key A string represent the property name.
     * @param value A value associated with the property name.
     * @returns An object with the specified property.
     */
    kv<T extends string, V>(key: T, value: V): Record<T, V>;

    /**
     * Creates an array containing the specified item if the given object is not an array.
     * @param obj An input object.
     * @returns The same instance of array if the object is an array;
     * or an array containing items in an array-like object or iterable collection like Map or Set;
     * or an array with exactly one item (the input object) if it does not equals to null or undefined; otherwise an empty array.
     */
    makeArray<T>(obj: T): T[];

    /**
     * Iterates and invoke the given callback for each node.
     * @param iterator Any iterable object with the previousNode and nextNode methods.
     * @param [callback] Function to be called on each node.
     * @param [from] If given, invocation of the callback will be skipped until the specified node.
     */
    iterate<T>(iterator: Zeta.Iterator<T>, callback?: (node: T) => void, from?: T): void;

    /**
     * Creates an array containing each node in the iterated order.
     * @param iterator Any iterable object with the previousNode and nextNode methods.
     * @returns An array containing all nodes.
     */
    iterateToArray<T>(iterator: Zeta.Iterator<T>): T[];

    /**
     * Creates an array containing resulting items from each node in the iterated order.
     * @param iterator Any iterable object with the previousNode and nextNode methods.
     * @param callback Function called for each original item which returns one or more items to the result array. If null or undefined is returned, it will not be included in the result array.
     * @param [from] If given, invocation of the callback will be skipped until the specified node.
     * @param [until] If given, iteration will be stopped once the specified node is iterated, callback will not be fired for this node.
     * @returns An array containing resulting items.
     */
    iterateToArray<T, R>(iterator: Zeta.Iterator<T>, callback: Zeta.IterateCallbackOrNull<T, R>, from?: T, until?: T): Zeta.IterateCallbackOrNull<T, R> extends null ? T[] : R[];

    /**
     * Gets item associated with the specified key in the given map.
     * @param map A map or weak map object.
     * @param key A value or object as the key.
     * @returns The item associated with the key if any.
     */
    mapGet<K, V>(map: Map<K, V> | (K extends object ? WeakMap<K, V> : never), key: K): V;

    /**
     * Gets item associated with the specified key in the given map, and create one if the key does not exist.
     * @param map A map or weak map object.
     * @param key A value or object as the key.
     * @param fn A constructor function, object of this type will be created if the key does not exist in the map.
     * @returns The item associated with the key.
     */
    mapGet<K, T extends new (...args: any[]) => any>(map: Map<K, InstanceType<T>> | (K extends object ? WeakMap<K, InstanceType<T>> : never), key: K, fn: T): InstanceType<T>;

    /**
     * Gets item associated with the specified key in the given map, and create one if the key does not exist.
     * @param map A map or weak map object.
     * @param key A value or object as the key.
     * @param fn A function that returns the item to be stored in the map when called if the key does not exist in the map.
     * @returns The item associated with the key.
     */
    mapGet<K, V>(map: Map<K, V> | (K extends object ? WeakMap<K, V> : never), key: K, fn: () => V): V;

    /**
     * Creates a data store to associate private data to objects, filling the use case of private variables.
     * @returns A function to access the private data store.
     */
    createPrivateStore(): Zeta.PrivateStore;

    /**
     * Returns a dictionary containing all property descriptors defined on the given object.
     * @param obj An input object.
     * @returns A dictionary of property descriptors.
     */
    getOwnPropertyDescriptors(obj: object): PropertyDescriptorMap;

    /**
     * Defined a get/setter property on an object.
     * @param obj An object which the property will be defined on.
     * @param name Name of the property.
     * @param get Getter function of the property.
     * @param [set] Setter function of the property. If none is given, the property will be get only.
     */
    defineGetterProperty(obj: object, name: string, get: () => any, set?: (value: any) => void): void;

    /**
     * Defined a non-enumerable property on an object.
     * @param obj An object which the property will be defined on.
     * @param name Name of the property.
     * @param value Initial value of the property.
     */
    defineHiddenProperty(obj: object, name: string, value: any): void;

    /**
     * Define properties on the prototype object of a function.
     * @param fn A function which its prototype object will have specified properties defined.
     * @param proto An object containing values, getters, setters or methods which will be defined on the prototype object.
     */
    definePrototype<T extends new (...args: any[]) => any>(fn: T, proto: Zeta.Dictionary<number | string | boolean | null | ((this: InstanceType<T>, ...args) => any)>): void;

    /**
     * Creates an object which its prototype is set to the given function's prototype object.
     * @param proto A function with prototype object or an object as the prototype object.
     * @returns A new empty object with the specified prototype.
     */
    inherit<T extends new (...args: any[]) => any>(proto: T, props?: object): InstanceType<T>;

    /**
     * Creates an object which its prototype is set to the given function's prototype object.
     * @param proto A function with prototype object or an object as the prototype object.
     * @returns A new empty object with the specified prototype.
     */
    inherit(proto: any, props?: object): any;

    /**
     * Generates a pseudo random string of 8 characters consists only of lower-cased alphebets and decimal digits (a-z, 0-9).
     * @returns A pseudo random string.
     */
    randomId(): string;

    /**
     * Repeats a given sequence of characters in the specified number of times.
     * @param str An input string.
     * @param count Number of recurrence.
     * @returns A string consists of recurring sequences of the input string.
     */
    repeat(str: string, count: number): string;

    /**
     * Converts a hypenated word into camel casing. It is not the inverse of [zeta.dom.hyphenate] as consecutive upper-cased letters are not preserved.
     * @param str An input string.
     * @returns camel A tring which as the same semantic meaning but in camel casing.
     */
    camel(str: string): string;

    /**
     * Converts a camel-cased string into hypenated lower-cased form. Consecutive upper-cased characters are considered as one word (e.g. DOMString would be converted to dom-string).
     * @param str An input string.
     * @returns A string which has the same semantic meaning but in hyphenated form.
     */
    hyphenate(str: string): string;

    /**
     * Takes an input string and convert the first character into upper case.
     * @param str An input string.
     * @returns A string which the first character is converted to upper case. If the first character is already in upper case, the string is untouched.
     */
    ucfirst(str: string): string;

    /**
     * Takes an input string and convert the first character into lower case.
     * @param str An input string.
     * @returns A string which the first character is converted to lower case. If the first character is already in lower case, the string is untouched.
     */
    lcfirst(str: string): string;

    /**
     * Trims whitespace characters in both ends of the string, including ZWSP (U+200B) but keep NBSP (U+00A0).
     * @param str An input string.
     * @returns A string which whitespace characters in both ends are trimmed.
     */
    trim(str: string): string;

    /**
     * Tests whether a word is contained in a whitespace-separated list of words.
     * @param needle A whitespace-separated list of words.
     * @param haystack A whitespace-separated list of words to match.
     * @returns The first word that appears in both word list; otherwise false.
     */
    matchWord(needle: string, haystack: string): string | false;

    /**
     * Tests whether a given object is an instance of the specified function.
     * @param a An input object to test against.
     * @param b A function.
     * @returns Returns the same object if it is an instance of the function; otherwise false.
     */
    is<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> | false;

    /**
     * Tests whether a given element matches a CSS selector.
     * @param a A DOM element to test against.
     * @param b A valid CSS selector.
     * @returns Returns the given element if the given selector matches the element; otherwise false.
     */
    is(a: Element, b: string): Element | false;

    /**
     * Tests whether a given editor node is of the specified node type.
     * @param a The editor node to test against.
     * @param b A valid node type.
     * @returns Returns the given node if it is of the specified node type; otherwise false.
     */
    is(a: TyperNode, b: TyperNodeType): TyperNode | false;

    /**
     * Returns the tag name of the given element in lower case.
     * @param element A DOM element.
     * @returns The tag name of the given element in lower case.
     */
    tagName(element: Element): string;

    /**
     * Gets whether an HTML element is visually painted.
     * @param a A DOM element.
     * @returns true if visible; otherwise false.
     */
    isVisible(a: Element): boolean;

    /**
     * Tests whether two elements shared the same tag name and attributes.
     * @param a A DOM element.
     * @param b A DOM element.
     * @returns true if the two given elements have the same tag name and attributes.
     */
    sameElementSpec(a: Element, b: Element): boolean;

    /**
     * Returns whether one node precedes the other node in document order.
     * @param a A DOM node.
     * @param b A DOM node.
     * @param [strict] Do not compare if one node is containing another.
     * @returns -1 if the first node precedes the second; 1 if the second node precedes the first; 0 if they are the same node; or NaN if one containing the other when strict to set to true.
     */
    comparePosition(a: Node, b: Node, strict?: boolean): number;

    /**
     * Tests whether two elements is in the same node tree (i.e. document or same fragment).
     * @param a A DOM element.
     * @param b A DOM element.
     * @returns true if the two given elements are connected.
     */
    connected(a: Element, b: Element): boolean;

    /**
     * Tests whether the first node refers the same or contains the second node.
     * @param a A DOM node or other other object with property element set to a DOM node.
     * @param b A DOM node or other other object with property element set to a DOM node.
     * @returns true if the first node refers the same or contains the second node.
     */
    containsOrEquals(a: Node | Zeta.HasElement, b: Node | Zeta.HasElement): boolean;

    /**
     * Gets the common ancestor of the two node.
     * @param a A DOM node.
     * @param b A DOM node.
     * @returns The common ancestor of the two node if they are connected.
     */
    getCommonAncestor(a: Node, b: Node): Element;

    /**
     * Creates a range that select DOM contents describe by the object.
     * @param range An object that encloses part of contents in DOM.
     * @returns A DOM range.
     */
    createRange(range: Zeta.HasRange | Node): Range;

    /**
     * Creates a range that select inner content of a DOM node.
     * If the given node is a DOM element, the element itself is excluded from the result range.
     * @param startNode A DOM node.
     * @param mode Must be the string 'content'.
     * @returns A DOM range.
     */
    createRange(startNode: Node, mode: 'contents'): Range;

    /**
     * Creates a collapsed range before or after, the start or the end of the specified node.
     * @param startNode A DOM node.
     * @param collapse Indicating the position of resulting range: before the start of a node for true; after the end of a node for false; after the start of a node (0-th child) for 0; and before the end of a node (last child) for -0.
     * @returns A DOM range.
     */
    createRange(startNode: Node, collapse: boolean | 0 | -0): Range;

    /**
     * Creates a collapsed range at the specified node and offset.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns A DOM range.
     */
    createRange(startNode: Node, startOffset: number): Range;

    /**
     * Creates a range that starts and ends at the specified node and offset.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @param endNode A DOM node.
     * @param endOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns A DOM range.
     */
    createRange(startNode: Node, startOffset: number, endNode: Node, endOffset: number): Range;

    /**
     * Creates a range that only includes the starting or ending point of a range.
     * @param range A DOM range.
     * @param collapse Includes starting point if true; ending point otherwise.
     * @returns A new DOM range.
     */
    createRange(range: Range, collapse: boolean): Range;

    /**
     * Creates a range that only starts from the starting or ending point of the first range, and ends at the ending point of the second range.
     * @param start A DOM range indicating the starting point.
     * @param end A DOM range indicating the ending point.
     * @returns A new DOM range.
     */
    createRange(start: Range, end: Range): Range;

    /**
     * Tests if the first range covers the second range.
     * @param a A range.
     * @param b A range.
     * @returns true if covers.
     */
    rangeCovers(a: Zeta.Rangeish, b: Zeta.Rangeish): boolean;

    /**
     * Tests if the two given ranges are equal.
     * @param a A range.
     * @param b A range.
     * @returns true if equals.
     */
    rangeEquals(a: Zeta.Rangeish, b: Zeta.Rangeish): boolean;

    /**
     * Tests if the two given ranges intersect, i.e. has common content selected.
     * @param a A range.
     * @param b A range.
     * @returns true if intersects
     */
    rangeIntersects(a: Zeta.Rangeish, b: Zeta.Rangeish): boolean;

    /**
     * Compares if the first range selects content that comes first in document order or vice versa.
     * @param a A range.
     * @param b A range.
     * @param [strict] Do not compare if two ranges intersect.
     * @returns -1 if the first range precedes the second; 1 if the second range precedes the first; 0 if they selects the same range; or NaN if two ranges intersect when strict to set to true.
     */
    compareRangePosition(a: Zeta.Rangeish, b: Zeta.Rangeish, strict?: boolean): number;

    /**
     * Gets a rect object referring the size of current window. Same as passing window as the first argument.
     * @returns A rect object.
     */
    getRect(): Zeta.Rect;

    /**
     * Gets a rect object containing position and dimension information of the specified node.
     * @param element A DOM node, or other object that is associated to a DOM element or a DOM rect.
     * @param [includeMargin] Optionally including margin of a DOM element in calculation.
     * @returns A rect object.
     */
    getRect(element: Window | Node | Zeta.HasRect | Zeta.HasElement, includeMargin?: boolean): Zeta.Rect;

    /**
     * Gets all rect objects that are visually painted for the specified element or text node.
     * @param node A DOM node.
     * @returns An array containing all visually painted rects.
     */
    getRects(node: Node | Range): Zeta.Rect[];

    /**
     * Converts DOM rect which is read-only, to a custom rect object.
     * @param rect A DOM rect object.
     * @returns A custom rect object.
     */
    toPlainRect(rect: DOMRect | ClientRect): Zeta.Rect;

    /**
     * Creates a custom rect object of zero size in the specified position, relative to the top-left corner of the window.
     * @param left X-coordinate in pixels.
     * @param top Y-coordinate in pixels.
     * @returns A custom rect object.
     */
    toPlainRect(left: number, top: number): Zeta.Rect;

    /**
     * Creates a custom rect object with the specified left-top and right-bottom corner positions, relative to the top-left corner of the window.
     * @param left X-coordinate in pixels of left side.
     * @param top Y-coordinate in pixels of top side.
     * @param right X-coordinate in pixels of right side.
     * @param bottom Y-coordinate in pixels of bottom side.
     * @returns A custom rect object.
     */
    toPlainRect(left: number, top: number, right: number, bottom: number): Zeta.Rect;

    /**
     * Tests whether two rects having the same size and in the same position.
     * Subpixeling is handled by considering each side is at the same position when different is less than 1 pixel.
     * @param a A rect object.
     * @param b A rect object.
     * @returns true if two rects have the same size and in the same position.
     */
    rectEquals(a: Zeta.Rect | ClientRect, b: Zeta.Rect | ClientRect): boolean;

    /**
     * Tests whether the first rect covers the second rect.
     * @param a A rect object.
     * @param b A rect object.
     * @returns true if the first rect covers the second rect.
     */
    rectCovers(a: Zeta.Rect | ClientRect, b: Zeta.Rect | ClientRect): boolean;

    /**
     * Tests whether a point, relative to the top-left corner of the window, is contained by or is in proximity to the specified region.
     * @param x X-coordinate in pixels.
     * @param y Y-coordinate in pixels.
     * @param b A rect object specifying the region in the window.
     * @param [within] If set, in number of pixels, the proximity of the point to the region will be tested.
     * @returns true if the point is contained by or is in proximity to the region.
     */
    pointInRect(x: number, y: number, b: Zeta.Rectish, within?: number): boolean;

    /**
     * Computes a rect that covers all given rects.
     * @param rects Rect objects that the resulting rect covers.
     * @returns A rect object.
     */
    mergeRect(...rects: Zeta.Rectish[]): Zeta.Rect;

    /**
     * Gets the topmost element that is visually painted, and reactable in the given coordinate relative to the top-left corner of the window.
     * This method handles IE 10 which does not support the CSS property pointer-events: none.
     * @param x X-coordinate in pixels.
     * @param y Y-coordinate in pixels.
     * @param [within] Optionally restrict to descandent elements of the given element.
     * @returns A DOM element if any.
     */
    elementFromPoint(x: number, y: number, within?: Element): Element;

    /**
     * Creates a DOM element. It is the an alias to Document#createElement.
     * @param tagName Tag name of the element to be created.
     * @returns A DOM element of the specified tag name.
     */
    createElement(tagName: string): Element;

    /**
     * Creates a DOM text node.
     * @param [nodeValue] Text content of the text node to be created.
     * @returns A DOM text node.
     */
    createTextNode(nodeValue?: string): Text;

    /**
     * Creates an empty document fragment or a document fragment containing supplied content.
     * If supplied content is a set of DOM nodes that is descendant from document or other fragment, they will be removed from the original ancestors.
     * If the supplied content is also a document fragment, the same object is returned.
     * @param [content] Content to be inserted to the fragment.
     * @returns A document fragment containing the supplied content.
     */
    createDocumentFragment(content?: Zeta.HtmlContent): DocumentFragment

    /**
     * Creates a DOM node iterator. It is essentially the same as Document#createNodeIterator but allows arguments to be optional.
     * @param root A DOM node.
     * @param whatToShow A bitmask specifying which types of DOM node should be iterated.
     * @returns A DOM node iterator.
     */
    createNodeIterator<T extends number>(root: Element, whatToShow: T): Zeta.Iterator<T extends 1 ? Element : T extends 4 ? Text : Node>;

    /**
     * Gets the state of an element using the given class name.
     * If the element has class names prefixed with the given name ("class-*"), an array of string is returned.
     * @param element A DOM element to be tested.
     * @param className A string specifying the class name.
     */
    getState(element: Element, className: string): boolean | string[];

    /**
     * Sets the element to the specified states using class names.
     * @param element A DOM element.
     * @param dict An object which its key-value pair represents each state.
     */
    setState(element: Element, dict: Zeta.Dictionary<boolean | string[] | Zeta.Dictionary<any>>): void;

    /**
     * Sets the element to the specified states using the given class name.
     * @param element A DOM element.
     * @param className A string specifying the class name.
     * @param values If given true, the class name is added to the element.
     */
    setState(element: Element, className: string, values: boolean | string[] | Zeta.Dictionary<any>): void;

    /**
     * Gets the computed value of z-index CSS property of an element or its pseudo element.
     * @param element A DOM element.
     * @param [pseudo] A CSS pseudo element selector.
     * @returns The computed value of the z-index CSS property.
     */
    getZIndex(element: Element, pseudo?: string): number;

    /**
     * Gets a z-index CSS property value that is 1 higher than the given element.
     * @param element A DOM element.
     * @returns A number defining a CSS property value.
     */
    getZIndexOver(element: Element): number;

    /**
     * Sets the value of z-index CSS property such that the first element will be painted above the second element.
     * @param element A DOM element to be painted above.
     * @param over A DOM element to be painted below.
     */
    setZIndexOver(element: Element, over: Element): void;

    /**
     * Computes a set of CSS rules that, when applied to an element, the specified corner of that element
     * will be at the given position relative to the top-left corner of the window.
     * @param x X-coordinate in pixels.
     * @param y Y-coordinate in pixels.
     * @param [origin] The corner of an element to be set to the given position. Default is top left.
     * @param [parent] When given, the CSS rules will be computed base on the top left corner of the parent rather than document body.
     * @returns A set of CSS rules which contains the left, top, right and bottom rules.
     */
    cssFromPoint(x: number, y: number, origin?: Zeta.Direction2D, parent?: Element): object;

    /**
     * Computes a set of CSS rules that, when applied to an element, the specified corner of that element
     * will be at the given position relative to the top-left corner of the window.
     * @param point A point in pixels.
     * @param [origin] The corner of an element to be set to the given position. Default is top left.
     * @param [parent] When given, the CSS rules will be computed base on the top left corner of the parent rather than document body.
     * @returns A set of CSS rules which contains the left, top, right and bottom rules.
     */
    cssFromPoint(point: Zeta.Pointish, origin?: Element, parent?: Element): object;

    /**
     * Gets a set of CSS rules which has the top, left, right, bottom, width and height properties based on the given rect.
     * @param rect A rect object.
     * @param [parent] When given, the CSS rules will be computed base on the top left corner of the parent rather than document body.
     * @returns A set of CSS rules which contains the left, top, right, bottom, width and height rules.
     */
    cssFromRect(rect: Zeta.Rectish, parent?: Element): object;

    /**
     * Places an element to such that the top-left corner of the element is at the specified point relative to the top-left corner of the window.
     * @param element A DOM element.
     * @param to A point in pixels.
     */
    position(element: Element, to: Zeta.Pointish): void;

    /**
     * Places an element to such that the element is at the corner or side of another element,
     * and optionally fit the position such that the entire element is inside of another element.
     * @param element A DOM element.
     * @param to A DOM element such that the element given by the first argument will be placed with respect to this element.
     * @param dir A string represent a corner or a side of the element given by the second argument to align with.
     * @param [within] Optionally fit the entire element given by the first argument to be inside this element.
     */
    position(element: Element, to: Element | Window, dir: Zeta.Direction2D, within?: Element | Window): void;

    /**
     * Adds a class to the element and returns a promise that is fulfilled when the CSS animation or transition is completed.
     * If there is no animation or transition triggered, the promise is immediately fulfilled.
     * If the class is removed before the animation or transition is completed, the promise will be rejected.
     * If the element already has the given class, a rejected promise is returned.
     * @param element A DOM element.
     * @param className A string specifying the class name which triggers CSS animation or transition.
     * @param callback A callback that is synchronously called when animation or transition is completed.
     */
    runCSSTransition(element: Element, className: string, callback?: boolean | (() => any)): Promise<any>;

    /**
     * Adds event listeners to the Window object or other DOM elements.
     * @param element The Window object or a DOM element which event listeners are attached to.
     * @param event A whitespace-separated list of event names.
     * @param listener Function to be called when the specified event(s) is/are dispatched.
     * @param [useCapture] Optionally set the event listeners to be triggered in capture phase.
     */
    bind(element: EventTarget, event: string, listener: (e: Event) => void, useCapture?: boolean | AddEventListenerOptions): (() => void);

    /**
     * Adds event listeners to the Window object or other DOM elements.
     * @param element The Window object or a DOM element which event listeners are attached to.
     * @param event A dictionary which each property represents a event listener associated to an event.
     * @param [useCapture] Optionally set the event listeners to be triggered in capture phase.
     */
    bind(element: EventTarget, event: Zeta.Dictionary<(e: Event) => void>, useCapture?: boolean | AddEventListenerOptions): (() => void);

    /**
     * Creates a promise object that is resolved by the given value or that is depends on another promise object.
     * @param [obj] The fulfillment value or a promise object.
     * @returns A promise object.
     */
    when(obj?: any): Promise<any>;

    /**
     * Creates a promise object that, waits until all promises are fulfilled or rejected,
     * and then resolves if all promises are fulfilled, or rejects if any one of them is rejected.
     * @param promises Promises to be waited.
     * @returns A promise object.
     */
    waitAll(promises: Promise<any>[]): Promise<any>;

    /**
     * Creates a rejected promise object with the given reason.
     * @param [reason] Value to be passed to rejection handler.
     * @returns A promise object.
     */
    reject(reason?: any): Promise<any>;

    /**
     * Registers a callback to a promise object which is always fired whenever the promise object is fulfilled or rejeccted.
     * @param promise A promise object.
     * @param callback A callback function that receives the promise state and the fulfillment value or rejection reason.
     */
    always(promise: Promise<any>, callback: (resolved: boolean, value: any) => any): void;

    /**
     * Selects a range of contents.
     * If the ending position is before the starting position, i.e. select contents backwards,
     * directionality is preserved if browser supports.
     * @param base Starting position.
     * @param extent Ending position.
     */
    makeSelection(base: Zeta.Rangeish, extent: Zeta.Rangeish): void;

    /**
     * Places a text cursor at the specified position.
     * @param node A DOM element or text node.
     * @param offset A number representing the n-th child of an element or the n-th characters of a text node. 
     */
    makeSelection(node: Node, offset: number): void;

    /**
     * Removes the specified DOM node from the DOM tree where it currently belongs to.
     * @param node A DOM node.
     */
    removeNode(node: Node): void;
}

/**
 * Source file: dom.js
 */

type ZetaEventHandler<E, T> = (this: T, e: E & ZetaEventContext<T>, self: T) => any;

type ZetaEventName = 'init' | 'destroy' | 'focusin' | 'focusout' | 'focusreturn' | 'metakeychange' | 'keystroke' | 'typing' | 'textInput' | 'mousedown' | 'mousewheel' | 'asyncStart' | 'asyncEnd' | Zeta.KeyNameSpecial | Zeta.ClickName;

type ZetaEventSource = 'script' | 'mouse' | 'keyboard' | 'touch' | 'input' | 'cut' | 'copy' | 'paste' | 'drop';

type ZetaEventTypeMap = { [P in Zeta.ClickName]: ZetaMouseEvent } & {
    focusin: ZetaFocusEvent;
    focusout: ZetaFocusEvent;
    mousedown: ZetaMouseEvent;
    mousewheel: ZetaWheelEvent;
    metakeychange: ZetaKeystrokeEvent;
    keystroke: ZetaKeystrokeEvent;
    gesture: ZetaGestureEvent;
    textInput: ZetaTextInputEvent;
};

type ZetaDOMEventHandler<E extends string, T extends (Zeta.HasElement | Element) = Element> = ZetaEventHandler<Zeta.EventType<E, ZetaEventTypeMap>, T>;

type ZetaDOMEventHandlers<T extends (Zeta.HasElement | Element) = Element> = { [P in ZetaEventName]?: ZetaDOMEventHandler<P, T> };

interface ZetaEventContext<T> {
    /**
     * Gets a custom object that represents a functional sub-component.
     */
    readonly context: T;
}

interface ZetaEvent {
    /**
     * Gets the event name.
     */
    readonly eventName: string;

    /**
     * Gets the event name.
     */
    readonly type: string;

    /**
     * Gets the DOM element that received this event.
     */
    readonly target: HTMLElement;

    /**
     * Gets the user action which triggers this event.
     * If this event is not directly triggered from DOM events, i.e. it is fan out from other components, the value is always script.
     */
    readonly source: ZetaEventSource;

    /**
     * Gets the key or key combinations if this event is triggered by keyboard.
     */
    readonly sourceKeyName: Zeta.KeyNameSingleCharacter | Zeta.KeyNameSpecial;

    /**
     * Gets the data associated with this event.
     */
    readonly data: any;

    /**
     * Gets a high precision timestamp indicating the time at which this event is fired.
     * @see Performance#now
     */
    readonly timestamp: number;

    /**
     * Gets the native DOM event that triggers this event.
     */
    readonly originalEvent: Event | null;

    /**
     * Signals that this event or user action is already handled and should not be observed by other components.
     * @param [promise] A value or a promise object for async handlng.
     */
    handled(promise?: Promise<any> | any): void;

    /**
     * Gets whether this event or user action is already handled.
     * @returns true if handled.
     */
    isHandled(): boolean;

    /**
     * Suppresses the default behavior by the browser.
     */
    preventDefault(): void;

    /**
     * Gets whether the default behavior by browser is suppressed.
     * @returns true if The the default behavior is suppressed.
     */
    isDefaultPrevented(): boolean;
}

interface ZetaFocusEvent extends ZetaEvent {
    readonly relatedTarget: HTMLElement;
}

interface ZetaMouseEvent extends ZetaEvent {
    readonly clientX: number;
    readonly clientY: number;
    readonly metakey: string;
}

interface ZetaWheelEvent extends ZetaEvent {
    readonly data: -1 | 1;
}

interface ZetaKeystrokeEvent extends ZetaEvent {
    readonly data: string;
}

interface ZetaGestureEvent extends ZetaEvent {
    readonly data: string;
}

interface ZetaTextInputEvent extends ZetaEvent {
    readonly data: string;
}

interface ZetaDOM {
    /**
     * Gets the DOM event which triggers the current event loop.
     */
    readonly event: Event | null;

    /**
     * Gets the current active element which is readily receiving user input.
     */
    readonly activeElement: HTMLElement;

    /**
     * Gets the type of user interaction that triggers the current event.
     */
    readonly eventSource: ZetaEventSource;

    /**
     * Scroll all ancestor container so that the specified element is in view.
     * @param element Element to be scrolled into view.
     * @param rect A rect represent a region inside the element to be scrolled into view.
     */
    scrollIntoView(element: Element, rect?: Zeta.Rectish): void;

    /**
     * Determines whether current window is in focus.
     * @param window Window object.
     */
    focused(window: Window): boolean;

    /**
     * Determines whether a given element is in focus.
     * @param element A DOM element.
     */
    focused(element: Element, strict?: boolean): boolean;
    getContext(element?: Element): any;
    prepEventSource(promise: Promise<any>): Promise<any>;
    getEventSource(element: Element): ZetaEventSource;
    focus(element: Element): void;
    lock(element: Element, promise: Promise<any>, oncancel?: () => Promise<any>): Promise<any>;
    lock(element: Element, modal: boolean, promise?: Promise<any>, oncancel?: () => Promise<any>): Promise<any>;
    locked(element: Element, parents?: boolean): boolean;
    cancel(element: Element, force?: boolean): void;
    emit(eventName: string, target: Element, data?: any, bubbles?: boolean)
    on<T extends ZetaEventName>(event: T, handler: ZetaDOMEventHandler<T>): void;
    on(event: string, handler: ZetaDOMEventHandler<any>): void;
    on(event: ZetaDOMEventHandlers): void;
    on<T extends ZetaEventName>(element: Element, event: T, handler: ZetaDOMEventHandler<T>): void;
    on(element: Element, event: string, handler: ZetaDOMEventHandler<any>): void;
    on(element: Element, event: ZetaDOMEventHandlers): void;
    setModal(element: Element): void;
    retainFocus(a: Element, b: Element): void;
    releaseFocus(a: Element, b: Element): void;
    mixin(element: Element): ZetaMixin;
    mixin(mixin: object): void;
    support(method: keyof ZetaMixin | string, excludeMe?: boolean): ((...args) => any) | false;
    snap(element: Element, to: Element | Window, dir?: Zeta.Direction2D): void;
    snap(element: Element, dir: Zeta.Direction2D): void;
    unsnap(element: Element): void;
    getShortcut(command: string): Zeta.KeyNameSpecial[];
    setShortcut(command: string, keys: string): void;
    setShortcut(command: Zeta.Dictionary<Zeta.KeyNameSpecial>): void;
    drag(e: Event | ZetaEvent, callback?: (x: number, y: number) => void): Promise<any>;
    drag(e: Event | ZetaEvent, within: Element, callback?: (x: number, y: number) => void): Promise<any>;
}

interface ZetaContainerStatic {
    /**
     * Creates a component that can re-route DOM events to its sub-components.
     * @param element The root element of this component.
     * @param context A public-facing object, possibly contains APIs to this component.
     */
    new <T extends Element | Zeta.HasElement>(element: Element, context?: any): ZetaContainer<T>;

    /**
     * Gets the prototype object which defines methods of ZetaContainer instances.
     */
    readonly prototype: ZetaContainer;
}

interface ZetaContainer<T extends Element | Zeta.HasElement = Element> {
    /**
     * Gets the event currently being fired within this container.
     */
    readonly event: (ZetaEvent & ZetaEventContext<T>) | null;

    /**
     * Registers event handlers to a DOM element.
     * @param element A DOM element.
     * @param handlers An object which each entry represent the handler to be registered on the event.
     * @returns A randomly generated key.
     */
    add(element: Element, handlers: ZetaDOMEventHandlers<T>): string;

    /**
     * Registers event handlers to a DOM element with a specific key.
     * @param element A DOM element.
     * @param key A string to be used as the key.
     * @param handlers An object which each entry represent the handler to be registered on the event.
     * @returns The specified key.
     */
    add(element: Element, key: string, handlers: ZetaDOMEventHandlers<T>): string;

    /**
     * Removes the element from the container.
     * Handlers for destroy event will be fired unless handlers are added back immediately using the same key.
     * @param element A DOM element.
     */
    delete(element: Element): void;

    /**
     * Removes event handlers that is registered using the specified key.
     * Handlers for destroy event registered using the key will be fired unless handlers are added back immediately using the same key.
     * @param element A DOM element.
     * @param key A string to be used as the key.
     */
    delete(element: Element, key: string): void;

    /**
     * Defunct the container. Destroy event will be fired for all registered elements.
     */
    destroy(): void;

    /**
     * Re-emits an event to components.
     * If the event is handled by component, a promise object is returned.
     * @param event An instance of ZetaEvent representing the event to be re-emitted.
     * @param [target] A DOM element which the event should be dispatched on.
     * @param [data] Any data to be set on ZetaEvent#data property. If an object is given, the properties will be copied to the ZetaEvent object during dispatch.
     * @param [bubbles] Specifies whether the event should bubble up through the component tree. Default is true.
     */
    emit(event: ZetaEvent, target?: Element, data?: any, bubbles?: boolean): Promise<any> | false;

    /**
     * Emits an event to components synchronously.
     * If the event is handled by component, a promise object is returned.
     * @param eventName Event name.
     * @param [target] A DOM element which the event should be dispatched on.
     * @param [data] Any data to be set on ZetaEvent#data property. If an object is given, the properties will be copied to the ZetaEvent object during dispatch.
     * @param [bubbles] Specifies whether the event should bubble up through the component tree. Default is true.
     */
    emit(eventName: string, target?: Element, data?: any, bubbles?: boolean): Promise<any> | false;

    /**
     * Emits an event to components asynchronously.
     * @param eventName Event name.
     * @param [target] A DOM element which the event should be dispatched on.
     * @param [data] Any data to be set on ZetaEvent#data property. If an object is given, the properties will be copied to the ZetaEvent object during dispatch.
     * @param [bubbles] Specifies whether the event should bubble up through the component tree. Default is true.
     * @param [mergeData] A callback to aggregates data from the previous undispatched event of the same name on the same target.
     */
    emitAsync(eventName: string, target?: Element, data?: any, bubbles?: boolean, mergeData?: (v, a) => any): void;

    /**
     * Gets the custom object that represents the given element,
     * @param element A DOM element.
     */
    getContext(element: Element): T;

    /**
     * Defines a custom object that represents a DOM component.
     * @param element A DOM element.
     * @param context Any object that has the property "element" pointing to the same DOM element.
     */
    setContext(element: Element, context: T): void;

    /**
     * Listens DOM mutations in this container.
     * Mutations from nested containers will not be propagated to parent containers.
     * @param callback A callback to be fired asynchronously when there are changes.
     * @param options An object specifying which types of mutations shuold be included.
     */
    observe(callback: (mutations: MutationRecord[]) => any, options: MutationObserverInit): void;

    /**
     * Adds a handler to intercept event being fired within this container.
     * @param handler An event handler.
     */
    tap(handler: ZetaEventHandler<ZetaEvent, ZetaContainer>): void;

    /**
     * Fire scheduled asynchronous events immediately.
     */
    flushEvents(): void;
}

interface ZetaMixin {
    /**
     * Gets a binded function that performs the required method on a given element.
     * @param method Name of the required method.
     * @returns A binded function if the method is supported; otherwise false.
     */
    support(method: keyof ZetaMixin): ((...args) => any) | false;

    canUndo(): boolean;
    canRedo(): boolean;
    disable(): void;
    enable(): void;
    enabled(): void;
    focus(): void;
    getUnobscuredRect(): Zeta.Rectish;
    getValue(): any;
    redo(): void;
    scrollBy(x: number, y: number): Zeta.Point | false;
    setValue(value: any): void;
    undo(): void;
}

/**
 * Source file: editor.js
 */

declare enum TyperNodeType {
    NODE_WIDGET = 1,
    NODE_EDITABLE = 2,
    NODE_PARAGRAPH = 4,
    NODE_INLINE = 16,
    NODE_EDITABLE_PARAGRAPH = 32,
    NODE_INLINE_WIDGET = 64,
    NODE_INLINE_EDITABLE = 128,
    NODE_SHOW_HIDDEN = 8192,
}

type TyperCommand = (tx: TyperTransaction, value?: any) => void;

type TyperCaretPoint = 'base' | 'extend' | 'start' | 'end';

type TyperSelectMode = 'word';

type TyperEventName = ZetaEventName | 'setup' | 'extract' | 'receive' | 'stateChange' | 'contentChange';

type TyperEventTypeMap = ZetaEventTypeMap & {
    extract: TyperExtractEvent;
    receive: TyperReceiveEvent;
};

type TyperEventHandler<T extends string> = ZetaEventHandler<Zeta.EventType<T, TyperEventTypeMap> & TyperEvent, TyperWidget>;

type TyperEventHandlers = { [P in TyperEventName]?: TyperEventHandler<P> };

interface TyperEvent extends ZetaEvent, ZetaEventContext<TyperWidget> {
    /**
     * Gets the instance of zeta editor associated with the event.
     */
    readonly typer: Typer;

    /**
     * Gets the widget associated with the event.
     */
    readonly widget: TyperWidget;
}

interface TyperExtractEvent extends TyperEvent {
    /**
     * Gets the DOM element cloned from the selected part of this widget.
     */
    readonly extractedNode: HTMLElement;
}

interface TyperReceiveEvent extends TyperEvent {
    /**
     * Gets the DOM element that is recognized as a widget of the same type as this widget.
     */
    readonly receivedNode: HTMLElement;

    /**
     * Gets the current text cursor position.
     */
    readonly caret: TyperCaret;
}

interface TyperStatic {
    readonly NODE_WIDGET: TyperNodeType;
    readonly NODE_EDITABLE: TyperNodeType;
    readonly NODE_EDITABLE_PARAGRAPH: TyperNodeType;
    readonly NODE_PARAGRAPH: TyperNodeType;
    readonly NODE_INLINE: TyperNodeType;
    readonly NODE_INLINE_WIDGET: TyperNodeType;
    readonly NODE_INLINE_EDITABLE: TyperNodeType;
    readonly NODE_ANY_ALLOWTEXT: TyperNodeType,
    readonly NODE_ANY_BLOCK_EDITABLE: TyperNodeType,
    readonly NODE_ANY_INLINE: TyperNodeType,
    readonly ZWSP: string;
    readonly ZWSP_ENTITY: string;

    /**
     * Creates a new instance of zeta editor with the specified options.
     */
    new(element: Element, options?: TyperOptions): Typer;

    /**
     * Defines widgets that are available globally.
     */
    readonly widgets: Zeta.Dictionary<TyperWidgetDefinition>;

    /**
     * Specifies whether widget of the specified name should be effective by default unless overriden by options to individual editor or if default options are suppressed.
     */
    readonly defaultOptions: { [name: string]: boolean };

    /**
     * Gets the prototype object which defines methods of Typer instance.
     */
    readonly prototype: Typer;

    addLayer(name: string, callback: (canvas: TyperCanvas) => void): void;
    handle(cursor: string, onrelease?: () => void): TyperCanvasHandle;
}

interface Typer extends TyperDocument, Zeta.HasElement, TyperSelectionPrototype, TyperCommandInvoker {
    /**
     * Gets the root element containing editable content.
     */
    readonly element: HTMLElement;

    /**
     * Gets or sets how many versions to store during editing.
     */
    historyLevel: number;

    /**
     * Gets whether there is newer versions of content in the history stack.
     * @returns true if there is newer versions.
     */
    canRedo(): boolean;

    /**
     * Gets whether there is earlier versions of content in the history stack.
     * @returns true if there is earlier versions.
     */
    canUndo(): boolean;

    /**
     * Finds the closest ancestor of a specified type of a given node.
     * @param node A node.
     * @param nodeType A numeric value representing the node type.
     * @returns A node of the specified type that is an ancestor of the given node.
     */
    closest(node: TyperNode, nodeType: TyperNodeType): TyperNode;

    /**
     * Creates a mutable object that represents an editable location within the editor, like a text cursor.
     * @returns A caret object.
     */
    createCaret(): TyperCaret;

    /**
     * Creates a mutable object that represents an editable location within the editor, like a text cursor, at the specified intial position.
     * @param node A DOM node.
     * @param offset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns A caret object.
     */
    createCaret(node: Node, offset: number): TyperCaret;

    /**
     * reates a mutable object that represents an editable location within the editor, like a text cursor, at the specified intial position.
     * @param element A DOM node.
     * @param collapse Specify the position: before the start of a node for true; after the end of a node for false.
     * @returns A caret object.
     */
    createCaret(element: Node, collapse: boolean): TyperCaret;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param range A DOM range object or any object that describe a range within the editor.
     * @returns A selection object.
     */
    createSelection(range: Zeta.HasRange): TyperSelection;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param startNode A DOM node.
     * @param collapse Indicating the position of resulting range: before the start of a node for true; after the end of a node for false; after the start of a node (0-th child) for 0; and before the end of a node (last child) for -0.
     * @returns A selection object.
     */
    createSelection(startNode: Node, collapse: boolean | 0 | -0): TyperSelection;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns A selection object.
     */
    createSelection(startNode: Node, startOffset: number): TyperSelection;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @param endNode A DOM node.
     * @param endOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns A selection object.
     */
    createSelection(startNode: Node, startOffset: number, endNode: Node, endOffset: number): TyperSelection;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param range A DOM range.
     * @param collapse Includes starting point if true; ending point otherwise.
     * @returns A selection object.
     */
    createSelection(range: Range, collapse: boolean): TyperSelection;

    /**
     * Creates a mutable object that represents an editable location or a part of contents within the editor.
     * @param start A DOM range indicating the starting point.
     * @param end A DOM range indicating the ending point.
     * @returns A selection object.
     */
    createSelection(start: Range, end: Range): TyperSelection;

    /**
     * Creates a tree walker that traverses through editable contents within the editor.
     * @param root A node specifying where only nodes within will be traversed.
     * @param whatToShow A bitmask specifying which types of DOM node should be iterated.
     * @param [filter] An optional callback that instructs the tree walker to skip a node or all its descandents depending on the returned value.
     */
    createTreeWalker(root: TyperNode, whatToShow: number, filter?: Zeta.IteratorNodeFilter<TyperNode>): TyperTreeWalker;

    /**
     * Disables the editor.
     */
    disable(): void;

    /**
     * Enables the editor.
     */
    enable(): void;

    /**
     * Enables a widget for this editor. If the mentioned widget has already been enabled, this method has no effects.
     * @param id Name of widget.
     * @param [options] Options supplied to the widget.
     */
    enable(id: string, options?: any): void;

    /**
     * Gets whether the editor is enabled.
     * @returns true if the editor is enabled.
     */
    enabled(): boolean;

    /**
     * Extracts text or text-only representation of a given part of the editable content.
     * @param [selection] A DOM range object.
     * @returns A string containing text or text-only representation of the selected content.
     */
    extractText(selection?: Zeta.Rangeish): string;

    /**
     * Sets focus to the editor.
     */
    focus(): void;

    /**
     * Gets whether the editor is focused.
     * @param [strict]
     */
    focused(strict?: boolean): boolean;

    /**
     * Gets the physical direction of a box that is the semantic direction with respect to the writing mode of the given node.
     * @param side A string specifying the semantic direction.
     * @param node A DOM node.
     * @returns A string representing the physical direction.
     */
    getAbstractSide(side: 'block-start' | 'block-end' | 'inline-start' | 'inline-end' | 'over' | 'under' | 'line-left' | 'line-right', node: Node): Zeta.Direction;

    /**
     * Gets the active selection of the editor which controls text cursors and selected region at where content is edited by user actions.
     * @returns A selection object.
     */
    getSelection(): TyperSelection;

    /**
     * Gets the instance of editor widget of the specified name.
     * @param id Name of widget.
     * @returns A widget object if the specified editor widget is enabled in this editor; or null if it is not enabled or it is a content widget.
     */
    getStaticWidget(id: string): TyperWidget | null;

    /**
     * Gets all editor widgets.
     * @returns An array containing a list of static widgets.
     */
    getStaticWidgets(): TyperWidget[];

    /**
     * Gets a value representing contents within the editor.
     * The value returned is not necessarily equals to the HTML markup of visible contents in the editor.
     * @returns A string containing HTML markup, or other values if this method is overriden.
     */
    getValue(): any;

    /**
     * Gets whether the specific command is available at the current position or selection.
     * @param commandName Name of command.
     * @returns true if the command is available.
     */
    hasCommand(commandName: string): boolean;

    /**
     * Gets whether there are visible contents within the editor.
     * It does not imply there are actual semantic contents, calling getValue() might return empty value even though this method returns true.
     * @returns true if there are visible contents.
     */
    hasContent(): boolean;

    /**
     * Gets a node object representing the editable content at the specified position relative to the top-left corner of the window.
     * @param x X-coordinate in pixels.
     * @param y Y-coordinate in pixels.
     * @param [whatToShow] Optionally filters what types of content to be returned.
     * @returns An editor node object representing editable contents.
     */
    nodeFromPoint(x: number, y: number, whatToShow?: number): TyperNode;

    /**
     * Adds event handler to the spcified event.
     * @param event Name of the event.
     * @param handler Event handler.
     */
    on<T extends TyperEventName>(event: T, handler: TyperEventHandler<T>): void;

    /**
     * Adds event handler to the spcified event.
     * @param event Name of the event.
     * @param handler Event handler.
     */
    on(event: string, handler: TyperEventHandler<any>): void;

    /**
     * Adds event handlers to the associated events.
     * @param event A dictionary which each property refer to a different event and the corresponding event handler.
     */
    on(event: TyperEventHandlers): void;

    /**
     * Restores contents to a newer version in the history stack.
     */
    redo(): void;

    /**
     * @see ZetaDOM.releaseFocus
     */
    releaseFocus(element: HTMLElement): void;

    /**
     * @see ZetaDOM.retainFocus
     */
    retainFocus(element: HTMLElement): void;

    /**
     * Sets contents within the editor.
     * @param value Value representing editable contents within the editor, possibly a string containing HTML markup.
     */
    setValue(value: any): void;

    /**
     * Forces to snapshot a version of editable contents and puts on the history stack.
     * If the current state is not the latest version, all newer versions will be discarded.
     * @param milliseconds A number in milliseconds indicating a delay or boolean true to snapshot immediately.
     */
    snapshot(milliseconds: number | true): void;

    /**
     * Exposes available commands to the mixin interface.
     * @param command Name of a command.
     * @see ZetaDOM#support
     * @see ZetaMixin#support
     */
    support(command: keyof ZetaMixin): void;

    /**
     * Restores contents to an earlier version in the history stack.
     */
    undo(): void;

    /**
     * When overriden, determines if the edited content is valid.
     * @returns A boolean value indicating if the content is valid.
     */
    validate(): boolean;

    /**
     * Determines if a given type of widget is allowed in the specified position.
     * @param widgetName Name of widget type.
     * @param node A node indicating the position.
     * @returns true if the given type of widget is allowed.
     */
    widgetAllowed(widgetName: string, node: TyperNode): boolean;

    /**
     * Determines if a given type of widget is enabled.
     * @param widgetName Name of widget type.
     * @returns true if the given type of widget is enabled.
     */
    widgetEnabled(widgetName: string): boolean;
}

interface TyperOptions extends TyperEventHandlers, Zeta.Dictionary<any> {
    /**
     * Specifies whether block content is disallowed in editable content.
     */
    inline?: boolean;

    /**
     * A valid CSS selector that matches elements that must not exist in editable content.
     */
    disallowedElement?: string;

    /**
     * Specifies whether default options in TyperStatic#defaultOptions is effective to this editor.
     */
    defaultOptions?: boolean;

    /**
     * A dictionary defining additional widgets effective to this editor.
     */
    widgets?: Zeta.Dictionary<TyperWidgetDefinition>;

    /**
     * Specifies whether widget of the specified name should be effective to this editor, or optionally specifies options to the widget.
     * For a list of options for a specific widget please refer to the individual documentation.
     */
    [name: string]: any;
}

interface TyperWidgetDefinition extends TyperEventHandlers {
    /**
     * A valid CSS selector that for any matched elements they are considered a widget of this type and normal editing behaviors will be ceased.
     */
    element?: string;

    /**
     * A valid CSS selector that for any matched elements within this widget normal editing behaviors are resumed.
     */
    editable?: string;

    /**
     * A whitespace-separated list of names of widgets which are allowed to be placed within this widget.
     * If not supplied, all widgets are allowed.
     */
    allow?: string;

    /**
     * A whitespace-separated list of names of widgets which this widget is allowed to be placed inside.
     * If not supplied, this widget is allowed to be placed in any other widgets.
     */
    allowedIn?: string;

    /**
     * Specifies whether this widget should be placed within a paragraph (inline mode), or is a block widget.
     */
    inline?: boolean;

    /**
     * Specifies whether paragraphs before or after this widget can be sticked to existing pargraphs within this widget upon content deletion.
     */
    textFlow?: boolean;

    /**
     * Defines available options which can be used to alter behaviors of this widget.
     */
    options?: Zeta.Dictionary<any>;

    /**
     * Specifies available commands when text cursor is located within this widget.
     * Available commands can be invoked by Typer#invoke or ZetaMixin#support (any time) or ZetaDOM#support (while editor is in focused).
     * If widgets are nested and commands with the same name are available, the command defined by the innermost widget takes effect.
     */
    commands?: Zeta.Dictionary<TyperCommand>;

    /**
     * Specifies to override default behavior of text extraction when this widget is selected.
     */
    text?: (widget: TyperWidget) => string;

    /**
     * Specifies how this widget should be inserted when requested by TyperTransaction#insertWidget.
     */
    create?: TyperCommand;

    /**
     * Specifies how this widget should be removed when requested by TyperTransaction#removeWidget.
     */
    remove?: 'keepText' | TyperCommand;
}

interface TyperDocument {
    /**
     * Gets the root node of the editable content.
     */
    readonly rootNode: TyperNode;

    /**
     * Gets an abstract node object used by the editor that correspond to the given node.
     * @param node A DOM node.
     * @returns An abstract node object.
     */
    getNode(node: Node): TyperNode;
}

interface TyperCustomSelection extends Zeta.HasRange {
    readonly acceptNode: Zeta.IteratorNodeFilter<TyperNode>;
    readonly getRects?: () => Zeta.Rect[];
}

interface TyperCaretPrototype {
    /**
     * Moves the caret to a position indicated by the given range.
     * If the range is not collapsed, the starting point of the range is used.
     * @param range A DOM range or an object describe a range in DOM.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveTo(range: Zeta.Rangeish): boolean;

    /**
     * Moves the caret to the position before the n-th child of an element or the n-th characters of a text node, or at the end of the given element or text node.
     * @param node A DOM node.
     * @param offset A number representing the n-th child of an element or the n-th characters of a text node. If the number is negative, it is counted from the end of the given node. A negative zero (-0) represents the position after the last child or character.
     * @returns true the caret is moved to a new position; false otherwise.
     */
    moveTo(node: Node, offset: boolean | 0 | -0 | number): boolean;

    /**
     * Moves the caret to a nearest possible position to the given coordinates on the screen.
     * @param x A number representing X-coordiate on the screen.
     * @param y A number representing Y-coordiate on the screen.
     * @returns true if  the caret is moved to a new position; false otherwise.
     */
    moveToPoint(x: number, y: number): boolean;

    /**
     * Moves the caret tothe position before the n-th character in an element or text node, or at the end of the given element or text node.
     * @param node A DOM node.
     * @param offset A number specifying the n-th characters of a text node. If the number is negative, the position is counted backwards from the end. A negative zero (-0) represents the position after the last character.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveToText(node: Node, offset: number): boolean;

    /**
     * Moves the caret to the start or the end of a line.
     * @param direction Direction is specified by the sign - positive being the forward while negative being backwards.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveToLineEnd(direction: number): boolean;

    /**
     * Moves the caret by the given number of lines in either direction.
     * @param direction Number of lines to jump over. Direction is specified by the sign - positive being the forward while negative being backwards.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveByLine(direction: number): boolean;

    /**
     * Moves the caret by the given number of words in either direction.
     * @param direction Number of words to jump over. Direction is specified by the sign - positive being the forward while negative being backwards.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveByWord(direction: number): boolean;

    /**
     * Moves the caret by the given number of characters in either direction.
     * @param direction Number of characters to jump over. Direction is specified by the sign - positive being the forward while negative being backwards.
     * @returns true if the caret is moved to a new position; false otherwise.
     */
    moveByCharacter(direction: number): boolean;
}

interface TyperSelectionPrototype {
    /**
     * Alters the selection to enclose the nearest word.
     * @param mode The string "word".
     * @returns true if the selection is altered.
     */
    select(mode: TyperSelectMode): boolean;

    /**
     * Alters the selection to the specified range of contents.
     * @param range A DOM range object or any object that describe a range within the editor.
     * @returns true if the selection is altered.
     */
    select(range: Zeta.HasRange | TyperCustomSelection): boolean;

    /**
     * Moves and collapses the selection to the specific position.
     * @param startNode A DOM node.
     * @param collapse Indicating the position of resulting range: before the start of a node for true; after the end of a node for false; after the start of a node (0-th child) for 0; and before the end of a node (last child) for -0.
     * @returns true if the selection is altered.
     */
    select(startNode: Node, collapse: boolean | 0 | -0): boolean;

    /**
     * Moves and collapses the selection to the specific position.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns true if the selection is altered.
     */
    select(startNode: Node, startOffset: number): boolean;

    /**
     * Alters the selection to the specified range of contents.
     * @param startNode A DOM node.
     * @param startOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @param endNode A DOM node.
     * @param endOffset A number representing the n-th child of an element or the n-th characters of a text node.
     * @returns true if the selection is altered.
     */
    select(startNode: Node, startOffset: number, endNode: Node, endOffset: number): boolean;

    /**
     * Moves and collapses the selection to the specific position.
     * @param range A DOM range.
     * @param collapse Includes starting point if true; ending point otherwise.
     * @returns true if the selection is altered.
     */
    select(range: Range, collapse: boolean): boolean;

    /**
     * Alters the selection to the specified range of contents.
     * @param start A DOM range indicating the starting point.
     * @param end A DOM range indicating the ending point.
     * @returns true if the selection is altered.
     */
    select(start: Range, end: Range): boolean;

    /**
     * Alters the selection to enclose all contents in the editor.
     * @returns true if the selection is altered.
     */
    selectAll(): boolean;
}

interface TyperCommandInvoker {
    /**
     * Invokes a command that will alter contents in a certain way.
     * @param commandName Name of command.
     * @param [value] A value where the command intakes.
     */
    invoke(commandName: string, value?: any): void;

    /**
     * Performs changes to contents within the editor.
     * @param command A function that alter contents when called.
     */
    invoke(command: TyperCommand): void;
}

interface TyperTransaction extends TyperCommandInvoker {
    /**
     * Gets the editor object.
     */
    readonly typer: Typer;

    /**
     * Gets the active selection of the editor.
     */
    readonly selection: TyperSelection;

    /**
     * Gets the widget object if this invoked command belongs to a widget.
     */
    readonly widget: TyperWidget;

    /**
     * Gets the name of the invoked command.
     */
    readonly commandName: string;

    /**
     * Inserts text to the current location. Selected contents are replaced.
     * @param text Text content.
     */
    insertText(text: string): void;

    /**
     * Inserts rich content to the current location. Selected contents are replaced.
     * @param content A string containing HTML markup or DOM nodes.
     */
    insertHtml(content: Zeta.HtmlContent): void;

    /**
     * Inserts a content widget to the current location. Selected contents are replaced.
     * @param name Name of widget.
     * @param [options] Options supplied to the widget.
     */
    insertWidget(name: string, options?: any): void;

    /**
     * Removes the specified widget from the contents.
     * Unlike directly removing the associated element from DOM, effects on the contents are controlled by the widget itself.
     * @param widget A widget object.
     */
    removeWidget(widget: TyperWidget): void;
}

interface TyperWidget extends Zeta.HasElement, Zeta.Dictionary<any> {
    /**
     * Gets the editor object.
     */
    readonly typer: Typer;

    /**
     * Gets the name of this widget.
     */
    readonly id: string;

    /**
     * Gets the DOM element associated with this widget. If this widget is an editor widget, the element is always the root element of the editor.
     */
    readonly element: HTMLElement;

    /**
     * Gets the options supplied to this widget when inserted.
     */
    readonly options: Zeta.Dictionary<any>;
}

interface TyperCaret extends Zeta.HasRange, Zeta.HasRect, TyperCaretPrototype {
    /**
     * Gets the editor object.
     */
    readonly typer: Typer;

    /**
     * Gets the paragraph or widget node where this caret is currently anchored on.
     */
    readonly node: TyperNode;

    /**
     * Gets the DOM element where this caret is currently anchored on.
     */
    readonly element: HTMLElement;

    /**
     * Gets the DOM text node where this caret is currently anchored on.
     * If this caret is currently anchored before or after a block widget and hence there is no text content, null is returned.
     */
    readonly textNode: Text | null;

    /**
     * Gets a number representing the n-th characters in the text node, or a boolean value indicating whether this caret is anchored before the DOM element.
     */
    readonly offset: number | boolean;

    /**
     * Gets a number representing the n-th characters counting from the start of paragraph.
     */
    readonly wholeTextOffset: number;

    /**
     * Gets a collapsed DOM range that represents the current location.
     * @returns A DOM range.
     */
    getRange(): Range;

    /**
     * Gets a rect object giving position and size of a blinking cursor at this location.
     * @returns A rect object.
     */
    getRect(): Zeta.Rect;

    /**
     * Creates a new caret object that is at the same location.
     * @returns A new caret object.
     */
    clone(): TyperCaret;
}

interface TyperSelection extends Zeta.HasRange, TyperSelectionPrototype, TyperCaretPrototype {
    /**
     * Gets the editor object associated with this selection.
     */
    readonly typer: Typer;

    /**
     * Gets the caret object that represent the anchor position of this selection.
     */
    readonly baseCaret: TyperCaret;

    /**
     * Gets the caret object that represent the focus position of this selection.
     */
    readonly extendCaret: TyperCaret;

    /**
     * Gets the innermost node that enclose the current selection.
     */
    readonly focusNode: TyperNode;

    /**
     * Gets the relative direction of extent (focus) position to base (anchor) position.
     * If the selection is collapsed, 0 is returned.
     */
    readonly direction: -1 | 0 | 1;

    /**
     * Gets whether the selection is collapsed (caret mode).
     */
    readonly isCaret: boolean;

    /**
     * Gets whether the selection is inside a single editable node, i.e. no widgets are partially selected.
     */
    readonly isSingleEditable: boolean;

    /**
     * Gets the time when this selection is updated.
     * @see Performance#now
     */
    readonly timestamp: number;

    /**
     * Gets the first block node selected in DOM order.
     */
    readonly startNode: TyperNode;

    /**
     * Gets the first DOM element selected in DOM order.
     */
    readonly startElement: HTMLElement;

    /**
     * Gets the first text node selected in DOM order.
     */
    readonly startTextNode: Text | null;

    /**
     * Gets the offset in the starting position relative to the element or text node.
     * A number represents a position before the n-th character in a text node.
     * If the number equals the length of the text node, it represents a position at the end of that text node.
     * A boolean true represents a position before an element; while false represents a position after an element.
     */
    readonly startOffset: number | boolean;

    /**
     * Gets the last block node selected in DOM order.
     */
    readonly endNode: TyperNode;

    /**
     * Gets the last DOM element selected in DOM order.
     */
    readonly endElement: HTMLElement;

    /**
     * Gets the last text node selected in DOM order.
     */
    readonly endTextNode: Text | null;

    /**
     * Gets the offset in the ending position relative to the element or text node.
     * A number represents a position before the n-th character in a text node.
     * If the number equals the length of the text node, it represents a position at the end of that text node.
     * A boolean true represents a position before an element; while false represents a position after an element.
     */
    readonly endOffset: number | boolean;

    /**
     * Returns a copy of this selection.
     */
    clone(): TyperSelection;

    /**
     * Creates a tree walker that traverse through the editor node tree.
     * @param whatToShow A bitmask specifying which types of DOM node should be iterated.
     * @param [filter] An optional callback that instructs the tree walker to skip a node or all its descandents depending on the returned value.
     */
    createTreeWalker(whatToShow: number, filter?: Zeta.IteratorNodeFilter<TyperNode>): TyperTreeWalker;

    /**
     * Collapses the selection to caret mode at the specific boundary position of this selection.
     * @param [point] A string represent the position.
     * @returns true if the selection is altered.
     */
    collapse(point?: TyperCaretPoint): boolean;

    /**
     * Moves focus to the associated editor's editing area.
     */
    focus(): void;

    /**
     * Gets the caret object at the specific boundary position of this selection.
     * @param [point] A string represent the position.
     * @returns A caret object.
     */
    getCaret(point?: TyperCaretPoint): TyperCaret;

    /**
     * Gets an array of DOM elements that represents paragraphs being selected.
     * @returns An array of DOM elements.
     */
    getParagraphElements(): HTMLElement[];

    /**
     * Gets a DOM range object that represents the range of contents being selected, or the boundary position of this selection.
     * @param [collapse] If specified, a collapsed range representing the boundary position will be returned.
     * @returns A DOM range.
     */
    getRange(collapse?: boolean): Range;

    /**
     * Gets the painted area of the selectable contents within the selection.
     * @returns An array of custom rect object.
     */
    getRects(): Zeta.Rect[];

    /**
     * Gets an array of DOM elements being selected.
     * @returns An array of DOM elements.
     */
    getSelectedElements(): HTMLElement[];

    /**
     * Gets selected content as plain text.
     * @returns A string containing text or text-only representation of the selected content.
     */
    getSelectedText(): string;

    /**
     * Gets an array of DOM text nodes being selected.
     * @returns An array of DOM text nodes.
     */
    getSelectedTextNodes(): Text[];

    /**
     * Gets an array of widgets being selected.
     */
    getWidgets(): TyperWidget[];

    /**
     * Determines whether a specific type of widget is allowed to be inserted in the selected position.
     * @param widgetName A string specifying the name of widget.
     * @returns true if such widget is allowed.
     */
    widgetAllowed(widgetName: string): boolean;
}

interface TyperNode extends Zeta.HasElement {
    readonly typer: Typer;
    readonly element: HTMLElement;
    readonly widget: TyperWidget;
    readonly parentNode: TyperNode | null;
    readonly childNodes: TyperNode[];
    readonly previousSibling: TyperNode | null;
    readonly nextSibling: TyperNode | null;
    readonly firstChild: TyperNode | null;
    readonly lastChild: TyperNode | null;
    readonly nodeType: TyperNodeType;
}

interface TyperTreeWalker extends Zeta.Iterator<TyperNode> {
    readonly whatToShow: number;
    readonly filter: Zeta.IteratorNodeFilter<TyperNode>;
    readonly root: TyperNode;
    currentNode: TyperNode;

    previousSibling(): TyperNode | null;
    nextSibling(): TyperNode | null;
    firstChild(): TyperNode | null;
    lastChild(): TyperNode | null;
    parentNode(): TyperNode | null;
    previousNode(): TyperNode | null;
    nextNode(): TyperNode | null;
}

interface TyperDOMNodeIterator extends Zeta.Iterator<Node> {
    readonly whatToShow: number;
    readonly filter: Zeta.IteratorNodeFilter<Node>;
    currentNode: Node;

    previousNode(): Node | null;
    nextNode(): Node | null;
}

interface TyperCanvas {
    readonly typer: Typer;
    readonly pointerX: number;
    readonly pointerY: number;
    readonly mousedown: boolean;
    readonly hoverNode: TyperNode | null;
    readonly activeHandle: TyperCanvasHandle | null,
    readonly editorReflow: boolean;
    readonly pointerMoved: boolean;
    readonly selectionChanged: boolean;
    readonly timestamp: number;
    readonly rect: Zeta.Rect;

    refresh(): void;
    toggleLayer(name: string, visible: boolean): void;
    fill(range: Element | Zeta.Rectish | (Element | Zeta.Rectish)[], color?: string, handle?: TyperCanvasHandle): void;
    drawCaret(caret: TyperCaret): void;
    drawBorder(element: Element, width: number, color?: string, lineStyle?: string, inset?: boolean): void;
    drawLine(rect: Zeta.Rect, side: Zeta.Direction, width: number, color?: string, lineStyle?: string, handle?: TyperCanvasHandle): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, width: number, color?: string, lineStyle?: string, handle?: TyperCanvasHandle): void;
    drawHandle(element: Element, pos: Zeta.Direction2D, size: number, image?: string, handle?: TyperCanvasHandle): void;
}

interface TyperCanvasHandle {
    /**
     * Gets the cursor icon displayed when the mouse handle is hovered.
     */
    readonly cursor: string;

    /**
     * Gets whether the mouse handle is active.
     */
    readonly active: boolean;

    /**
     * Gets the callback that will be fired when user released the mouse handle.
     */
    readonly done: () => any;
}

/**
 * Source file: ui.js
 */

interface ZetaUI extends ZetaUI.PromptFactory {
    /**
     * Creates a new tool set.
     * @param [name] Name of the tool set.
     * @param [options] A dictionary containing options to define behaviors of the tool set.
     */
    new(name?: string, options?: ZetaUI.ToolSetOption): ZetaUI.ToolSet;

    /**
     * Gets the prototype object which defines methods of UIToolSet instance.
     */
    readonly prototype: ZetaUI.ToolSet;

    /**
     * Defines a control or layout type.
     * @param type Name of the control or layout type.
     * @param specs An object containing options to define behaviors of the control or layout.
     * @param [layoutOnly] If set to true, these behaviors will be included as part of an control but users cannot create a control of this type.
     */
    define(type: string, specs: ZetaUI.ControlTypeOption, layoutOnly?: boolean): void;

    /**
     * Determines whether the given element consists of the specified layout type or provides the specified functional role.
     * @param element A DOM element.
     * @param role Name of layout type or functional role (e.g. button or buttonlist).
     * @returns  true if the element has the specified layout type of functional role.
     */
    hasRole(element: Element, role: string): boolean;

    /**
     * Adds a localized text to a specific message to be displayed.
     * @param toolset Name of tool set.
     * @param language Language of the localized text.
     * @param key A unique ID that identifies a specific message to be localized.
     * @param value Localized text.
     */
    i18n(toolset: string, language: string, key: string, value: string): void;

    /**
     * Adds a collection of localized text to specific messages to be displayed.
     * @param toolset Name of tool set.
     * @param language Language of the localized text.
     * @param object A dictionary which each property defines the localized text to a specific message.
     */
    i18n(toolset: string, language: string, object: Zeta.Dictionary<string>): void;
}

declare namespace ZetaUI {
    /**
     * Represents control augmented with extra options.
     */
    type ControlWithOption<T = ControlSpeciesOption> = Control & Pick<T, Exclude<keyof T, keyof Control | 'controls' | 'template'>>;

    type ControlCallback<T = ControlSpeciesOption> = (this: ControlWithOption<T>, self: ControlWithOption<T>) => any;

    type ControlEventName = ZetaEventName | 'setValue' | 'propertyChange' | 'stateChange' | 'contextChange' | 'executed' | 'childExecuted' | 'reset' | 'validate' | 'beforeDestroy';

    type ControlEventTypeMap = ZetaEventTypeMap & {
        childExecuted: ControlChildExecutedEvent;
        propertyChange: ControlPropertyChangeEvent;
        setValue: ControlSetValueEvent;
    }

    type ControlEventHandler<E extends string, T = ControlSpeciesOption> = ZetaEventHandler<Zeta.EventType<E, ControlEventTypeMap>, ControlWithOption<T>>;

    type ControlEventHandlers<T = ControlSpeciesOption> = { [P in ControlEventName]?: ControlEventHandler<P, T> };

    interface ControlEvent extends ZetaEvent { }

    interface ControlChildExecutedEvent extends ControlEvent {
        /**
         * Gets the child control that has just been executed.
         */
        readonly control: Control;
    }

    interface ControlPropertyChangeEvent extends ControlEvent {
        /**
         * Gets a dictionary containing old values of the changed properties.
         */
        readonly oldValues: Zeta.Dictionary<any>;

        /**
         * Gets a dictionary containing new values of the changed properties.
         */
        readonly newValues: Zeta.Dictionary<any>;
    }

    interface ControlSetValueEvent extends ControlEvent {
        /**
         * Gets the old value of the property about to be changed.
         */
        readonly oldValue: any;

        /**
         * Gets the new value supplied to the property about to be changed.
         */
        readonly newValue: any;
    }

    interface ToolSet extends ControlSpeciesFactory, PromptFactory {
        /**
         * Gets all controls in scope that are defined by this tool set.
         * @param control A control.
         * @returns A dictionary containing all controls visible in scope.
         */
        all(control: Control): Zeta.Dictionary<Control>;

        /**
         * Adds a localized text to a specific message to be displayed.
         * @param language Language of the localized text.
         * @param key A unique ID that identifies a specific message to be localized.
         * @param value Localized text.
         */
        i18n(language: string, key: string, value: string): void;

        /**
         * Adds a collection of localized text to specific messages to be displayed.
         * @param language Language of the localized text.
         * @param object A dictionary which each property defines the localized text to a specific message.
         */
        i18n(language: string, object: Zeta.Dictionary<string>): void;

        /**
         * Creates a placeholder control which will import all controls exported to the specified ID as if they were directly added to the same location.
         * @param id A string represent the placeholder.
         * @returns A control species.
         */
        import(id: string): ControlSpecies<Context>;

        /**
         * Exports controls so that different tool sets can re-use controls defined by each other.
         * @param id A string represent the placeholder.
         * @param controls Controls to be exported to the specified placeholder ID.
         */
        export(id: string, ...controls: ControlSpecies<Context>[]): void;
    }

    interface ToolSetOption {
        contextChange?: ZetaEventHandler<ZetaEvent, ToolSetState>;
    }

    interface ToolSetState extends Zeta.Dictionary<any> {
        /**
         * Gets the name of the tool set.
         */
        readonly name: string;

        /**
         * Gets the two-way binded context object created by ControlSpecies#render.
         */
        readonly context: Context;

        /**
         * Gets a dictionary containing all controls created by this tool set in the current context.
         */
        readonly all: Zeta.Dictionary<Control>;

        /**
         * Gets or sets whether controls of this tool set is enabled or not.
         * This flag takes highest precedence and thus will override individual state of controls.
         */
        enabled: boolean;

        /**
         * Sets the value as the realm flag of controls created with the specified realm name.
         * This flag takes the second highest precedence, other than the enabled flag and thus will override individual state of controls.
         */
        [realm: string]: any;
    }

    /**
     * Represents a two-way binded context of the rendered controls that is exposed to public as a component.
     * @see ZetaDOM.getContext
     */
    interface Context extends Zeta.Dictionary<any> {
        /**
         * Returns a simple object containing all binded values.
         */
        toJSON(): object;

        /**
         * Resets all controls' state.
         */
        reset(): void;

        /**
         * Forces all controls to re-render.
         */
        update(): void;
    }

    interface Control extends Zeta.HasElement, ControlOption {
        /**
         * Gets the DOM element associated with this control.
         */
        readonly element: HTMLElement;

        /**
         * Gets the context object exposed to public that is associated with this control.
         */
        readonly context: Context;

        /**
         * Gets the state object that associates the tool set which creates this control and this instance of control.
         */
        readonly state: ToolSetState;

        /**
         * Gets the parent control if this is not the root control.
         */
        readonly parent: Control | null;

        /**
         * Gets a collection of child controls.
         */
        readonly controls: Control[];

        /**
         * Gets a dictionary of controls created by the same tool set.
         */
        readonly all: Zeta.Dictionary<Control>;

        /**
         * Gets the parent context object if this control is instantiated by another control.
         */
        readonly parentContext: Context | null;

        /**
         * Gets or sets the label of a button-like control.
         */
        label: string;

        /**
         * Gets or sets the value of the control.
         */
        value: any;

        /**
         * Gets or sets the active state of the control.
         */
        active: boolean;

        /**
         * Gets or sets whether the control is enabled or not.
         * Only the boolean false value will force the control to be disabled.
         */
        enabled: boolean;

        /**
         * Gets or sets the visibility of the control.
         * Only the boolean false value will force the control to be hidden.
         */
        visible: boolean;

        /**
         * Add new controls that is not predefined in control species as the children of this control.
         * @param child A control or a list of controls to be added.
         */
        append(child: ControlSpecies<any> | ControlSpecies<any>[]): void;

        /**
         * Determines whether this control is the parent of another control.
         * @param other A control.
         * @returns true if this control is the parent of the given control.
         */
        contains(other: Control): boolean;

        /**
         * Removes this and all descendant controls from the control tree.
         */
        destroy(): void;

        /**
         * Determines whether the control consists of the specified layout type or provides the specified functional role.
         * @param role Name of layout type or functional role (e.g. button or buttonlist).
         * @returns true if the control has the specified layout type of functional role.
         */
        hasRole(role: string): boolean;

        /**
         * Adds event handler to the spcified event.
         * @param event Name of the event.
         * @param handler Event handler.
         */
        on<T extends ControlEventName | string>(event: T, handler: ControlEventHandler<T>): void;

        /**
         * Adds event handlers to the associated events.
         * @param event A dictionary which each property refer to a different event and the corresponding event handler.
         */
        on(event: ControlEventHandlers): void;

        /**
         * Sets the value of the control and returns if the operation is successful.
         * @param value Value to be set.
         * @returns true if the value of the control is updated.
         */
        setValue(value: any): boolean;

        /**
         * Observes changes to the specified property.
         * @param prop Name of the property to be observed.
         * @param callback Callback to be fired when there are changes to the specified property.
         */
        watch(prop: string, callback?: (newValue: any, oldValue: any, prop: string, self: this) => void, fireInit?: boolean);

        /**
         * Executes operation defined by the control.
         * @param [value] Value to be set before execution.
         * @returns execute A promise object that will be resolved or rejected upon the result of execution.
         */
        execute(value?: any): Promise<any>;
    }

    /**
     * Defines options available when creating control or layout types, and control species.
     */
    interface ControlOption {
        realm?: string;

        /**
         * A whitespace-separated list of word containing names of controls, or * for all, of which this controls should be rendered before.
         */
        before?: string;

        /**
         * A whitespace-separated list of word containing names of controls, or * for all, of which this controls should be rendered after.
         */
        after?: string;

        /**
         * Sets the description of a control.
         */
        description?: string;

        /**
         * Sets whether child controls is enabled. This flag will override the enabled property of child controls.
         */
        enableChildren?: boolean;

        /**
         * Sets whether the control should be automatically hidden when disabled. Default is false.
         */
        hiddenWhenDisabled?: boolean;

        /**
         * Sets whether the menu should be immediately closed after losing focus. Default is true.
         */
        hideCalloutOnBlur?: boolean;

        /**
         * Sets whether the menu should be immediately closed after this control has finished executing. Default is true.
         */
        hideCalloutOnExecute?: boolean;

        /**
         * Sets whether a child control should be hidden when it is disabled. Default is false.
         */
        hideDisabledChild?: boolean;

        /**
         * Sets the label for button-like control.
         */
        label?: string;

        /**
         * Sets the icon for button-like control. Currently only material icons are supported.
         */
        icon?: string;

        /**
         * Sets whether the control is a required field. Default is false.
         */
        required?: boolean;

        /**
         * Sets whether the control should only be enabled when there are child controls. Default is false.
         */
        requireChildControls?: boolean;

        /**
         * Sets to forcibly turn on or off icon for button-like control. Default is null.
         */
        showIcon?: boolean;

        /**
         * Sets to forcibly turn on or off icon for button-like control. Default is null.
         */
        showText?: boolean;

        /**
         * Sets the initial value of the control. When used in defining control types, presence of the value property will cause the registration of two-way binding to the context object.
         */
        value?: any;

        /**
         * Sets whether this and descendant controls should wait for async execution. Default is true.
         */
        waitForExecution?: boolean;
    }

    /**
     * Defines options available when creating control or layout types.
     */
    interface ControlTypeOption extends ControlOption, ControlEventHandlers, Zeta.Dictionary<any> {
        /**
         * Defines default template for this control or layout type.
         */
        template: string;

        /**
         * Overrides default templates when child control is rendered under this control or layout type.
         */
        templates?: Zeta.Dictionary<string>;

        /**
         * Defines editor behaviors if this control or layout type renders an editor.
         */
        preset?: ControlPresetOption;

        /**
         * Consumes arguments supplied to the species constructor to construct options for shorthand method.
         */
        parseOptions?: (options: Zeta.Dictionary<any>, iter: Zeta.ArgumentIterator) => void;
    }

    interface ControlPresetOption extends TyperOptions {
        /**
         * Defines available options that can be set when a text input field of this type is to be created.
         */
        options?: Zeta.Dictionary<any>;

        /**
         * Defines to override default logic to certain editors' methods.
         */
        overrides?: Partial<Record<'getValue' | 'setValue' | 'hasContent' | 'validate', (...args) => any>>;
    }

    /**
     * Represents a predefined control with specified behavior which can be rendered later.
     */
    interface ControlSpecies<T extends Context = Context> {
        /**
         * Name of the control.
         */
        readonly name: string;

        /**
         * Type of the control.
         */
        readonly type: string;

        /**
         * Render the control in a new detached DOM element.
         * @param context Initial state or context.
         */
        render(context?: Zeta.Dictionary<any>): T;

        /**
         * Render the control inside the given DOM element.
         * @param element A DOM element which the control is rendered as its child.
         * @param context Initial state or context.
         */
        render(element: Element, context?: Zeta.Dictionary<any>): T;

        /**
         * Clones the control with some options overriden.
         * @param options A dictionary containing options to override.
         */
        clone(options?: Zeta.Dictionary<any>): ControlSpecies<T>;
    }

    /**
     * Represents signatures, including shorthands, of the function to create control of certain type.
     * @template O Interface that defines the list of options.
     */
    interface ControlSpeciesConstructor<O = ControlSpeciesOption, T extends Context = Context> {
        (): ControlSpecies<T>;
        (options: O): ControlSpecies<T>;
        (name: string, options?: O): ControlSpecies<T>;
    }

    interface ControlCollectionSpeciesConstructor<O = ControlSpeciesOption, T extends Context = Context> extends ControlSpeciesConstructor<O, T> {
        (...controls: (ControlSpecies<Context> | O)[]): ControlSpecies<T>;
        (name: string, ...controls: (ControlSpecies<Context> | O)[]): ControlSpecies<T>;
    }

    /**
     * Defines generic options available when creating controls.
     * @template T Interface that defines additional options specific to that control type.
     */
    interface ControlSpeciesOption<T = {}> extends ControlOption, ControlEventHandlers<T>, Zeta.Dictionary<any> {
        /**
         * Sets to override default template specified by the control type.
         */
        template?: string;

        /**
         * Defines child controls that will be appended under this control during initialization.
         */
        controls?: ControlSpecies[];

        /**
         * Defines the action of execution of the control by Control#execute.
         * If a string is given, mixin method or supported commands of focused component with the specified name will be executed.
         */
        execute?: string | ControlCallback<this>;

        /**
         * Defines a dynamic handler to determine the enable state of a control.
         * This handler will not be called if the control is forcibly enabled or disabled.
         */
        enabled?: ControlCallback<this>;

        /**
         * Defines a dynamic handler to determine the visible state of a control.
         * This handler will not be called if the control is forcibly hidden.
         */
        visible?: ControlCallback<this>;

        /**
         * Defines a dynamic handler to determine the active state of a control.
         * This handler will not be called if the control is forcibly active.
         */
        active?: ControlCallback<this>;
    }

    interface PromptFactory {
        /**
         * Prompts a modal alert box.
         * @param message Message to be shown in the alert box.
         * @param action Label of the confirm button.
         * @param title Title of the alert box.
         * @param data Data object where values will be binded to the template defined in the message parameter.
         * @param callback Operation to be executed after user has clicked the confirmation button.
         * @returns A promise object which will be resolved when user has closed the alert box.
         */
        alert(message: string): Promise<true>;
        alert(message: string, action: string): Promise<true>;
        alert(message: string, action: string, title: string): Promise<true>;
        alert<T>(message: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;
        alert<T>(message: string, action: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;
        alert<T>(message: string, action: string, title: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;

        /**
         * Prompts a modal confirm box.
         * @param message Message to be shown in the confirm box.
         * @param action Label of the confirm button.
         * @param title Title of the alert box.
         * @param data Data object where values will be binded to the template defined in the message parameter.
         * @param callback Operation to be executed after user has clicked the confirmation button.
         * @returns A promise object which will be resolved when user has clicked OK; or rejected when use has closed the confirm box.
         */
        confirm(message: string): Promise<boolean>;
        confirm(message: string, action: string): Promise<boolean>;
        confirm(message: string, action: string, title: string): Promise<boolean>;
        confirm<T>(message: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;
        confirm<T>(message: string, action: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;
        confirm<T>(message: string, action: string, title: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;

        /**
         * Prompts a modal prompt box.
         * @param message Message to be shown in the prompt box.
         * @param value An optional initial value.
         * @param action Label of the confirm button.
         * @param title Title of the alert box.
         * @param description Description to be displayed above the input field.
         * @param data Data object where values will be binded to the template defined in the message parameter.
         * @param callback Operation to be executed after user has clicked the confirmation button.
         * @returns A promise object which will be resolved when user has clicked OK; or rejected when use has closed the confirm box.
         */
        prompt(message: string): Promise<string>;
        prompt(message: string, value: string): Promise<string>;
        prompt(message: string, value: string, action: string): Promise<string>;
        prompt(message: string, value: string, action: string, title: string): Promise<string>;
        prompt(message: string, value: string, action: string, title: string, description: string): Promise<string>;
        prompt<T>(message: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
        prompt<T>(message: string, value: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
        prompt<T>(message: string, value: string, action: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
        prompt<T>(message: string, value: string, action: string, title: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
        prompt<T>(message: string, value: string, action: string, title: string, description: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;

        /**
         * Creates a notification.
         * @param message Message to be shown.
         * @param [kind] CSS class to be applied. Built-in supported values includes: "success", "warn" and "error".
         * @param [timeout] Number of milliseconds before the norification is dismissed. If the value is 0 or unspecified, the notification will not be automatically dismissed.
         * @param [within] A DOM element in which the notification will be shown.
         * @param [data] Data to be binded to the message.
         */
        notify(message: string, kind?: string, timeout?: number, within?: Node, data?: object): void;
    }

    interface ControlSpeciesFactory {
        button: ButtonConstructor;
        buttonlist: ButtonSetConstructor;
        buttonset: ButtonSetConstructor;
        calendar: DefaultConstructor;
        callout: CalloutConstructor;
        checkbox: DefaultConstructor;
        clock: DefaultConstructor;
        datepicker: TextboxConstructor;
        dialog: DialogConstructor;
        dropdown: DropdownConsutrctor;
        file: DefaultConstructor;
        form: FormConstructor;
        generic: DefaultConstructor;
        keyword: TextboxConstructor;
        label: DefaultConstructor;
        link: DefaultConstructor;
        menu: ButtonSetConstructor;
        number: TextboxConstructor;
        richtext: DefaultConstructor;
        submit: ButtonConstructor;
        tableGrid: DefaultConstructor;
        textbox: TextboxConstructor;
    }

    interface DefaultConstructor extends ControlSpeciesConstructor {
    }

    interface ButtonSetConstructor extends ControlCollectionSpeciesConstructor {
    }

    interface ButtonOption extends ControlSpeciesOption<ButtonOption> {
        /**
         * Sets whether the button should be places in danger zone.
         */
        danger?: boolean;

        /**
         * Sets whether the button should be initially in the pinned state.
         */
        pinned?: boolean;

        /**
         * Reserved for internal use.
         */
        shortcut?: string;
    }

    interface ButtonConstructor extends ControlSpeciesConstructor<ButtonOption> {
        (name: string, icon: string, options?: ButtonOption): ControlSpecies<Context>;
        (name: string, icon: string, execute: ControlCallback<ButtonOption>, options?: ButtonOption): ControlSpecies<Context>;
    }

    interface CalloutOption extends ControlSpeciesOption<CalloutOption> {
        /**
         * Whether to always behave as a callout button if there is only one enabled child button.
         * If set to false, clicking the callout button will directly execute the child button as if clicking that child button.
         * Default is true.
         */
        alwaysShowCallout?: boolean;
    }

    interface CalloutConstructor extends ControlCollectionSpeciesConstructor<CalloutOption> {
        (name: string, icon: string, ...controls: (ControlSpecies<Context> | CalloutOption)[]): ControlSpecies<Context>;
    }

    interface DialogOption extends ControlSpeciesOption<DialogOption> {
        /**
         * Sets whether the dialog can be rendered as a prompt to the button which opens this dialog.
         */
        pinnable?: boolean;

        /**
         * Sets whether the dialog is a modal dialog. Default is true.
         */
        modal?: boolean;
    }

    interface DialogContext extends Context {
        readonly dialog: Promise<any>;
    }

    interface DialogConstructor extends ControlCollectionSpeciesConstructor<DialogOption, DialogContext> {
    }

    interface DropdownOption extends ControlSpeciesOption<DropdownOption> {
        /**
         * An array, dictionary or map containing options of the dropdown menu.
         */
        choices?: [] | Zeta.Dictionary<any> | Map<any, any>;

        /**
         * Sets whether the label of the dropdown menu will be changed according to selected option.
         */
        valueAsLabel?: boolean;
    }

    interface DropdownConsutrctor extends ControlSpeciesConstructor<DropdownOption> {
        (name: string, execute: ControlCallback<DropdownOption>, options?: DropdownOption);
        (name: string, choices: [] | Map<any, any>, execute?: ControlCallback<DropdownOption>, options?: DropdownOption);
    }

    interface FormContext extends Context {
        readonly form: Promise<any>;
    }

    interface FormConstructor extends ControlCollectionSpeciesConstructor<ControlSpeciesOption, FormContext> {
    }

    interface TextboxOption extends ControlSpeciesOption<TextboxOption> {
        /**
         * Options to alter predefined behaviors of this text input control.
         */
        options?: Zeta.Dictionary<any>;
    }

    interface TextboxConstructor extends ControlSpeciesConstructor<TextboxOption> {
        (name: string, required: boolean, options?: TextboxOption): ControlSpecies<Context>;
    }
}
