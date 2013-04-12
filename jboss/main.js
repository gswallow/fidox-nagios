var program = require('commander');
var twiddle = require('./twiddle');
var jboss = require('./jboss');
var nagios = require('./nagios')
var sys = require('sys')

program
  .version('0.0.1')
  .option('--host <hostname>', 'Hostname')
  .option('-u, --user <user>', 'The username')
  .option('-p, --password <password>', 'The password')
  .option('-n, --name <name>', 'Nagios name')
  .option('-w, --warning <warning>', 'Nagios warning range')
  .option('-c, --critical <critical>', 'Nagios critical range')
  .option('-t, --type <type>', 'Data type. elapsedTime: If data returned is datetime display the seconds elapsed')

program.command('*')
	.description('mbean command')
	.action(runCommand);

program.parse(process.argv);
function runCommand(cmd) {
	var params = {
		host: program.host,
		username: program.user,
		password: program.password
	};
	twiddle.invoke(cmd, params, function(data) {
		var processor = jboss[program.type];
		processor(data, program.name, program.warning, program.critical);
	});
}