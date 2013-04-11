require('date-utils');
var sys = require('sys')
var nagios = require('./nagios')
var S = require('string');

exports.raw = function(s) {
	sys.puts(s.trim());
}

exports.elapsedTime = function(s) {
	var d = new Date(s.trim());
	var now = new Date();
	var secs = now.getSecondsBetween(d);
	sys.puts(nagios.ok('name', 'metric', secs, 's'));
}

exports.javaData = function(s) {
	var res = s.substring(s.indexOf('contents=') + 10	, s.length -3);
	var data = {};
	var items = res.split(" ");
	for(var i = 0; i < items.length; i++) {
		var row = items[i].split("=");
		data[row[0]] = row[1];
	}
	console.log(data);
};