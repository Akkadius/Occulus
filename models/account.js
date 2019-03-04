/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('account', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(30),
			allowNull: false,
			defaultValue: '',
			unique: true
		},
		charname: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		},
		sharedplat: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		password: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		status: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		lsaccount_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: true,
			unique: true
		},
		gmspeed: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		revoked: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		karma: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		minilogin_ip: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: ''
		},
		hideme: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rulesflag: {
			type: DataTypes.INTEGER(1).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		suspendeduntil: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: '0000-00-00 00:00:00'
		},
		time_creation: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		expansion: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		ban_reason: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		suspend_reason: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 'account',
		timestamps: false,
		freezeTableName: true
	});
};
