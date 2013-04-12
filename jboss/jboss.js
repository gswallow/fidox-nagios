require('date-utils');
var nagios = require('./nagios')
var S = require('string');
var nagios = require('./nagios')

exports.raw = function(s, name, warn, crit) {
	nagios.report(name, s.trim());
}

exports.elapsedTime = function(s) {
	var d = new Date(s.trim());
	var now = new Date();
	return now.getSecondsBetween(d);
}

exports.memory = function(s, name, warn, crit) {
	var res = s.substring(s.indexOf('contents=') + 10	, s.length -3);
	res = S(res).replaceAll(",", "").s;
	var data = {};
	var items = res.split(" ");
	for(var i = 0; i < items.length; i++) {
		var row = items[i].split("=");
		data[row[0]] = row[1];
	}
	perf = {
		label: 'used',
		value: data.used,
		uom: 'B',
		max: data.max,
		crit: crit,
		warn: warn
	};
	nagios.report(name, data.used, perf);
}

exports.javaData = function(s) {
	var res = s.substring(s.indexOf('contents=') + 10	, s.length -3);
	var data = {};
	var items = res.split(" ");
	for(var i = 0; i < items.length; i++) {
		var row = items[i].split("=");
		data[row[0]] = row[1];

	}
	return data;
};