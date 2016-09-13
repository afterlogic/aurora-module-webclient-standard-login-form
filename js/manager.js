'use strict';


module.exports = function (oAppData, iUserRole, bPublic) {
	require('modules/%ModuleName%/js/enums.js');
	require('jquery.cookie');

	var
		_ = require('underscore'),
		
		Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
		
		Settings = require('modules/%ModuleName%/js/Settings.js'),
		oSettings = _.extend({}, oAppData[Settings.ServerModuleName] || {}, oAppData['%ModuleName%'] || {}),
		
		bAnonimUser = iUserRole === Enums.UserRole.Anonymous
	;
	
	Settings.init(oSettings);
	
	if (!bPublic && bAnonimUser)
	{
		return {
			/**
			 * Returns login view screen.
			 */
			getScreens: function () {
				var oScreens = {};
				oScreens[Settings.HashModuleName] = function () {
					return require('modules/%ModuleName%/js/views/LoginView.js');
				};
				return oScreens;
			},
			
			/**
			 * Redirect to custom login url if specified.
			 */
			beforeAppRunning: function () {
				if (Types.isNonEmptyString(Settings.CustomLoginUrl))
				{
					window.location.href = Settings.CustomLoginUrl;
				}
			}
		};
	}
};
