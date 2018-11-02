this.WeakMap = window.WeakMap || (function () {
    var num = 0;
    var state = 0;
    var returnValue;

    function WeakMap() {
        this.key = '__WeakMap' + (++num);
    }
    WeakMap.prototype = {
        get: function (key) {
            if (this.has(key)) {
                try {
                    state = 1;
                    key[this.key]();
                    if (state !== 2) {
                        throw new Error('Invalid operation');
                    }
                    var value = returnValue;
                    returnValue = null;
                    return value;
                } finally {
                    state = 0;
                }
            }
        },
        set: function (key, value) {
            Object.defineProperty(key, this.key, {
                configurable: true,
                value: function () {
                    if (state === 1) {
                        returnValue = value;
                        state = 2;
                    }
                }
            });
            return this;
        },
        has: function (key) {
            return key && Object.hasOwnProperty.call(key, this.key);
        },
        delete: function (key) {
            var has = this.has(key);
            if (has) {
                delete key[this.key];
            }
            return has;
        }
    };
    return WeakMap;
}());
