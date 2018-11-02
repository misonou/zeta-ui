this.MutationObserver = window.MutationObserver || (function () {
    function MutationObserver(handler) {
        this.records = [];
        this.handler = handler;
    }
    MutationObserver.prototype = {
        observe: function (element, init) {
            var helper = zeta.helper;
            var self = this;
            helper.bind(element, 'DOMNodeInserted DOMNodeRemoved DOMAttrModified DOMCharacterDataModified', function (e) {
                var type = e.type.charAt(7);
                var oldValue = e.prevValue;
                var record = {};
                record.addedNodes = [];
                record.removedNodes = [];
                if (type === 'M') {
                    record.type = 'attributes';
                    record.target = e.target;
                    record.attributeName = e.attrName;
                    if (init.attributeOldValue) {
                        record.oldValue = oldValue;
                    }
                } else if (type === 'a') {
                    record.type = 'characterData';
                    record.target = e.target;
                    if (init.characterDataOldValue) {
                        record.oldValue = oldValue;
                    }
                } else {
                    record.type = 'childList';
                    record.target = e.target.parentNode;
                    record[type === 'I' ? 'addedNodes' : 'removedNodes'][0] = e.target;
                }
                var shouldIgnore = false;
                helper.each(self.records, function (i, v) {
                    shouldIgnore |= v.type === 'childList' && v.addedNodes.some(function (v) {
                        return helper.containsOrEquals(v, record.target);
                    });
                    return !shouldIgnore;
                });
                if (!shouldIgnore && init[record.type] && (init.subtree || record.target === element)) {
                    self.records[self.records.length] = record;
                    clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        self.handler(self.takeRecords(), self);
                    });
                }
            });
        },
        takeRecords: function () {
            return this.records.splice(0);
        }
    };
    return MutationObserver;
}());
