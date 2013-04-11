require('date-utils');
var nagios = require('./nagios')
var S = require('string');
var nagios = require('./nagios')

exports.raw = function(s) {
	return s.trim();
}

exports.elapsedTime = function(s) {
	var d = new Date(s.trim());
	var now = new Date();
	return now.getSecondsBetween(d);
}

exports.memory = function(s, name) {
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
		warn: '@10:20'
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