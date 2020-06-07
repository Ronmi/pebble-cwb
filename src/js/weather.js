module.exports = (function(){
    var UI = require('ui');
    
    var cards = [];

    var max = function() {
        return cards.length;
    };

    var formatWeather = function(temp, rain, humid) {
        var ret = "Temperature: " + String(temp) + "\n" +
            "Rain: " + String(rain) + "%\n" +
            "Humidity: " + String(humid) + "%";

        return ret;
    };

    var render = function(data) {
        cards = [];
        for (var i = 0; i < data.temp.length; i++) {
            var cardData = {
                title: data.time[i] + '0',
                subtitle: data.date[i],
                body: formatWeather(
                    data.temp[i],
                    data.rain[i],
                    data.humid[i]
                ),
            };

            cards.push(cardData);
        }
    };

    var show = function(i) {
        var c = new UI.Card(cards[i]);

        var cur = i;
        c.on('click', 'up', function() {
            if (cur == 0) {
                return;
            }

            c.hide();
            show(cur-1);
        });

        c.on('click', 'down', function() {
            if (cur >= cards.length-1) {
                return;
            }
            
            c.hide();
            show(cur+1);
        });

        c.show();

        return c;
    }

    return {
        render: render,
        show: show,
        max: max,
    };
})();
