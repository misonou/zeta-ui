this.Set = window.Set || (function () {
    function Iterator(arr, callback) {
        var self = this;
        self.items = arr;
        self.index = -1;
        self.callback = callback || function (v) {
            return v;
        };
    }
    Iterator.prototype = {
        next: function () {
            var self = this;
            if (++self.index < self.items.length) {
                return {
                    value: self.callback(self.items[self.index], self.index),
                    done: false
                };
            }
            return {
                value: undefined,
                done: true
            };
        }
    };

    function Set() {
        this.items = [];
    }
    Set.prototype = {
        get size() {
            return this.items.length;
        },
        has: function (v) {
            return this.items.indexOf(v) >= 0;
        },
        add: function (v) {
            var items = this.items;
            if (items.indexOf(v) < 0) {
                items.push(v);
            }
            return this;
        },
        delete: function (v) {
            var index = this.items.indexOf(v);
            if (index >= 0) {
                this.items.splice(index, 1);
            }
            return index >= 0;
        },
        keys: function () {
            return this._keys();
        },
        values: function () {
            return this._keys();
        },
        entries: function () {
            return this._keys(function (v) {
                return [v, v];
            });
        },
        forEach: function (callback, thisArg) {
            var self = this;
            self.items.forEach(function (v) {
                callback.call(thisArg, v, v, self);
            });
        },
        clear: function () {
            this.items.splice(0);
        },
        _keys: function (callback) {
            return new Iterator(this.items, callback);
        }
    };
    return Set;
}());
