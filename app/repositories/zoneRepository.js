const database = use('/app/core/database');

module.exports = {

  /**
   * @returns array
   */
  all: async function() {
    return (await database.contentConnection.query('SELECT * FROM zone', { type: 'SELECT' }));
  },
};
