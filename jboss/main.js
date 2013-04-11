var program = require('commander');
var twiddle = require('./twiddle');
var jboss = require('./jboss');

program
  .version('0.0.1')
  .option('--host <hostname>', 'Hostname')
  .option('-u, --user <user>', 'The username')
  .option('-p, --password <password>', 'The password')
  .option('-n, --name <name>', 'Nagios name')
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
	twiddle.invoke(cmd, params, jboss[program.type]);
}