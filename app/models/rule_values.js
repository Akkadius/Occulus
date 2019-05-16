/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('rule_values', {
		ruleset_id: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0',
			primaryKey: true
		},
		rule_name: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		rule_value: {
			type: DataTypes.STRING(30),
			allowNull: false,
			defaultValue: ''
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 'rule_values',
		timestamps: false,
		freezeTableName: true
	});
};
