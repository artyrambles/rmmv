//=============================================================================
// Arty's Plugins - Follower Vehicles
// Arty_FollowerVehicles.js
// Version 1.1
//=============================================================================

var Imported = Imported || {};
Imported.Arty_FollowerVehicles = true;

var Arty = Arty || {};
Arty.FV = Arty.FV || {};

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.1) Give followers their own vehicle.
 *
 * @author Arty
 *
 * @help
 *   Arty's Plugins: Follower Vehicles
 *------------------------------------------------------------------------------
 * Free to use for commercial and non-commercial projects.
 * Please credit "Arty".
 *------------------------------------------------------------------------------
 *
 * ==== PREPARATIONS ====
 * Choose a "blank" character spritesheet and set it as the blank image in the
 * plugin parameters. This will be used when you don't have a follower vehicle
 * defined for an actor, if you set the corresponding plugin parameter to true.
 * It will also be used for the player in some situations, so please add it
 * even if you set the "Use Blank Image" parameter to "no".
 * To create such a spritesheet you could just take any character sheet and
 * delete its visible sprites. You can find an example file on my github
 * in the folder "Materials". (https://github.com/artyrambles/rmmv)
 *
 * ==== SETTING UP ACTORS ====
 * Put the following notetags in actor noteboxes to give them a vehicle
 * image. They will follow the player in their "vehicle" if the player gets on
 * a vehicle.
 *
 * <vehicleName:filename>
 * <vehicleIndex:index>
 *
 * For "filename", put the filename of the vehicle in your characters folder,
 * without quotation marks and without the file extension. For "index", put
 * the index of the character. It starts at 0 on the top left of the image.
 *
 * ==== OPTIONAL: ALTERNATIVE VEHICLES ====
 * If you want to use alternative images when the player is moving, set the
 * plugin parameter to "yes" and also add this to the actor's notebox:
 *
 * <vehicleNameAlt:filename>
 * <vehicleIndexAlt:index>
 *
 * If the player is standing still, the first image will be used, if they are
 * moving, the alternative one will be used.
 *
 * ==== DEFAULT VEHICLES ====
 * You can also set a default vehicle for followers that don't have a notetag.
 * If you do this, please set the plugin parameter "Use Default Vehicle" to
 * true and choose a spritesheet in the "Default Vehicle Image" parameter.
 *
 * Important! Default vehicles will take priority over undefined vehicles!
 * So if you turn default vehicles on, a follower without a vehicle notetag
 * will always use the default vehicle.
 *
 * @param General Settings
 *
 * @param Blank Image File
 * @parent General Settings
 * @desc (REQUIRED!) A blank character sprite sheet.
 * @require 1
 * @dir img/characters/
 * @type file
 *
 * @param Use Alt Images
 * @parent General Settings
 * @desc Use different images when the player moves and stands still?
 * @type boolean
 * @on yes
 * @off no
 * @default false
 *
 * @param Use Blank Image
 * @parent General Settings
 * @desc Replace the follower with a blank image if no vehicle is defined?
 * @type boolean
 * @on yes
 * @off no
 * @default false
 *
 * @param Default Vehicles
 *
 * @param Use Default Vehicle
 * @parent Default Vehicles
 * @desc Use a default vehicle image for followers without a notetag?
 * @type boolean
 * @on yes
 * @off no
 * @default false
 *
 * @param Default Vehicle Image
 * @parent Default Vehicles
 * @desc Pick a character spritesheet for the default follower vehicles.
 * @require 1
 * @dir img/characters/
 * @type file
 *
 * @param Default Vehicle Index
 * @parent Default Vehicles
 * @desc The index starts at 0 at the top left.
 * @type number
 * @default 0
 */

 	Arty.FV.parameters = PluginManager.parameters('Arty_FollowerVehicles');
 	if (Arty.FV.parameters["Use Alt Images"] == "true")
 	{
		Arty.FV.useAltImages = true;
 	} else {
 		Arty.FV.useAltImages = false;
	}
	if (Arty.FV.parameters["Use Blank Image"] == "true")
 	{
		Arty.FV.useBlankImage = true;
 	} else {
 		Arty.FV.useBlankImage = false;
	}
	if (Arty.FV.parameters["Use Default Vehicle"] == "true")
 	{
		Arty.FV.useDefaultVehicle = true;
 	} else {
 		Arty.FV.useDefaultVehicle = false;
	}
	Arty.FV.defaultVehicleImage = Arty.FV.parameters["Default Vehicle Image"];
	Arty.FV.defaultVehicleIndex = Arty.FV.parameters["Default Vehicle Index"];

Arty.FV.Game_Actor_setup = Game_Actor.prototype.setup;

Game_Actor.prototype.setup = function (actorId) {
   Arty.FV.Game_Actor_setup.call(this, actorId);
   this.vehicleName = $dataActors[actorId].meta.vehicleName || null;
   this.vehicleIndex = $dataActors[actorId].meta.vehicleIndex || null;
   this.vehicleNameAlt = $dataActors[actorId].meta.vehicleNameAlt || null;
   this.vehicleIndexAlt = $dataActors[actorId].meta.vehicleIndexAlt || null;
};

Game_Player.prototype.updateVehicle = function() {
    if (this.isInVehicle() && !this.areFollowersGathering()) {
        if (this._vehicleGettingOn) {
            this.updateVehicleGetOn();
        } else if (this._vehicleGettingOff) {
            this.updateVehicleGetOff();
        } else {
          this.vehicle().syncWithPlayer();
					if ((Input.isPressed('left') || Input.isPressed('right') || Input.isPressed('up') || Input.isPressed('down')) && Arty.FV.useAltImages)
					{
						for (i = 0; i < this.followers()._data.length; i++)
						{
							if (this.followers()._data[i].actor() == undefined)
							{
								break;
							}
							fName = this.followers()._data[i].actor().vehicleNameAlt;
							fIndex = this.followers()._data[i].actor().vehicleIndexAlt;
							if (fName == undefined)
							{
								if (Arty.FV.useDefaultVehicle)
								{
									this.followers()._data[i].setImage(Arty.FV.defaultVehicleImage, Arty.FV.defaultVehicleIndex);
								} else if (Arty.FV.useBlankImage)
								{
									this.followers()._data[i].setImage("blank",0);
								} else {
									defaultImage = this.followers()._data[i].characterName();
									defaultIndex = this.followers()._data[i].characterIndex();
									this.followers()._data[i].setImage(defaultImage, defaultIndex);
								}
							} else {
								this.followers()._data[i].setImage(fName, fIndex);
							}
						}
					} else {
						for (i = 0; i < this.followers()._data.length; i++)
						{
							if (this.followers()._data[i].actor() == undefined)
							{
								continue;
							}
							fName = this.followers()._data[i].actor().vehicleName;
							fIndex = this.followers()._data[i].actor().vehicleIndex;
							if (fName == undefined)
							{
								if (Arty.FV.useDefaultVehicle)
								{
									this.followers()._data[i].setImage(Arty.FV.defaultVehicleImage, Arty.FV.defaultVehicleIndex);
								} else if (Arty.FV.useBlankImage)
								{
									this.followers()._data[i].setImage("blank",0);
								} else {
									defaultImage = this.followers()._data[i].characterName();
									defaultIndex = this.followers()._data[i].characterIndex();
									this.followers()._data[i].setImage(defaultImage, defaultIndex);
								}
							} else {
								this.followers()._data[i].setImage(fName, fIndex);
							}
						}
					}
        }
    }
};

	Game_Player.prototype.updateVehicleGetOn = function() {
    if (!this.areFollowersGathering() && !this.isMoving()) {
        this.setDirection(this.vehicle().direction());
        this.setMoveSpeed(this.vehicle().moveSpeed());
        this._vehicleGettingOn = false;
		this.setImage("blank",0);
		for (i = 0; i < this.followers()._data.length; i++)
		{
			if (this.followers()._data[i].actor() == undefined)
			{
				continue;
			}
			fName = this.followers()._data[i].actor().vehicleName;
			fIndex = this.followers()._data[i].actor().vehicleIndex;
			if (fName == undefined)
			{
				if (Arty.FV.useDefaultVehicle)
				{
					this.followers()._data[i].setImage(Arty.FV.defaultVehicleImage, Arty.FV.defaultVehicleIndex);
				} else if (Arty.FV.useBlankImage)
				{
					this.followers()._data[i].setImage("blank",0);
				} else {
					defaultImage = this.followers()._data[i].characterName();
					defaultIndex = this.followers()._data[i].characterIndex();
					this.followers()._data[i].setImage(defaultImage, defaultIndex);
				}
			} else {
				this.followers()._data[i].setImage(fName, fIndex);
			}
		}
        if (this.isInAirship()) {
            this.setThrough(true);
        }
        this.vehicle().getOn();
    }
};

Game_Player.prototype.updateVehicleGetOff = function() {
    if (!this.areFollowersGathering() && this.vehicle().isLowest())
		{
        this._vehicleGettingOff = false;
        this._vehicleType = 'walk';
				aLeader = $gameParty.members()[0].actor();
				aImage = aLeader.characterName;
				aIndex = aLeader.characterIndex;
				this.setImage(aImage, aIndex);

				for (i = 0; i < this.followers()._data.length; i++)
				{
					if (this.followers()._data[i].actor() == undefined)
					{
						continue;
					}
					fMember = this.followers()._data[i].actor();
					fImage = fMember.characterName();
					fIndex = fMember.characterIndex();
					this.followers()._data[i].setImage(fImage, fIndex);
				}
    }
};
