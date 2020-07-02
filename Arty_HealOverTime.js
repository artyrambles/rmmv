
var Imported = Imported || {};
Imported.Arty_HealOverTime = true;

var Arty = Arty || {};
Arty.HOT = Arty.HOT || {};

if(!Imported.YEP_BuffsStatesCore) {
	alert("Arty's Heal Over Time plugin has detected an issue: This plugin requires Yanfly's Buffs and States Core to work! Please go install it.");
}

/*:
 * @title Arty's Heal Over Time
 * @plugindesc v2.2.3 Heal your actors over time on the map.
 * @author Artyrambles
 * @version 2.2.3
 * @date July 2nd, 2020
 * @filename Arty_HealOverTime.js
 * @url https://github.com/artyrambles/rmmv
 *
 * @param ----STATES SETTINGS----
 *
 * @param States Setup
 * @desc Set up your States and their properties.
 * @type struct<States>[]
 *
 * @param ----POPUP SETTINGS----
 *
 * @param Popups
 * @desc Only set this to ON if you have Mr Trivel's popup plugin installed!
 * @type boolean
 * @default false
 *
 * @param HP Icon
 * @desc (For popups.) The icon ID if you want the popup.
 * @type number
 * @default 84
 *
 * @param MP Icon
 * @desc (For popups.) The icon ID if you want the popup.
 * @type number
 * @default 67
 *
 * @param Verbose Popups
 * @desc (For popups.) Display actor name in popup?
 * @type boolean
 * @on verbose
 * @off compact
 * @default false
 *
 *
 * @help
 * ----------------------------------------------------------------------------
 *   Heal Over Time v2.2.3 by Arty
 *   Free for both commercial and non-commercial use, with credit.
 * ----------------------------------------------------------------------------
 *   WHAT IT DOES
 * ----------------------------------------------------------------------------
 * This plugin will help you heal your actors outside of battle, by setting
 * up one or multiple States in the plugin manager and the database.
 * The plugin will loop through your party and heal everyone who has the
 * specified state(s) applied at the moment. When they are fully healed,
 * it's possible to remove the state or have it remain.
 *
 * Note: Once the party member is fully healed, the persistent state will
 * not do anything on its own anymore, even if it isn't removed. I don't
 * really know what to do about that, so suggestions are welcome.
 *
 * ----------------------------------------------------------------------------
 *   DEPENDENCIES
 * ----------------------------------------------------------------------------
 * This plugin NEEDS Yanfly's Buffs and States Core. It will not work
 * without for the time being. I may add my custom "state applied"
 * function at some point...
 *
 * ----------------------------------------------------------------------------
 *   HOW TO USE
 * ----------------------------------------------------------------------------
 *   STATE SETUP
 * This plugin assumes you have one or more "healing" states. Just create a
 * State in your database that does nothing.
 * You can create multiple states like this.
 * How the state is applied to the actors is up to you. You could make a skill
 * or apply it through other means.
 * IMPORTANT:
 * This plugin will not do anything unless you add this to the state's notebox:
 * <Custom Apply Effect>
 *  Arty.applyState(stateId, user);
 * </Custom Apply Effect>
 *
 * If you already have a Custom Apply Effect defined, do it like this:
 * <Custom Apply Effect>
 *  your code
 *  your code
 *  Arty.applyState(stateId, user);
 * </Custom Apply Effect>
 *
 * YOU DON'T NEED TO CHANGE ANYTHING IN THIS SCRIPT CALL! Don't replace the
 * "stateId" or "user" with anything! It's supposed to be used exactly like
 * this or stuff will break.
 *
 *  REMOVING STATES
 * You can also "prematurely cancel" the healing effect by removing the state,
 * and adding the following into the state's notebox:
 * <Custom Remove Effect>
 *  Arty.removeState(stateId, user);
 * </Custom Remove Effect>
 *
 * If you already have a Custom Remove Effect defined, do it like this:
 * <Custom Remove Effect>
 *  your code
 *  your code
 *  Arty.removeState(stateId, user);
 * </Custom Remove Effect>
 *
 *  PLUGIN PARAMETERS
 * If you want to use popups, you have to install this:
 *   https://github.com/Trivel/RMMV/blob/master/MrTS_PopUp.js
 * Then set the "Popups" plugin parameter to ON (true).
 * Then set the "Icon" plugin parameter to the ID of the icon you want to
 * display in the popup.
 * You can choose between compact and verbose popups.
 *
 * To have the plugin take your states into account, you have to define them
 * in the plugin parameter "States Setup".
 * Open this parameter, then double-click on an empty field and fill out
 * the required parameters. They have descriptions to help you.
 *
 * That's all you need to do. The plugin will do the rest for you.
 *
 * ----------------------------------------------------------------------------
 *   CHANGELOG
 * ----------------------------------------------------------------------------
 * 2020/07/02: fixed conflict that led to states not getting removed properly
 * 2020/07/01: fixed bug with auto-removal of states; added changelog
 * 2020/06/22: added functionality to prematurely remove healing effect
 * 2020/06/23: completely reworked code and fixed critical bugs
 * 2019/06/22: added option to heal MP instead of HP, small code improvements
 * 2019/06/13: completely rewrote the code based on feedback
 * 2019/06/10: added the option to heal a percentage of the actor's max HP
 *
 * ----------------------------------------------------------------------------
 *
 * If something doesn't work, please let me know via
 * arty.rambles (at) gmail.com
 */

 // set up parameters
 Arty.HOT.parameters = PluginManager.parameters('Arty_HealOverTime');
 Arty.HOT.definedStates = [];

 // "improve" the states
 Arty.HOT.DataManager_IsDatabaseLoaded = DataManager.isDatabaseLoaded;
	DataManager.isDatabaseLoaded = function () {
		if (!Arty.HOT.DataManager_IsDatabaseLoaded.call(this)) return false;
		if (!Arty.HOT._loaded_HealingStates) {
			Arty.HOT.addProperties();
			Arty.HOT.addParameterContents();
			Arty.HOT._loaded_HealingStates = true;
		}
    return true;
	}

	Arty.HOT.addProperties = function()
	{
		for (i = 1; i < $dataStates.length;i++)
		{
			$dataStates[i].lastTriggered = null;
			$dataStates[i].healing = null;
			$dataStates[i].triggerInterval = null;
			$dataStates[i].remove = true;
			$dataStates[i].hpmp = "HP";
		}
	}

	Arty.HOT.GameActor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		this.healingStates = [];
		Arty.HOT.GameActor_setup.call(this, actorId);
	}

	Arty.HOT.addParameterContents = function() {
		currentState = Arty.HOT.parameters['States Setup'];
		statesParsed = JSON.parse(currentState);
		for (i = 0; i < statesParsed.length; i++)
		{
			state = JSON.parse(statesParsed[i]);
			databaseState = $dataStates[state["State"]];
			databaseState.healing = state["Healing"];
			// TESTING... changed this line
		  databaseState.hpmp = state["Type"];
			databaseState.triggerInterval = state["Interval"];
			if (state["Persistent"] == "false") databaseState.remove = false;
			Arty.HOT.definedStates.push(state["State"]);
		}
	}

 Arty.applyState = function (stateId, actor) {
		// add the lastTriggered to the actor here...
		var match = false;
		actor.healingStates.forEach(function(hState){
			// hState[0] contains the stateId
 			if (hState[0] == stateId)
			{
				match = true;
				// this replaces the lastTriggered
				hState[1] = Graphics.frameCount;
			}
		});
		// the actor isn't affected by the state yet
		if (!match)
		{
			var newState = [stateId, Graphics.frameCount];
			actor.healingStates.push(newState);
		}
	}

	// new function to "cancel" the healing state pre-maturely
	Arty.removeState = function(stateId, actor) {
		var indexToRemove = null;
		for (var i = 0; i < actor.healingStates.length; i++)
		{
			if (actor.healingStates[i][0] == stateId)
			{
				indexToRemove = i;
				break;
			}
		}
		// remove it from the array... but later
		if (indexToRemove != null)
		{
			actor.healingStates[indexToRemove][0] = -1;
		}

	}

