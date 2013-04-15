var util = require('util');
var sys = require('sys')

TEXT_OK = "OK";
CODE_OK = 0;
TEXT_WARNING = "WARNING";
CODE_WARGING = 1;
TEXT_CRITICAL = "CRITICAL";
CODE_CRITICAL = 2;
TEXT_UNKNOWN = "UNKNOWN";
CODE_UNKNOWN = 3;

exports.report = function(message, value, perf) {
	var status = {
		text: TEXT_OK,
		exitCode: CODE_OK
	};
	if(perf == undefined) {
		sys.puts(util.format('JBossMBean %s: %s', status.text, message, value));
	} else {
		perf = normalizePerf(perf);
		var status = getStatus(perf);
		sys.puts(util.format('JBossMBean %s: %s %s | %s=%s%s;%s;%s;%s;%s', status.text, message, value, perf.label, perf.value, perf.uom, perf.warn, perf.crit, perf.min, perf.max));
	}
	process.exit(status.exitCode);
}

function normalizePerf(perf) {
	if(perf.uom == undefined) {
		perf.uom = '';
	}
	if(perf.warn == undefined) {
		perf.warn = '';
	}
	if(perf.crit == undefined) {
		perf.crit = '';
	}
	if(perf.min == undefined) {
		perf.min = '';
	}
	if(perf.max == undefined) {
		perf.max = '';
	}
	return perf;
}

function getStatus(perf) {
	res = {
		text: TEXT_OK,
		exitCode: CODE_OK
	};
	if(perf.crit != '') {
		var critRange = parseRangeString(perf.crit);
		if(rangeCheck(critRange, perf.value)) {
			res.text = TEXT_CRITICAL;
			res.exitCode = CODE_CRITICAL;
			return res;
		}
	}
	if(perf.warn != '') {
		var warnRange = parseRangeString(perf.warn);
		if(rangeCheck(warnRange, perf.value)) {
			res.text = TEXT_WARNING;
			res.exitCode = CODE_WARGING;
			return res;
		}
	}
	return res;
}

/*
 * See
 * http://nagiosplug.sourceforge.net/developer-guidelines.html#THRESHOLDFORMAT
 *
 * Author: https://gist.github.com/n8v/3726576
 *
 * @param t String The string with a range definition.
 */
function parseRangeString(t) {
	var start = 0;
	var end = Number.POSITIVE_INFINITY;
	var alert_on_outside = true;
	var valid = false;

	//    console.log('parsing Range %j', t);

	// Strip whitespace.
	t = t.toString().replace(/\s/g, '');

	// Validate
	if ( ! /[\d~]/.test(t) ||
		! /^\@?(-?[\d.]+|~)?(:(-?[\d.]+)?)?$/.test(t)
		) {
		console.error('Invalid range definition %j', t);
		process.exit(3);
		}

	if ( /^@/.test(t)  ) {
	alert_on_outside = false;
	t = t.substring(1);
	}

	if ( /^~:/.test(t)  ) {  // '~:x'
	start = Number.NEGATIVE_INFINITY;
	t = t.substring(2);
	valid = true;
	}

	var m = t.match(/^([\d\.-]+)?:/); // '10:'
	if (m != null ) {
	start = m[1];
	t = t.replace(/^([-\d\.]+)?:/, '');
	valid = true;
	}

	m = t.match(/^([-\d\.]+)$/); // 'x:10' or '10'
	if (m != null ) {
	end = m[1];
	valid = true;
	}

	if (valid && start <= end) {
	return {start: start, end: end, alert_on_outside: alert_on_outside};
	}
	else {
	console.error('Invalid range definition %j', t);
	process.exit(3);
	}

	return null;
}

/*
 * Returns true if an alert should be raised (the value is outside
 * of the range).a
 *
 * @param v Number  The value to be checked.
 * @return boolean
 */

function rangeCheck(range, v) {
    var alerty = false || ! range.alert_on_outside;
	v = v*1;
    if (range.start <= v && v <= range.end) {
		return alerty;
    } else {
		return !alerty;
    }
}

