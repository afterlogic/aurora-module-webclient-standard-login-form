'use strict';

var
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

module.exports = {
	ServerModuleName: '%ModuleName%',
	HashModuleName: 'login',
	
	CustomLoginUrl: '',
	CustomLogoUrl: '',
	DemoLogin: '',
	DemoPassword: '',
	InfoText: '',
	LoginSignMeType: Enums.LoginSignMeType.DefaultOff, // 0 - off, 1 - on, 2 - don't use
	
	/**
	 * Initializes settings from AppData section.
	 * 
	 * @param {Object} oAppDataSection contains module settings from server.
	 */
	init: function (oAppDataSection) {
		if (oAppDataSection)
		{
			this.ServerModuleName = Types.pString(oAppDataSection.ServerModuleName);
			this.HashModuleName = Types.pString(oAppDataSection.HashModuleName);
			
			this.CustomLoginUrl = Types.pString(oAppDataSection.CustomLoginUrl);
			this.CustomLogoUrl = Types.pString(oAppDataSection.CustomLogoUrl);
			this.DemoLogin = Types.pString(oAppDataSection.DemoLogin);
			this.DemoPassword = Types.pString(oAppDataSection.DemoPassword);
			this.InfoText = Types.pString(oAppDataSection.InfoText);
			this.LoginSignMeType = Types.pInt(oAppDataSection.LoginSignMeType);
		}
	}
};