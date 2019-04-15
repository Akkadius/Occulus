/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('guilds', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: '',
			unique: true
		},
		leader: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			unique: true
		},
		minstatus: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		motd: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		tribute: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		motd_setter: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		},
		channel: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		url: {
			type: DataTypes.STRING(512),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 'guilds',
		timestamps: false,
		freezeTableName: true
	});
};
