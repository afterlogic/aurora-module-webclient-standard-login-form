'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	TextUtils = require('modules/CoreClient/js/utils/Text.js'),
	
	Popups = require('modules/CoreClient/js/Popups.js'),
	ConfirmPopup = require('modules/CoreClient/js/popups/ConfirmPopup.js'),
	
	Api = require('modules/CoreClient/js/Api.js'),
	App = require('modules/CoreClient/js/App.js'),
	ModulesManager = require('modules/CoreClient/js/ModulesManager.js'),
	Screens = require('modules/CoreClient/js/Screens.js'),
	CAbstractSettingsFormView = ModulesManager.run('SettingsClient', 'getAbstractSettingsFormViewClass'),
	
	Settings = require('modules/CoreClient/js/Settings.js'),
	
	Ajax = require('modules/%ModuleName%/js/Ajax.js')
;

/**
* @constructor for object that is binded to screen with basic account list 
* and ability to create new basic account for specified user 
*/
function CAccountsSettingsView()
{
	CAbstractSettingsFormView.call(this, Settings.ServerModuleName);

	this.sFakePass = 'xxxxxxxx'; // fake password uses to display something in password input while account editing
	
	this.iUserId = App.getUserId(); // current user identifier
	
	this.accounts = ko.observableArray([]); // current user account list
	this.currentAccountId = ko.observable(0); // current account identifier
	
	//heading text for account create form
	this.createAccountHeading = ko.computed(function () {
		if (this.accounts().length === 0)
		{
			return TextUtils.i18n('%MODULENAME%/HEADING_CREATE_FIRST_ACCOUNT');
		}
		if (this.currentAccountId() === 0)
		{
			return TextUtils.i18n('%MODULENAME%/HEADING_CREATE_NEW_ACCOUNT');
		}
		return TextUtils.i18n('%MODULENAME%/HEADING_EDIT_NEW_ACCOUNT');
	}, this);
	
	//text for update/create button
	this.updateButtonText = ko.computed(function () {
		return (this.currentAccountId() === 0) ? TextUtils.i18n('%MODULENAME%/ACTION_CREATE') : TextUtils.i18n('%MODULENAME%/ACTION_UPDATE');
	}, this);
	this.updateProgressButtonText = ko.computed(function () {
		return (this.currentAccountId() === 0) ? TextUtils.i18n('%MODULENAME%/ACTION_CREATE_IN_PROGRESS') : TextUtils.i18n('%MODULENAME%/ACTION_UPDATE_IN_PROGRESS');
	}, this);
	
	this.login = ko.observable(''); // new account login
	this.loginFocus = ko.observable(false);
	this.pass = ko.observable(''); // new account password
	this.passFocus = ko.observable(false);
	
	this.visibleCreateForm = ko.observable(false);
	this.isCreating = ko.observable(false);
}

_.extendOwn(CAccountsSettingsView.prototype, CAbstractSettingsFormView.prototype);

CAccountsSettingsView.prototype.ViewTemplate = '%ModuleName%_AccountsSettingsView';

/**
 * Runs after routing to this view.
 */
CAccountsSettingsView.prototype.onRoute = function ()
{
	this.requestAccounts();
};

/**
 * Requests basic accounts for current user.
 */
CAccountsSettingsView.prototype.requestAccounts = function ()
{
	Ajax.send('GetUserAccounts', {'UserId': this.iUserId}, function (oResponse) {
		if (_.isArray(oResponse.Result))
		{
			this.accounts(oResponse.Result);
		}
		else
		{
			Api.showErrorByCode(oResponse);
			this.accounts([]);
		}
		
		if (this.accounts().length === 0)
		{
			this.openEditAccountForm(0);
		}
		else
		{
			this.openEditAccountForm(this.accounts()[0].id);
		}
	}, this);
};

/**
 * Sets access level for the view via entity type and entity identificator.
 * This view is visible only for entity type 'User'.
 * 
 * @param {string} sEntityType Current entity type.
 * @param {number} iEntityId Indentificator of current intity.
 */
CAccountsSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
{
	this.visible(sEntityType === 'User');
	if (this.iUserId !== iEntityId)
	{
		this.accounts([]);
		this.hideEditAccountForm();
		this.iUserId = iEntityId || -1;
	}
};

/**
 * Show popup to confirm deleting of basic account with specified identificator.
 * 
 * @param {number} iAccountId Identificator of basic account that should be deleted.
 * @param {string} sLogin Login of basic account that should be deleted. Uses in confirm popup text.
 */
CAccountsSettingsView.prototype.confirmAccountDeleting = function (iAccountId, sLogin)
{
	Popups.showPopup(ConfirmPopup, [TextUtils.i18n('%MODULENAME%/CONFIRM_DELETE_ACCOUNT'), _.bind(this.deleteAccount, this, iAccountId), sLogin]);
};

/**
 * Sends request to the server to delete specified basic account.
 * 
 * @param {number} iAccountId Identificator of basic account that should be deleted.
 * @param {boolean} bDelete Indicates if administrator confirmed account deleting or not.
 */
CAccountsSettingsView.prototype.deleteAccount = function (iAccountId, bDelete)
{
	if (bDelete)
	{
		Ajax.send('DeleteAccount', {'AccountId': iAccountId}, function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_DELETE_ACCOUNT'));
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_DELETE_ACCOUNT'));
			}
			this.requestAccounts();
		}, this);
	}
};

/**
 * Displays edit account form.
 * 
 * @param {number} iAccountId Identificator of basic account that should be deleted.
 */
CAccountsSettingsView.prototype.openEditAccountForm = function (iAccountId)
{
	var oAccount = _.find(this.accounts(), function (oAccount) {
		return oAccount.id === iAccountId;
	});
	
	if (oAccount)
	{
		this.currentAccountId(iAccountId);
		this.login(oAccount.login);
		this.pass(this.sFakePass);
		this.passFocus(true);
	}
	else
	{
		this.currentAccountId(0);
		this.login('');
		this.loginFocus(true);
		this.pass('');
	}
	
	this.visibleCreateForm(true);
};

/**
 * Validates input data and sends request to the server to create new basic account or update existing basic account.
 */
CAccountsSettingsView.prototype.saveAccount = function ()
{
	if (this.login() === '')
	{
		this.loginFocus(true);
	}
	else if (this.pass() === '' || this.pass() === this.sFakePass)
	{
		this.passFocus(true);
	}
	else if (this.currentAccountId() === 0)
	{
		Ajax.send('CreateUserAccount', {'UserId': this.iUserId, 'Login': this.login(), 'Password': this.pass()}, function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_CREATE_ACCOUNT'));
				this.hideEditAccountForm();
				this.requestAccounts();
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_CREATE_ACCOUNT'));
			}
		}, this);
	}
	else
	{
		Ajax.send('UpdateAccount', {'AccountId': this.currentAccountId(), 'Password': this.pass()}, function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_UPDATE_ACCOUNT'));
				this.hideEditAccountForm();
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_UPDATE_ACCOUNT'));
			}
			this.requestAccounts();
		}, this);
	}
};

/**
 * Hides edit account form.
 */
CAccountsSettingsView.prototype.hideEditAccountForm = function ()
{
	this.currentAccountId(0);
	this.visibleCreateForm(false);
};

module.exports = new CAccountsSettingsView();