// now hijack the map updating

Arty.HOT.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
	statesToRemove = [];
	for (i = 0; i < Arty.HOT.definedStates.length; i++)
	{
		currentId = Arty.HOT.definedStates[i];
		triggerInterval = $dataStates[currentId].triggerInterval;
		currentFrameCount = Graphics.frameCount;
		// do this for every party member
		$gameParty.members().forEach(function(m){
			if (m == undefined) return;
			// 2.2.3 - added this line!
			statesToRemove.length = 0;
			// check every registered healing state!
			for (var i = 0; i < m.healingStates.length; i++)
			{
				// 2.2.3 - added this clause to remove "junk" states
				if (m.healingStates[i][0] == -1)
				{
					statesToRemove.push(i);
					continue;
				}
				if (m.healingStates[i][0] == currentId && ((currentFrameCount - m.healingStates[i][1]) > triggerInterval))
				{
					remove = !$dataStates[currentId].remove;
					healing = $dataStates[currentId].healing;
					percentage = Arty.HOT.checkPercentage(healing);

					// do the thing.
					stateId = parseInt(currentId);
					aState = $dataStates[stateId];
					switch (aState.hpmp)
					{
						case "HP":
							hpmp = true;
							break;
						case "MP":
							hpmp = false;
							break;
					}
					if (hpmp)
					{
						aActorHP = m.hp;
						aActorMHP = m.mhp;
					} else {
						aActorHP = m.mp;
						aActorMHP = m.mmp;
					}

					// check if actor has full hp/mp, if yes, then check if remove state
					if (aActorHP == aActorMHP)
					{
						if (remove)
						{
							// remove it from the array... but later!!
							// 2.2.3 - added this line
							statesToRemove.push(i);
							m.removeState(stateId);
						} else {
							m.healingStates[i][1] = null;
						}

					// actor HP/MP isn't full. heal
					} else {
						if (percentage)
						{
							healing = parseInt(healing)*0.01;
							gains = aActorMHP*healing;
						} else {
							gains = parseInt(healing);
						}
						gains = Math.ceil(gains);
						if (hpmp)
						{
							m.gainHp(gains);
						} else {
							m.gainMp(gains);
						}
						// set last healing time
						m.healingStates[i][1] = Graphics.frameCount;

						// show popup if desired
						if (Arty.HOT.parameters["Popups"] == "true")
						{
							if (hpmp)
							{
								icon = Arty.HOT.parameters["HP Icon"];
							} else {
								icon = Arty.HOT.parameters["MP Icon"];
							}

							if (Arty.HOT.parameters["Verbose Popups"] == "true")
							{
								$gameSystem.createPopup(icon, "right", m.name()+" gains "+gains.toString()+" ");

							} else {
								$gameSystem.createPopup(icon, "right", "+"+gains.toString()+" ");
							}
						}

					}
				}
			}
			// 2.2.3 - Added this as a new/proper way to remove the states from the healing states array
			if (statesToRemove.length != 0)
			{
				for (var x = 0; x < statesToRemove.length; x++)
				{
					m.healingStates[statesToRemove[x]] = -1;
				}
				filteredStates = m.healingStates.filter(state => state != -1);
				m.healingStates = filteredStates;
			}
		});
	}
    // call the old update
	Arty.HOT.Scene_Map_update.call(this);
};

	Arty.HOT.checkPercentage = function(healing)
	{
		healingRaw = String(healing);
		numberPattern = /(\d*)%/i;
		percentPattern = /%/;
		percentage = false;
		if (healingRaw.match(percentPattern))
		{
			// it's a percentage...
			percentage = true;
			healingAll = healingRaw.match(numberPattern);
			healing = healingAll[1];
		} else {
			// it's a flat number...
			healing = healingRaw;
		}

		return percentage;
	}


/*~struct~States:
 * @param State
 * @desc Select a state here. Do not leave at "Nothing".
 * @type state
 * @default 0
 *
 * @param Interval
 * @desc How many frames pass until the healing repeats?
 * @type number
 * @default 420
 *
 * @param Type
 * @desc HP or MP?
 * @type select
 * @option HP
 * @value HP
 * @option MP
 * @value MP
 * @default HP
 *
 * @param Healing
 * @desc How much HP is restored? Put a % after the number for percentages. Do NOT put formulas. Example: 20 or 20%
 * @type text
 * @default 10%
 *
 * @param Persistent
 * @desc Will the state stay after the actor was healed fully?
 * @type boolean
 * @on yes
 * @off no
 * @default false
 */
