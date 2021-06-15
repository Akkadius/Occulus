/**
 * @type {{check: module.exports.check}}
 */
const slugify        = require('slugify')
const util           = require('util')
const crypto         = require('crypto');
const apiAuthService = require('./auth-service')
const file           = 'websocket-auth.js'
let database       = use('/app/core/database')

module.exports = {
  checkEqemuWebsocketAuthorization: async function () {
    const slugifiedUser = slugify(apiAuthService.user)
    const accountName   = util.format(
      'eqemu-admin-ws-user-%s',
      slugifiedUser
    );

    // const account      = models['account'].resource
    const hash = crypto
      .createHash('md5')
      .update(apiAuthService.userToken)
      .digest('hex');

    const foundAccount = (await
        database.connection.query(
          `SELECT *
           FROM account
           where \`name\` = :acc LIMIT 1`,
          {
            replacements: {'acc': accountName},
            type: 'SELECT'
          }
        )
    )[0]

    if (!foundAccount) {
      console.log('[%s] We need to create an account', file);

      (await
        database.connection.query(
          'INSERT INTO account (name, password, status) VALUES (:name, :password, 255)',
          {
            replacements: {name: accountName, password: hash},
            type: 'INSERT'
          }
        )
      )

      return {
        account_name: accountName,
        password: hash
      }

    } else if (foundAccount) {
      console.log('[%s] Websocket account "%s" already created', file, accountName)

      if (foundAccount.password !== hash) {
        console.log('[%s] Websocket account "%s" needs to be updated to "%s"',
          file,
          accountName,
          hash
        );

        (await database.connection.query(
          'UPDATE account SET password = :password WHERE id = :id',
          {
            replacements: {'password': hash, 'id': foundAccount.id},
            type: 'UPDATE'
          }
        )).then(function (user) {
          console.log('[%s] Websocket account "%s" updated to "%s"',
            file,
            accountName,
            hash
          );
        }).catch(function (err) {
          return {error: 'Unknown error updating entity: ' + err}
        });
      }

      return {
        account_name: accountName,
        password: hash
      }
    }
  },
};
