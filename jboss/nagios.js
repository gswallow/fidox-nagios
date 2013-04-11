var util = require('util');

exports.ok = function(name, metric, value, unit) {
	return util.format('OK %s %s: %s%s | secs=%s%s', name, metric, value, unit, value, unit);
}