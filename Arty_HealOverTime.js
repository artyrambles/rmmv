//=============================================================================
// Arty's Heal Over Time
// by Artyrambles
// Date: 08/06/2019  
// Last Update: 14/06/2019
//=============================================================================

var Arty = Arty || {};

var Imported = Imported || {};
Imported.Arty_HealOverTime = true;

if(!Imported.YEP_BuffsStatesCore) {
	alert("Arty's Heal Over Time plugin has detected an issue: This plugin requires Yanfly's Buffs and States Core to work! Please go install it.");
}

/*:
 * @plugindesc v2.01 Heal your actors over time on the map. 
 * @author Arty  
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
 * @param Icon
 * @desc (For popups.) The icon ID if you want the popup.
 * @type number
 * @default 84
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
 *   Heal Over Time v2.01 by Arty
 *   Free for both commercial and non-commercial use, with credit.
 * ----------------------------------------------------------------------------
 * 	WHAT IT DOES
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
 * ----------------------------------------------------------------------------
 * 	DEPENDENCIES
 * ----------------------------------------------------------------------------
 * This plugin NEEDS Yanfly's Buffs and States Core. It will not work
 * without for the time being. I may add my custom "state applied"
 * function at some point...
 * ----------------------------------------------------------------------------
 * 	HOW TO USE
 * ----------------------------------------------------------------------------
 *
 * 	STATE SETUP
 * This plugin assumes you have one or more "healing" states. Just create a 
 * State in your database that does nothing.
 * You can create multiple states like this.
 * How the state is applied to the actors is up to you. You could make a skill
 * or apply it through other means.
 * IMPORTANT:
 * This plugin will not do anything unless you add this to the state's
 * notebox:
 * <Custom Apply Effect>
 *  Arty_applyState(stateId);
 * </Custom Apply Effect>
 * If you already have a Custom Apply Effect defined, do it like this:
 * <Custom Apply Effect>
 *  your code
 *  your code
 *  Arty_applyState(stateId);
 * </Custom Apply Effect>
 *
 *	PLUGIN PARAMETERS
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
 *   PLUGIN COMMAND
 * ----------------------------------------------------------------------------
 * This plugin does not have any plugin commands.
 * ----------------------------------------------------------------------------
 *
 * If something doesn't work, please let me know via arty.rambles@gmail.com
 */
 
 // set up parameters
 Arty.parameters = PluginManager.parameters('Arty_HealOverTime');
 Arty.definedStates = [];
 
 // "improve" the states
 Arty_DataManager_IsDatabaseLoaded = DataManager.isDatabaseLoaded;
	DataManager.isDatabaseLoaded = function () {
		if (!Arty_DataManager_IsDatabaseLoaded.call(this)) return false;
		if (!Arty._loaded_HealingStates) {
			Arty_addProperties();
			Arty_addParameterContents();
			Arty._loaded_HealingStates = true;
		}
    return true;
	}
	
	function Arty_addProperties()
	{
		for (i = 1; i < $dataStates.length;i++)
		{
			$dataStates[i].lastTriggered = null;
			$dataStates[i].healing = null;
			$dataStates[i].triggerInterval = null;
			$dataStates[i].remove = true;
		}
	}
	
	function Arty_addParameterContents() {
		currentState = Arty.parameters['States Setup'];
		statesParsed = JSON.parse(currentState);
		for (i = 0; i < statesParsed.length; i++) 
		{
			state = JSON.parse(statesParsed[i]);
			databaseState = $dataStates[state["State"]];
			databaseState.healing = state["Healing"];
			databaseState.triggerInterval = state["Interval"];
			databaseState.remove = state["Persistent"];
			Arty.definedStates.push(state["State"]);
		}
	}
	
	function Arty_applyState(stateId) {
		$dataStates[stateId].lastTriggered = Graphics.frameCount;
	}
	
// now hijack the map updating	

Arty.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
	for (i = 0; i < Arty.definedStates.length; i++)
	{
		currentId = Arty.definedStates[i];
		if ($dataStates[currentId].lastTriggered != null)
		{
			triggerInterval = $dataStates[currentId].triggerInterval;
			healing = $dataStates[currentId].healing;
			lastTriggered = $dataStates[currentId].lastTriggered;
			remove = $dataStates[currentId].remove;
			currentFrameCount = Graphics.frameCount;
			if ((currentFrameCount - lastTriggered) > triggerInterval)
			{
				// do the thing!
				percentage = Arty_checkPercentage(healing);
				Arty_checkAll(currentId, healing, percentage, remove);
			}
		}
	}
    // call the old update
	Arty.Scene_Map_update.call(this);
};
	
	function Arty_checkPercentage(healing)
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
	
  
	function Arty_checkAll(stateId, healing, percentage, remove) {
		membersCount = 0;
		for (i = 0; i < $gameParty.size(); i++)
		{
			aActor = $gameParty.members()[i];
			if (aActor.isStateAffected(parseInt(stateId)))
			{
				membersCount++;
				aActorHP = aActor.hp;
				aActorMHP = aActor.mhp;
				if (aActorHP == aActorMHP)
				{
					if (!remove)
					{
						aActor.removeState(stateId);
					} else {
						$dataStates[parseInt(stateId)].lastTriggered = null;
					}
				} else {
					if (percentage)
					{
						healing = parseInt(healing)*0.01;
						gains = aActor.mhp*healing;
					} else {
						gains = parseInt(healing);
					}
					aActor.gainHp(gains);
					$dataStates[parseInt(stateId)].lastTriggered = Graphics.frameCount;
					if (Arty.parameters["Popups"])
					{
						if (Arty.parameters["Verbose Popups"])
						{
							$gameSystem.createPopup(Arty.parameters["Icon"], "right", aActor.name()+" gains "+gains.toString()+" ");
						}else {
							$gameSystem.createPopup(Arty.parameters["Icon"], "right", "+"+gains.toString()+" ");
						}
					}
				}
			}
		}
		if (membersCount == 0)
		{
			$dataStates[stateId].lastTriggered = null;
		}
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
 * @param Healing
 * @desc How much HP is restored? Put a % after the number for percentages. Do NOT put formulas. Example: 20 or 20%
 * @type text
 * @default 10%
 *
 * @param Persistent
 * @desc Will the state be removed after the actor was healed fully?
 * @type boolean
 * @on yes
 * @off no
 * @default true
 */
  