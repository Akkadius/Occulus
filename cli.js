/**
 * @type {commander.CommanderStatic | commander}
 */
const program     = require('commander');
const path        = require('path')
const pathManager = require("./app/core/path-manager")

/**
 * Path Manager
 */
const path_root = path.resolve(__dirname).split('/node_modules')[0];
pathManager.init(path_root);

/**
 * CLI
 */
program
  .parse(process.argv);

/**
 * Server Launcher
 */
program
  .command('server_launcher')
  .option("--zones [zones]")
  .option("--with-loginserver")
  .description('Starts server launcher')
  .action((options) => require(pathManager.cliRoot + 'server-launcher').serverLauncher(options));

/**
 * Stop Server
 */
program
  .command('stop_server')
  .action(() => require(pathManager.cliRoot + 'server-launcher').stopServer());

/**
 * Create Model
 */
program
  .command('create_model [table]')
  .description('Create model from table')
  .action((table) => require(pathManager.cliRoot + 'create-model').createModel(table));

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