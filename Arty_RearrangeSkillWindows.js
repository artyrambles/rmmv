//=============================================================================
// Arty's Plugins - Rearrange Skill Window
// Arty_RearrangeSkillWindow.js
// Version 1.0
//=============================================================================

var Imported = Imported || {};
Imported.Arty_RearrangeSkillWindows = true;

var Arty = Arty || {};
Arty.RSW = Arty.RSW || {};

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.0) Changes the positions of the windows in the Skill menu.
 *
 * @author Arty
 *
 * @help
 *   Arty's Plugins: Rearrange Skill Windows
 *----------------------------------------
 *
 * This moves the help window below the status window in the Skills scene.
 *
 * LICENSE: Free to use in non-commercial and commercial project. 
 * Please credit "Arty".
 *
 */

Scene_Skill.prototype.createSkillTypeWindow = function() {
    var wy = 0;
    this._skillTypeWindow = new Window_SkillType(0, wy);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
    this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
};

Scene_Skill.prototype.createStatusWindow = function() {
    var wx = this._skillTypeWindow.width;
    var wy = 0;
    var ww = Graphics.boxWidth - wx;
    var wh = this._skillTypeWindow.height;
    this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
    this._statusWindow.reserveFaceImages();
    this.addWindow(this._statusWindow);
};

Scene_Skill.prototype.createItemWindow = function() {
    var wx = 0;
    var wy = this._skillTypeWindow.height + this._helpWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_SkillList(wx, wy, ww, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._skillTypeWindow.setSkillWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

Arty.RSW.Scene_Skill_create = Scene_Skill.prototype.create;
Scene_Skill.prototype.create = function() {
    Arty.RSW.Scene_Skill_create.call(this);
    this._helpWindow.y = this._skillTypeWindow.height;
};
