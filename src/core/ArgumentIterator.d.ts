export default class ArgumentIterator {
    constructor(args: any[]);

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
    nextAll<T extends 'string' | 'number' | 'boolean' | 'object' | 'function'>(type: T): T extends 'string' ? string[] : T extends 'number' ? number[] : T extends 'boolean' ? boolean[] : T extends 'object' ? object[] : T extends 'function' ? Zeta.AnyFunction[] : any[];

    /**
     * Consumes consecutive arguments that are instances of the specified constructor.
     * @param type A constructor.
     * @returns An array containing arguments of the specified type supplied.
     */
    nextAll<T extends Zeta.AnyConstructor>(type: T): InstanceType<T>[];

    /**
     * Tests and consumes the next arguments if it is a string.
     */
    string(): string | undefined;

    /**
     * Tests and consumes the next arguments if it is a function.
     */
    fn(): Zeta.AnyFunction | undefined;
}
