module.exports = (function() {

    var Cacheable = require('./cache');
    var Promise = require('pinkie-promise');

    function pad0(n) {
        if (n < 10) {
            return '0' + String(n);
        }

        return String(n);
    }

    function genNow() {
        var now = new Date();
        return String(now.getFullYear()) + String(now.getMonth()+1) + pad0(now.getDay())+pad0(now.getHours())+'-'+String(Math.floor(now.getMinutes() / 10));
    }

    function matchAll(regexp, str) {
        var arr = str.match(regexp);
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            var r2 = new RegExp(regexp);
            var src = arr[i];
            var x = r2.exec(src);
            if (x) {
                ret[i] = x;
            } else {
                ret[i] = '--';
            }
        }

        return ret;
    }

    var tempReg = /three_hr_temp"><span class="tem-C is-active">([0-9]+)<\/span></g;
    var rainReg = /<td( colspan="([0-9]+)")?[^>]*><i[^>]+><\/i> *([0-9]+)[%] *<\/td>/g;
    var humidReg = /three_hr_humidty">([0-9]+)%<\/td>/g;
    var dateReg = /<span class="d">([0-9]+\/[0-9]+)[^<]+<\/span>/g;
    var timeReg = /<span class="t">([0-9]+:[0-9]+)[^<]+<\/span>/g;

    function fetchWeather() {
        return new Promise(function(resolve, rej) {
            var req = new XMLHttpRequest();
            req.open('GET', 'https://www.cwb.gov.tw/V8/C/W/Town/MOD/3hr/6600800_3hr_PC.html?T=' + genNow());
            req.onreadystatechange = function() {
                if (req.readyState != 4) return;
                if (req.status != 200) {
                    rej();
                    return;
                }

                var resp = String(req.responseText);
                
                var res = matchAll(rainReg, resp);
                var rainCache = [];
                var cur = 0;
                for (var i = 0; i < res.length; i++) {
                    rainCache[cur] = res[i][3];
                    cur++;
                    if (!!res[i][2]) {
                        for (var x = 1; x < res[i][2] * 1; x++) {
                            rainCache[cur] = res[i][3];
                            cur++;
                            if (cur >= 3) break;
                        }
                    }
                }
                
                res = matchAll(tempReg, resp);
                var tempCache = [];
                for (var i = 0; i < res.length; i++) {
                    tempCache[i] = res[i][1];
                }
                
                res = matchAll(humidReg, resp);
                var humidCache = [];
                for (var i = 0; i < res.length; i++) {
                    humidCache[i] = res[i][1];
                }
                
                res = matchAll(dateReg, resp);
                var dateCache = [];
                for (var i = 0; i < res.length; i++) {
                    dateCache[i] = res[i][1];
                }

                res = matchAll(timeReg, resp);
                var timeCache = [];
                for (var i = 0; i < res.length; i++) {
                    timeCache[i] = res[i][1];
                }

                resolve({
                    temp: tempCache,
                    rain: rainCache,
                    humid: humidCache,
                    date: dateCache,
                    time: timeCache,
                });
            };
            req.send(null);
        });
    }

    var weatherData = new Cacheable(5 * 60, "weather", fetchWeather);

    return weatherData;

})();
