import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  fixturesFolder: 'e2e/cypress/fixtures',
  screenshotsFolder: 'e2e/cypress/screenshots',
  videosFolder: 'e2e/cypress/videos',
  downloadsFolder: 'e2e/cypress/downloads',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./e2e/cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://twisted-minds_boba.local:3000/!gore',
    specPattern: 'e2e/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'e2e/cypress/support/index.ts',
  },
})
