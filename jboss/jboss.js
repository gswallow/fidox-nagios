require('date-utils');
var config = require('./config');

var sys = require('sys')
var exec = require('child_process').exec;

var twiddle = "jboss-client/twiddle.sh";

function puts(error, stdout, stderr) {
	var d = new Date(stdout.trim());
	var now = new Date();
	sys.puts(now.getSecondsBetween(d));
}

exec(config.cmd, puts);