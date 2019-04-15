/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('npc_types', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		lastname: {
			type: DataTypes.STRING(32),
			allowNull: true
		},
		level: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		race: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		class: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		bodytype: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '1'
		},
		hp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		mana: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		gender: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		texture: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		helmtexture: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		herosforgemodel: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		size: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		hp_regen_rate: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		mana_regen_rate: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		loottable_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		merchant_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		alt_currency_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		npc_spells_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		npc_spells_effects_id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		npc_faction_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		adventure_template_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		trap_template: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: true,
			defaultValue: '0'
		},
		mindmg: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		maxdmg: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		attack_count: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			defaultValue: '-1'
		},
		npcspecialattks: {
			type: DataTypes.STRING(36),
			allowNull: false,
			defaultValue: ''
		},
		special_abilities: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		aggroradius: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		assistradius: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		face: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_hairstyle: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_haircolor: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_eyecolor: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_eyecolor2: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_beardcolor: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '1'
		},
		luclin_beard: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		drakkin_heritage: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			defaultValue: '0'
		},
		drakkin_tattoo: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			defaultValue: '0'
		},
		drakkin_details: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			defaultValue: '0'
		},
		armortint_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		armortint_red: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		armortint_green: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		armortint_blue: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		d_melee_texture1: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		d_melee_texture2: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		ammo_idfile: {
			type: DataTypes.STRING(30),
			allowNull: false,
			defaultValue: 'IT10'
		},
		prim_melee_type: {
			type: DataTypes.INTEGER(4).UNSIGNED,
			allowNull: false,
			defaultValue: '28'
		},
		sec_melee_type: {
			type: DataTypes.INTEGER(4).UNSIGNED,
			allowNull: false,
			defaultValue: '28'
		},
		ranged_type: {
			type: DataTypes.INTEGER(4).UNSIGNED,
			allowNull: false,
			defaultValue: '7'
		},
		runspeed: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		MR: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		CR: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		DR: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		FR: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		PR: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		Corrup: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		PhR: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		see_invis: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		see_invis_undead: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		qglobal: {
			type: DataTypes.INTEGER(2).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		AC: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		},
		npc_aggro: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		spawn_limit: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		attack_speed: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0'
		},
		attack_delay: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '30'
		},
		findable: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		STR: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		STA: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		DEX: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		AGI: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		_INT: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '80'
		},
		WIS: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		CHA: {
			type: DataTypes.INTEGER(8).UNSIGNED,
			allowNull: false,
			defaultValue: '75'
		},
		see_hide: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		see_improved_hide: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		trackable: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		isbot: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		exclude: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '1'
		},
		ATK: {
			type: DataTypes.INTEGER(9),
			allowNull: false,
			defaultValue: '0'
		},
		Accuracy: {
			type: DataTypes.INTEGER(9),
			allowNull: false,
			defaultValue: '0'
		},
		Avoidance: {
			type: DataTypes.INTEGER(9).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		slow_mitigation: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		version: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		maxlevel: {
			type: DataTypes.INTEGER(3),
			allowNull: false,
			defaultValue: '0'
		},
		scalerate: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '100'
		},
		private_corpse: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		unique_spawn_by_name: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		underwater: {
			type: DataTypes.INTEGER(3).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		isquest: {
			type: DataTypes.INTEGER(3),
			allowNull: false,
			defaultValue: '0'
		},
		emoteid: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		spellscale: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '100'
		},
		healscale: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '100'
		},
		no_target_hotkey: {
			type: DataTypes.INTEGER(1).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		raid_target: {
			type: DataTypes.INTEGER(1).UNSIGNED,
			allowNull: false,
			defaultValue: '0'
		},
		armtexture: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		bracertexture: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		handtexture: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		legtexture: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		feettexture: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		light: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		walkspeed: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		peqid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		unique_: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		fixed: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		ignore_despawn: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		show_name: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '1'
		},
		untargetable: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		charm_ac: {
			type: DataTypes.INTEGER(5),
			allowNull: true,
			defaultValue: '0'
		},
		charm_min_dmg: {
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: '0'
		},
		charm_max_dmg: {
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: '0'
		},
		charm_attack_delay: {
			type: DataTypes.INTEGER(3),
			allowNull: true,
			defaultValue: '0'
		},
		charm_accuracy_rating: {
			type: DataTypes.INTEGER(9),
			allowNull: true,
			defaultValue: '0'
		},
		charm_avoidance_rating: {
			type: DataTypes.INTEGER(9),
			allowNull: true,
			defaultValue: '0'
		},
		charm_atk: {
			type: DataTypes.INTEGER(9),
			allowNull: true,
			defaultValue: '0'
		},
		skip_global_loot: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0'
		},
		rare_spawn: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0'
		},
		stuck_behavior: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		model: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
			defaultValue: '0'
		}
	}, {
		tableName: 'npc_types',
		timestamps: false,
		freezeTableName: true
	});
};
