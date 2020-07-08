const database = require('../core/database')

module.exports = {

    /**
     * @return {boolean}
     */
    getMotd: async function () {
        return (await database.connection.query('SELECT * from variables WHERE varname = :varname',
            {
                replacements: {varname: 'MOTD'},
                type: 'SELECT'
            }
        ))[0];
    },

    updateMotd: async function (motd) {
        return (await database.connection.query(
            'UPDATE variables SET value = :motd WHERE varname = :varname',
            {
                replacements: {'motd': motd, 'varname': 'MOTD'},
                type: 'UPDATE'
            }
        ))[0];
    }
};
