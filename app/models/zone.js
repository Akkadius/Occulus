/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('zone', {
		short_name: {
			type: DataTypes.STRING(32),
			allowNull: true
		},
		id: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		file_name: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		long_name: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		map_file_name: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		safe_x: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		safe_y: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		safe_z: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		graveyard_id: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		min_level: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		min_status: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		zoneidnumber: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		version: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		timezone: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		maxclients: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		ruleset: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		note: {
			type: DataTypes.STRING(80),
			allowNull: true
		},
		underworld: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		minclip: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		maxclip: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_minclip: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_maxclip: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_blue: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_red: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_green: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		sky: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		ztype: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		zone_exp_multiplier: {
			type: DataTypes.DECIMAL,
			allowNull: false,
			defaultValue: '0.00'
		},
		walkspeed: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0.4'
		},
		time_type: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '2'
		},
		fog_red1: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_green1: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_blue1: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_minclip1: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_maxclip1: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_red2: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_green2: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_blue2: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_minclip2: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_maxclip2: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_red3: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_green3: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_blue3: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_minclip3: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_maxclip3: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_red4: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_green4: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_blue4: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		fog_minclip4: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_maxclip4: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '450'
		},
		fog_density: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		flag_needed: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		canbind: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		cancombat: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		canlevitate: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		castoutdoor: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		hotzone: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		insttype: {
			type: DataTypes.INTEGER(1).UNSIGNED.ZEROFILL,
			allowNull: false,
			defaultValue: '0'
		},
		shutdowndelay: {
			type: DataTypes.BIGINT,
			allowNull: false,
			defaultValue: '5000'
		},
		peqzone: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		expansion: {
			type: DataTypes.INTEGER(3),
			allowNull: false,
			defaultValue: '0'
		},
		suspendbuffs: {
			type: DataTypes.INTEGER(1).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		rain_chance1: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_chance2: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_chance3: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_chance4: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_duration1: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_duration2: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_duration3: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		rain_duration4: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_chance1: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_chance2: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_chance3: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_chance4: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_duration1: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_duration2: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_duration3: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		snow_duration4: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		gravity: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0.4'
		},
		type: {
			type: DataTypes.INTEGER(3),
			allowNull: false,
			defaultValue: '0'
		},
		skylock: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		fast_regen_hp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '180'
		},
		fast_regen_mana: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '180'
		},
		fast_regen_endurance: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '180'
		},
		npc_max_aggro_dist: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '600'
		},
		max_movement_update_range: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '600'
		}
	}, {
		tableName: 'zone',
		timestamps: false,
		freezeTableName: true
	});
};
