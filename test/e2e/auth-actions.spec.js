const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const {
  gotoLoggedIn,
  loginAs,
  step,
  attachScreenshot,
  fieldControl,
  waitForTurnstileToken,
  hasCredentials,
  getTestCredentials,
} = sharedHelper('login')
const { clickReady } = sharedHelper('ready')
const { logoutToLoginForm } = moduleHelper('SettingsWebclient', 'settings')

test.describe('Desktop auth', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_0/E2E_PASSWORD_0 (or E2E_LOGIN/E2E_PASSWORD) in .env.e2e')

  test('rejects invalid password and stays on login', async ({ page }) => {
    test.setTimeout(T(120000))
    const { login } = getTestCredentials()

    await step('Open login page', async () => {
      await page.context().clearCookies()
      await page.goto('', { waitUntil: 'domcontentloaded' })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: T(30000),
      })
      await waitForTurnstileToken(page)
    })

    await step('Submit wrong password', async () => {
      await fieldControl(page, 'login-email').fill(login)
      await fieldControl(page, 'login-password').fill(
        `wrong-password-${Date.now()}`
      )
      await waitForTurnstileToken(page)
      await expect(page.getByTestId('login-submit')).toBeEnabled({
        timeout: T(10000),
      })
      await clickReady(page.getByTestId('login-submit'))
    })

    await step('Stay on login form', async () => {
      await expect(page.getByTestId('header-tabs')).not.toBeVisible({
        timeout: T(15000),
      })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: T(15000),
      })
      await attachScreenshot(page, 'auth-invalid-01')
    })
  })

  test('opens forgot-password form and returns to login', async ({ page }) => {
    test.setTimeout(T(120000))

    await step('Open login page', async () => {
      await page.context().clearCookies()
      await page.goto('', { waitUntil: 'domcontentloaded' })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: T(30000),
      })
    })

    const forgot = page.getByTestId('login-forgot-password')
    test.skip(
      (await forgot.count()) === 0,
      'Forgot password not available (StandardResetPassword disabled)'
    )

    await step('Open reset password', async () => {
      await clickReady(forgot)
      await expect(page.getByTestId('reset-password-page')).toBeVisible({
        timeout: T(30000),
      })
      await expect(page.getByTestId('reset-password-email')).toBeVisible({
        timeout: T(15000),
      })
      await expect(page.getByTestId('reset-password-continue')).toBeVisible()
      await expect(page.getByTestId('reset-password-back')).toBeVisible()
      console.log('  → Reset password step 1 open')
      await attachScreenshot(page, 'auth-reset-01')
    })

    await step('Back to login without sending recovery', async () => {
      await clickReady(page.getByTestId('reset-password-back'))
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: T(30000),
      })
      await expect(page.getByTestId('reset-password-page')).toBeHidden({
        timeout: T(15000),
      })
      console.log('  → Back on login')
      await attachScreenshot(page, 'auth-reset-02-login')
    })
  })

  test('logout then login again', async ({ page }) => {
    test.setTimeout(T(180000))

    await gotoLoggedIn(page)
    await logoutToLoginForm(page)
    await attachScreenshot(page, 'auth-relogin-01-logged-out')

    await step('Login again with same credentials', async () => {
      const credentials = getTestCredentials()
      console.log(`  → Re-login as ${credentials.login}`)
      await loginAs(page, credentials)
      await expect(page.getByTestId('mail-message-list')).toBeVisible({
        timeout: T(60000),
      })
      console.log('  → Re-login success')
      await attachScreenshot(page, 'auth-relogin-02-shell')
    })
  })
})
