import { definePrototype, is, isPlainObject } from "../include/zeta-dom/util.js";

function ArgumentIterator(args) {
    this.value = null;
    this.args = args;
    this.done = !args.length;
}

definePrototype(ArgumentIterator, {
    next: function (type) {
        // @ts-ignore: type inference issue
        var arr = this.args;
        if (type === 'object' ? isPlainObject(arr[0]) : typeof type === 'string' ? typeof arr[0] === type : is(arr[0], type)) {
            this.value = arr.shift();
            this.done = !arr.length;
            return true;
        }
    },
    nextAll: function (type) {
        var arr = [];
        while (this.next(type) && arr.push(this.value));
        return arr;
    },
    fn: function () {
        // @ts-ignore: type inference issue
        return this.next('function') && this.value;
    },
    string: function () {
        // @ts-ignore: type inference issue
        return this.next('string') && this.value;
    }
});

export default ArgumentIterator;
