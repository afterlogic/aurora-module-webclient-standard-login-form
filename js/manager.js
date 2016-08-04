'use strict';


module.exports = function (oAppData, iUserRole, bPublic) {
	require('modules/%ModuleName%/js/enums.js');
	require('jquery.cookie');

	var
		_ = require('underscore'),
		$ = require('jquery'),
		
		TextUtils = require('modules/CoreClient/js/utils/Text.js'),
		Types = require('modules/CoreClient/js/utils/Types.js'),
		
		Ajax = require('modules/%ModuleName%/js/Ajax.js'),
		Settings = require('modules/%ModuleName%/js/Settings.js'),
		oSettings = _.extend({}, oAppData[Settings.ServerModuleName] || {}, oAppData['%ModuleName%'] || {}),
		
		bAnonimUser = iUserRole === Enums.UserRole.Anonymous,
		bAdminUser = iUserRole === Enums.UserRole.SuperAdmin,
		bPowerUser = iUserRole === Enums.UserRole.PowerUser
	;
	
	Settings.init(oSettings);
	
	return {
		isAvailable: function (iUserRole, bPublic) {
			return !bPublic;
		},
		/**
		 * Runs after app initializing. Adds basic accounts tab to admin panel.
		 * 
		 * @param {Object} ModulesManager Modules manager object.
		 */
		start: function (ModulesManager) {
			if (bAdminUser)
			{
				ModulesManager.run('AdminPanelClient', 'registerAdminPanelTab', [
					function () { return require('modules/%ModuleName%/js/views/AccountsSettingsView.js'); },
					Settings.HashModuleName + '-accounts',
					TextUtils.i18n('%MODULENAME%/LABEL_BASIC_ACCOUNTS_TAB'),
					[Enums.SettingsTabCapability.ManageAuthAccounts]
				]);
			}
			if (bPowerUser)
			{
				ModulesManager.run('SettingsClient', 'registerSettingsTab', [
					function () { return require('modules/%ModuleName%/js/views/AccountsSettingsView.js'); },
					Settings.HashModuleName + '-accounts',
					TextUtils.i18n('%MODULENAME%/LABEL_BASIC_ACCOUNTS_TAB'),
					[Enums.SettingsTabCapability.ManageAuthAccounts]
				]);
			}
		},
		getScreens: function () {
			var oScreens = {};
			if (bAnonimUser)
			{
				oScreens[Settings.HashModuleName] = function () {
					return require('modules/%ModuleName%/js/views/WrapLoginView.js');
				};
			}
			return oScreens;
		},
		logout: function (iLastErrorCode, fOnLogoutResponse, oContext)
		{
			Ajax.send('Logout', iLastErrorCode ? {'LastErrorCode': iLastErrorCode} : null, fOnLogoutResponse, oContext);
			
			$.removeCookie('AuthToken');
		},
		beforeAppRunning: function (bAuth) {
			if (!bAuth && Types.isNonEmptyString(Settings.CustomLoginUrl))
			{
				window.location.href = Settings.CustomLoginUrl;
			}
		}
	};
};
