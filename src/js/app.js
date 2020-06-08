/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var Settings = require('settings');
Settings.config({
    url: 'https://Ronmi.github.com/pebble-cwb/index.html',
});

var UI = require('ui');
var weather = require('./weather');
var cwb = require('./cwb');

var pending = new UI.Card({
  title: 'Taiwan Weather',
  body: 'Loading weather....',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

pending.show();

var cur = 0;
cwb.get().then(function(v) {
    weather.render(v);
    pending.hide();
    cur = 0;
    weather.show(cur);
});
