/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('variables', {
		varname: {
			type: DataTypes.STRING(25),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		value: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		information: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		ts: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.fn('current_timestamp')
		}
	}, {
		tableName: 'variables',
		timestamps: false,
		freezeTableName: true
	});
};
