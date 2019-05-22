/**
 * @type {{check: module.exports.check}}
 */
const slugify        = require('slugify')
const util           = require('util')
const crypto         = require('crypto');
const apiAuthService = require('./auth-service')
const file           = 'websocket-auth.js'

module.exports = {
  checkEqemuWebsocketAuthorization : async function () {
    const slugifiedUser = slugify(apiAuthService.user)
    const accountName   = util.format(
      'eqemu-admin-ws-user-%s',
      slugifiedUser
    );

    const account      = models['account'].resource
    const hash         = crypto
      .createHash('md5')
      .update(apiAuthService.userToken)
      .digest('hex');

    const foundAccount = await account
      .findOne({
        where : { name : accountName },
      })

    if (foundAccount === null) {
      console.debug('[%s] We need to create an account', file)

      await account
        .create(
          {
            name : accountName,
            password : hash,
            status : 255
          }
        );
    } else if (foundAccount) {
      console.debug('[%s] Websocket account "%s" already created', file, accountName)

      if (foundAccount.password !== hash) {
        console.debug('[%s] Websocket account "%s" needs to be updated to "%s"',
          file,
          accountName,
          hash
        )

        await account
          .update(
            { password : hash },
            { where : { id : foundAccount.id } }
          )
          .then(function (user) {
            console.debug('[%s] Websocket account "%s" updated to "%s"',
              file,
              accountName,
              hash
            )
          })
          .catch(function (err) {
            return { error : 'Unknown error updating entity: ' + err }
          });
      }

      return {
        account_name : accountName,
        password : hash
      }
    }
  },
};
