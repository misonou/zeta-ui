this.Map = window.Map || (function (shim) {
    function indexOf(map, key) {
        return map.items.indexOf(key);
    }
    function Map() {
        var self = this;
        self.items = [];
        self._values = [];
        self._keys = shim.Set.prototype._keys;
    }
    Map.prototype = {
        get size() {
            return this.items.length;
        },
        has: function (v) {
            return indexOf(this, v) >= 0;
        },
        get: function (v) {
            var index = indexOf(this, v);
            return index >= 0 ? this._values[index] : undefined;
        },
        set: function (i, v) {
            var self = this;
            var index = indexOf(self, i);
            self._values[index >= 0 ? index : self.items.push(i) - 1] = v;
            return self;
        },
        delete: function (v) {
            var self = this;
            var index = indexOf(self, v);
            if (index >= 0) {
                self.items.splice(index, 1);
                self._values.splice(index, 1);
            }
            return index >= 0;
        },
        keys: function () {
            return this._keys();
        },
        values: function () {
            var self = this;
            return self._keys(function (v) {
                return self.get(v);
            });
        },
        entries: function () {
            var self = this;
            return self._keys(function (v) {
                return [v, self.get(v)];
            });
        },
        forEach: function (callback, thisArg) {
            var self = this;
            self.items.forEach(function (v, i) {
                callback.call(thisArg, self._values[i], v, self);
            });
        },
        clear: function () {
            this.items.splice(0);
            this._values.splice(0);
        }
    };
    return Map;
}(this));
