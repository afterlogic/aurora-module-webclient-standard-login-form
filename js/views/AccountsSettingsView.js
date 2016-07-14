'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	TextUtils = require('modules/CoreClient/js/utils/Text.js'),
	
	Popups = require('modules/CoreClient/js/Popups.js'),
	ConfirmPopup = require('modules/CoreClient/js/popups/ConfirmPopup.js'),
	
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

	this.iUserId = 0; // current user identifier
	this.accounts = ko.observableArray([]); // current user account list
	
	//heading text for account create form
	this.createAccountHeading = ko.computed(function () {
		return this.accounts().length > 0 ? TextUtils.i18n('%MODULENAME%/HEADING_CREATE_NEW_ACCOUNT') : TextUtils.i18n('%MODULENAME%/HEADING_CREATE_FIRST_ACCOUNT');
	}, this);
	
	this.login = ko.observable(''); // new account login
	this.pass = ko.observable(''); // new account password
	this.confirmPass = ko.observable(''); // new account confirm password
	
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
		this.accounts(_.isArray(oResponse.Result) ? oResponse.Result : []);
		if (this.accounts().length === 0)
		{
			this.openCreateAccountForm();
		}
		else
		{
			this.hideCreateAccountForm();
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
	this.iUserId = iEntityId;
};

/**
 * Show popup to confirm deleting of basic account with specified identificator.
 * 
 * @param {number} iId Identificator of basic account that should be deleted.
 * @param {string} sLogin Login of basic account that should be deleted. Uses in confirm popup text.
 */
CAccountsSettingsView.prototype.confirmAccountDeleting = function (iId, sLogin)
{
	Popups.showPopup(ConfirmPopup, [TextUtils.i18n('%MODULENAME%/CONFIRM_DELETE_ACCOUNT'), _.bind(this.deleteAccount, this, iId), sLogin]);
};

/**
 * Sends request to the server to delete specified basic account.
 * 
 * @param {number} iId Identificator of basic account that should be deleted.
 */
CAccountsSettingsView.prototype.deleteAccount = function (iId)
{
	Ajax.send('DeleteAccount', {'AccountId': iId}, function (oResponse) {
		if (oResponse.Result)
		{
			Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_DELETE_ACCOUNT'));
		}
		else
		{
			Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_DELETE_ACCOUNT'));
		}
		this.requestAccounts();
	}, this);
};

/**
 * Displays new account creating form.
 */
CAccountsSettingsView.prototype.openCreateAccountForm = function ()
{
	this.login('');
	this.pass('');
	this.visibleCreateForm(true);
};

/**
 * Validates input data and sends request to the server to create new basic account.
 */
CAccountsSettingsView.prototype.createAccount = function ()
{
	if (this.pass() !== '' && this.pass() === this.confirmPass())
	{
		Ajax.send('CreateUserAccount', {'UserId': this.iUserId, 'Login': this.login(), 'Password': this.pass()}, function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_CREATE_ACCOUNT'));
				this.hideCreateAccountForm();
			}
			else
			{
				Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_CREATE_ACCOUNT'));
			}
			this.requestAccounts();
		}, this);
	}
	else
	{
		Screens.showError(TextUtils.i18n('CORECLIENT/ERROR_PASSWORDS_DO_NOT_MATCH'));
	}
};

/**
 * Hides new account creating form.
 */
CAccountsSettingsView.prototype.hideCreateAccountForm = function ()
{
	this.visibleCreateForm(false);
};

module.exports = new CAccountsSettingsView();
