/**
 * @type {commander.CommanderStatic | commander}
 */
const program  = require('commander');
const cli_root = __dirname + '/';

/**
 * CLI
 */
program
  .option('-t --table [table]', 'Table')
  .parse(process.argv);

/**
 * Create Model
 */
program
  .command('createModel')
  .description('Create model from EQEmu table')
  .action((table) => require(cli_root + 'create-model').createModel(table));

/**
 * Help
 */
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

/**
 * Parse args
 */
program.parse(process.argv);