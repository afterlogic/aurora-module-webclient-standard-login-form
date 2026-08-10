const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const { loginAsTestUser, step, hasCredentials } = sharedHelper('login')
const { isTraditional } = sharedHelper('app-variant')


test.describe('Desktop login', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_0/E2E_PASSWORD_0 (or E2E_LOGIN/E2E_PASSWORD) in .env.e2e')

  test('user can log in', async ({ page }) => {
    test.setTimeout(T(120000))
    await loginAsTestUser(page)

    await step('Confirm login form is gone and mail nav is visible', async () => {
      await expect(page.getByTestId('login-email')).not.toBeVisible()
      // Legacy always shows nav-mail; the next SPA omits it when mail is
      // already the active/default view (see helpers/login.js for the same rule).
      if (isTraditional()) {
        await expect(page.getByTestId('nav-mail')).toBeVisible()
      }
      await expect(page.getByTestId('mail-message-list')).toBeVisible({
        timeout: T(60000),
      })
    })
  })
})
