# Arty's RMMV Plugins
Here you can find all my released plugins. They have been tested with v1.6.2 of RPG Maker MV and may not work on older versions.

## TERMS
My plugins are free to use for commercial and non-commercial projects, **as long as you give credit**. This "credit" has to include my name (Arty) and the names of the plugins you used.

### Arty_HealOverTime.js
*REQUIRES Yanfly's Buffs and States Core plugin!*

This plugin allows you to set up "healing" states that automatically heal your party members who are affected by the state in an interval that you define. This healing will happen on the map, aka whenever you're not in a battle or in any menu.

In the plugin parameters, you set up a list of your healing states, and for each one define 
- how much it heals every time it gets activated (flat number or percentage of MHP/MMP)
- how many frames pass until the healing happens again
- if the state is removed once the actor is fully healed

There is also an optional functionality to show a popup everytime the healing happens. (Requires Mr. Trivel's popups plugin.)

### Arty_PostBattleCommonEvent.js
This plugin lets you define a Common Event that will be run once the battle is over for every outcome of a battle - defeat, victory, escape/abort. You can also define a common event that runs after every battle, no matter the outcome.

### Arty_RearrangeSkillWindows.js
A small plugin that moves the help window in the Skills scene BELOW the status. I always found the default arrangement awkward.
Should hopefully not clash with other plugins, unless they do a similar thing. Example:
![Example](https://raw.githubusercontent.com/artyrambles/rmmv/master/skillwindowrearrange.png)
