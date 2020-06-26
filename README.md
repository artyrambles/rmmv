# Arty's RMMV Plugins
Here you can find all my released plugins. They have been tested with v1.6.2 of RPG Maker MV and may not work on older versions.

## TERMS
My plugins are free to use for commercial and non-commercial projects, **as long as you give credit**. This "credit" has to be my name (Arty), and some sort of indication that it was my plugins that you used. It's not necessary to state which plugins it was.

**Example of crediting me:** "Plugins - Yancry, VictorSinner, SomeOtherCreator, Arty, SumUniqueDude, ..."

**Another example:** "Heal Over Time, Follower Vehicles, Post Battle Common Events plugins by Arty"

You are not allowed to redistribute my plugins or upload modified versions of them without asking me for permission FIRST.

### Arty_HealOverTime.js
*REQUIRES Yanfly's Buffs and States Core plugin!*

This plugin allows you to set up "healing" states that automatically heal your party members who are affected by the state in an interval that you define. This healing will happen on the map, aka whenever you're not in a battle or in any menu.

In the plugin parameters, you set up a list of your healing states, and for each one define 
- how much it heals every time it gets activated (flat number or percentage of MHP/MMP)
- how many frames pass until the healing happens again
- if the state is removed once the actor is fully healed

There is also an optional functionality to show a popup everytime the healing happens. (Requires Mr. Trivel's popups plugin.)

### Arty_FollowerVehicles.js
![FollowerVehicles Header](https://raw.githubusercontent.com/artyrambles/rmmv/master/Screenshots/followervehicles.JPG)

This plugin allows you to define vehicle graphics for your followers! Whenever your player uses a vehicle, your followers will now also use their own - or "disappear", or use a default vehicle graphic you set up. 

It's really easy to set up - just define a "blank" image in the plugin parameters, and then give your actors simple notetags.

![FollowerVehicles Setup](https://raw.githubusercontent.com/artyrambles/rmmv/master/Screenshots/followervehicles_setup.JPG)

There's a few settings in the plugin parameters to customize how you want it to work. For example, you can disable "blank" graphics to make the followers without a notetag remain the same, or you can enable "alt" graphics that will allow you to add alternative graphics to your follower vehicle. These alternative graphics will be displayed whenever the player is moving, and the "normal" graphics will be displayed when the player is standing still.

![FollowerVehicles Plugin Params](https://raw.githubusercontent.com/artyrambles/rmmv/master/Screenshots/followervehicles_pluginparams.JPG)

Right now, this plugin only allows you to define one normal and one alt graphic for your followers, so it doesn't take into account different player vehicles. I recommend using it with VictorSaint's *Custom Vehicles* plugin, but it's not required.

### Arty_RearrangeSkillWindows.js
A small plugin that moves the help window in the Skills scene BELOW the status. I always found the default arrangement awkward.
Should hopefully not clash with other plugins, unless they do a similar thing. Example:

![Example](https://raw.githubusercontent.com/artyrambles/rmmv/master/Screenshots/skillwindowrearrange.png)

### Arty_PostBattleCommonEvent.js
This plugin lets you define a Common Event that will be run once the battle is over for every outcome of a battle - defeat, victory, escape/abort. You can also define a common event that runs after every battle, no matter the outcome.
