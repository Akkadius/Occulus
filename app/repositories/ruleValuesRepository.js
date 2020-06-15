const database = require('../core/database')

module.exports = {

  /**
   * @returns array
   */
  getAllRuleValues: async function() {
    return (await database.connection.query('SELECT * from rule_values',
      {
        type: 'SELECT'
      }
    ));
  },

  /**
   * @param rulesetId
   * @param ruleName
   * @param ruleValue
   * @returns {Promise<*>}
   */
  updateRuleValue: async function (rulesetId, ruleName, ruleValue) {
    return (await database.connection.query(
      'UPDATE rule_values SET rule_value = :rule_value WHERE rule_name = :rule_name ' +
      'AND ruleset_id = :ruleset_id',
      {
        replacements: {
          'ruleset_id': rulesetId,
          'rule_name': ruleName,
          'rule_value': ruleValue
        },
        type: 'UPDATE'
      }
    ))[0]
  },
};
