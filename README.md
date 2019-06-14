# Arty's RMMV Plugins
Here you can find all my released plugins. They have been tested with v1.6.2 of RPG Maker MV and may not work on older versions.

### Arty_HealOverTime.js
*REQUIRES Yanfly's Buffs and States Core plugin!*

This plugin allows you to set up "healing" states that automatically heal your party members who are affected by the state in an interval that you define. This healing will happen on the map, aka whenever you're not in a battle or in any menu.

In the plugin parameters, you set up a list of your healing states, and for each one define 
- how much it heals every time it gets activated (flat number or percentage of MHP)
- how many frames pass until the healing happens again
- if the state is removed once the actor is fully healed

There is also an optional functionality to show a popup everytime the healing happens. (Requires Mr. Trivel's popups plugin.)
