<?php

class StandardLoginFormWebclientModule extends AApiModule
{
	protected $aSettingsMap = array(
		'ServerModuleName' => array('StandardLoginFormWebclient', 'string'),
		'HashModuleName' => array('login', 'string'),
		'CustomLoginUrl' => array('', 'string'),
		'CustomLogoUrl' => array('', 'string'),
		'DemoLogin' => array('', 'string'),
		'DemoPassword' => array('', 'string'),
		'InfoText' => array('', 'string'),
		'LoginSignMeType' => array(0, 'int'),
	);

	/**
	 * Initializes Standard Login Form Module.
	 * 
	 * @return array
	 */
	public function init()
	{
		$this->setNonAuthorizedMethods(array('Login'));
	}
	
	/**
	 * Obtains settings of the Standard Login Form Module.
	 * 
	 * @return array
	 */
	public function GetAppData()
	{
		\CApi::checkUserRoleIsAtLeast(\EUserRole::Anonymous);
		
		return array(
			'ServerModuleName' => $this->getConfig('ServerModuleName', ''),
			'HashModuleName' => $this->getConfig('HashModuleName', ''),
			'CustomLoginUrl' => $this->getConfig('CustomLoginUrl', ''),
			'CustomLogoUrl' => $this->getConfig('CustomLogoUrl', ''),
			'DemoLogin' => $this->getConfig('DemoLogin', ''),
			'DemoPassword' => $this->getConfig('DemoPassword', ''),
			'InfoText' => $this->getConfig('InfoText', ''),
			'LoginSignMeType' => $this->getConfig('LoginSignMeType', 0),
		);
	}
	
	/**
	 * Broadcasts Login event to other modules to log in the system with specified parameters.
	 * 
	 * @param string $Login Login for authentication.
	 * @param string $Password Password for authentication.
	 * @param int $SignMe Indicated if keep user authenticated between sessions.
	 * 
	 * @return array
	 * 
	 * @throws \System\Exceptions\AuroraApiException
	 */
	public function Login($Login, $Password, $SignMe = 0)
	{
		\CApi::checkUserRoleIsAtLeast(\EUserRole::Anonymous);
		
		$mResult = false;

		$this->broadcastEvent('Login', array(
			array (
				'Login' => $Login,
				'Password' => $Password,
				'SignMe' => $SignMe
			),
			&$mResult
		));

		if (is_array($mResult))
		{
			$mResult['time'] = $SignMe ? time() + 60 * 60 * 24 * 30 : 0;
			$sAuthToken = \CApi::UserSession()->Set($mResult);
			
			return array(
				'AuthToken' => $sAuthToken
			);
		}
		
		throw new \System\Exceptions\AuroraApiException(\System\Notifications::AuthError);
	}
}
