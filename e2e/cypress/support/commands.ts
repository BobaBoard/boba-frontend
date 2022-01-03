// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// cypress/support/index.ts
Cypress.Commands.add("login", (page, email, password) => {
  cy.visit(page);
  cy.get(".layout-body [aria-label=login]").click();
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.get(".ReactModalPortal :nth-child(2) > .button > button").click();
  cy.get(".layout-body [aria-label='User menu'] img[src*='bobatan']");
});

export {};
