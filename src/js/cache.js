module.exports = (function() {
    var Promise = require('pinkie-promise');
    var Settings = require('settings');

    return function(sec, key, f) {
        this.key = key;
        this.ttl = sec*1000;
        this.f = f;
        this.update = function() {
            var me = this;

            return new Promise(function(res, rej) {
                me.f().then(function(v) {
                    Settings.data(me.key, {
                        data: v,
                        ttl: (new Date()).getTime() + me.ttl,
                    });
                    res(v);
                })['catch'](rej);
            });
        };

        this.clear = function() {
            Settings.data(this.key, false);
        };

        this.get = function() {
            var data = Settings.data(this.key);
            if (! data) {
                return this.update();
            }
            
            var now = (new Date()).getTime();
            if (now > data.ttl) {
                return this.update();
            }

            return Promise.resolve(data.data);
        };
    };
})();
