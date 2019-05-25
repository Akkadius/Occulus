/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('logsys_categories', {
		log_category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		},
		log_category_description: {
			type: DataTypes.STRING(150),
			allowNull: true
		},
		log_to_console: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		log_to_file: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		log_to_gmsay: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		}
	}, {
		tableName: 'logsys_categories',
		timestamps: false,
		freezeTableName: true
	});
};
