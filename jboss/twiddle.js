var exec = require('child_process').exec;
var config = require('./config').config;

/**
 * Invoke a mbean action
 * @mbeanCmd command to invoke, [get|set|invoke] mbean-name
 * @options Server configuration: {host: <hostname>, user: <user>, password: <pass>
 * @callback: function(result) Function called with the result of the invoke
 */
exports.invoke = function(mbeanCmd, options, callback) {
	var cmd = config.twiddle + ' --host=' + options.host + ' -u ' + options.username + ' -p ' + options.password + ' ' + mbeanCmd;
	exec(cmd, function(error, stdout, stderr) {
		callback(stdout);
	});
}