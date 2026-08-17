# Desktop E2E (Playwright)

Scenarios for **StandardLoginFormWebclient**. Runner lives at the Aurora install root:

```bash
# from install root
npm run test:e2e-desktop
./modules/CoreWebclient/test/e2e/run.sh

# this module only (Chrome)
npm run test:e2e-desktop -- --setup "StandardLoginFormWebclient Chrome"
```

Shared helpers: `modules/CoreWebclient/test/e2e/helpers/` (`AURORA_E2E_ROOT`).
Domain helpers: `./helpers/` in this folder.

`auth.setup.js` is the Playwright login setup (`StandardLoginFormWebclient setup · Chrome`). Other modules depend on it so they start already logged in. `.auth/*.json` still lives next to the runner (`CoreWebclient/test/e2e/.auth/`).
