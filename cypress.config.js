const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl:'https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/'
  },
  env: {
    // validUsername: put the user name here as a string
    // validPassword: put the password here as a string
    // authToken: put Basic token here as a string
  }
});
