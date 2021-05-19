//=============================================================================
// Arty's Plugins - Party Member Common Event
// Arty_PartyMemberCE.js
// Version 1.0
//=============================================================================

var Imported = Imported || {};
Imported.Arty_PartyMemberCE = true;

var Arty = Arty || {};
Arty.PMCE = Arty.PMCE || {}; 

//-----------------------------------------------------------------------------
/*:
 * @title Arty's Party Member CE
 * @plugindesc (v.1.0) Runs Common Events specific to party changes.
 * @author Artyrambles
 * @version 1.0.0
 * @date May 19th, 2021
 * @filename Arty_PartyMemberCE.js
 * @url https://github.com/artyrambles/rmmv
 *
 * @param ----ADD PARTY MEMBER----
 *
 * @param Actor Add Events
 * @desc Set up Common Events specific to adding actors.
 * @type struct<ActorEvent>[]
 *
 * @param Add Common Event
 * @desc Choose a Common Event that will always run when an actor is added.
 * @type common_event
 * @default 0
 *
 * @param ----REMOVE PARTY MEMBER----
 *
 * @param Actor Remove Events
 * @desc Set up Common Events specific to removing actors.
 * @type struct<ActorEvent>[]
 *
 * @param Remove Common Event
 * @desc Choose a Common Event that will always run when an actor is added.
 * @type common_event
 * @default 0
 *
 * @help
 *   Arty's Plugins: Party Member Common Event
 *----------------------------------------
 * 
 * == CAUTION! ==
 * ----------------------------------------------------------
 * Because of the way RPGMV handles Common Events, it's NOT
 * possible to "queue" multiple Common Events. If you want your
 * events to execute after the current event is done, you will 
 * need a plugin that fixes this behavior. For example, you 
 * could use HIME's Common Event Queue plugin.
 * ----------------------------------------------------------
 *
 * ANOTHER THING TO CONSIDER!
 * When a new game starts, actors are technically added to your
 * party. That means the Common Event associated to their adding
 * will also run. Keep this in mind when setting up their Common
 * Events.
 *
 * == HOW TO USE ==
 * This plugin lets you define a common event for your actors.
 * When the actor is added to the party (or removed), a common
 * event is run every time.
 * You could use this to make the party gain or lose items
 * whenever a certain actor joins or leaves.
 * There is also an option to run Javascript when a certain
 * member is added or removed. (This is experimental. Use
 * with care, and only if you know what you're doing.)
 *
 * There is also an option for running a common event anytime
 * ANY actor is added or removed. Leave them at "None"/0 if 
 * you do not wish to use that.
 * 
 */

Arty.PMCE.parameters = PluginManager.parameters('Arty_PartyMemberCE');
Arty.PMCE.Param = Arty.PMCE.Param || {};
Arty.PMCE.addActorData = [];
Arty.PMCE.removeActorData = [];
Arty.PMCE.addEvent = 0;
Arty.PMCE.removeEvent = 0;

Arty.PMCE.DataManager_IsDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function () {
	if (!Arty.PMCE.DataManager_IsDatabaseLoaded.call(this)) return false;
	if (!Arty.PMCE._loaded_Params) {
		Arty.PMCE.parseParams();
		Arty.PMCE._loaded_Params = true;
	}
return true;
}

Arty.PMCE.parseParams = function() {
		var addEvents = Arty.PMCE.parameters['Actor Add Events'];
		if (addEvents != "")
		{
			var addEventsParsed = JSON.parse(addEvents);
			for (i = 0; i < addEventsParsed.length; i++)
			{
				var thisEvent = JSON.parse(addEventsParsed[i]);
				var newEvent = {};
				newEvent.actor = parseInt(thisEvent["Actor"]);
				newEvent.commonevent = parseInt(thisEvent["Common Event"]);
				newEvent.extraeval = thisEvent["Additional Eval"];
				Arty.PMCE.addActorData.push(newEvent);
			}
		}
		
		var removeEvents = Arty.PMCE.parameters['Actor Remove Events'];
		if (removeEvents != "") {
			var removeEventsParsed = JSON.parse(removeEvents);
			for (i = 0; i < removeEventsParsed.length; i++)
			{
				var thisEvent = JSON.parse(removeEventsParsed[i]);
				var newEvent = {};
				newEvent.actor = parseInt(thisEvent["Actor"]);
				newEvent.commonevent = parseInt(thisEvent["Common Event"]);
				newEvent.extraeval = thisEvent["Additional Eval"];
				Arty.PMCE.removeActorData.push(newEvent);
			}
		}
		Arty.PMCE.addEvent = parseInt(Arty.PMCE.parameters['Add Common Event']);
		Arty.PMCE.removeEvent = parseInt(Arty.PMCE.parameters['Remove Common Event']);
	}

Arty.PMCE.Game_Party_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId) {
    if (!this._actors.contains(actorId)) {
		// do the thing
		if (Arty.PMCE.addEvent != 0) {$gameTemp.reserveCommonEvent(Arty.PMCE.addEvent);}
		for (var i = 0; i < Arty.PMCE.addActorData.length; i++) {
				if (Arty.PMCE.addActorData[i].actor == actorId) {
					if (Arty.PMCE.addActorData[i].extraeval != "") {
						eval(Arty.PMCE.addActorData[i].extraeval);
					}
					$gameTemp.reserveCommonEvent(Arty.PMCE.addActorData[i].commonevent);
				}
		}
		
		// call original function
		Arty.PMCE.Game_Party_addActor.call(this, actorId);
	}
};

Arty.PMCE.Game_Party_removeActor = Game_Party.prototype.removeActor;
Game_Party.prototype.removeActor = function(actorId) {
    if (this._actors.contains(actorId)) {
		// do the thing
		if (Arty.PMCE.removeEvent != 0) {$gameTemp.reserveCommonEvent(Arty.PMCE.removeEvent);}
		for (var i = 0; i < Arty.PMCE.removeActorData.length; i++) {
				if (Arty.PMCE.removeActorData[i].actor == actorId) {
					if (Arty.PMCE.removeActorData[i].extraeval != "") {
						eval(Arty.PMCE.removeActorData[i].extraeval);
					}
					$gameTemp.reserveCommonEvent(Arty.PMCE.removeActorData[i].commonevent);
				}
		}
		
		// call original function
		Arty.PMCE.Game_Party_removeActor.call(this, actorId);
    }
};

/*~struct~ActorEvent:
 * @param Actor
 * @desc Select an actor here. Do not leave it at "None".
 * @type actor
 * @default 0
 *
 * @param Common Event
 * @desc Choose a Common Event here. Do not leave it at "None".
 * @type common_event
 * @default 0
 *
 * @param Additional Eval
 * @desc (optional) If you want to run any additional Javascript code, put it here.
 * @type text
 * @default 
 *
 */
