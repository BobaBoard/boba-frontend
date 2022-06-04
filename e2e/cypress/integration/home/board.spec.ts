describe("Board", () => {
  before(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
    cy.login(
      "http://twisted-minds_boba.local:3000/!gore",
      Cypress.env("TEST_EMAIL"),
      Cypress.env("TEST_PASSWORD")
    );
    cy.intercept("http://localhost:4200/**", (request) => {
      request.on("response", function (response) {
        expect(response.statusCode).is.lessThan(500); // Test will fail if an 500 error happen
      });
    });
  });

  after(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
  });

  it("should dismiss board notifications", () => {
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Dismiss notifications").click();

    // TODO: actually intercept the call
    cy.wait(2000);
  });

  it("should mute and unmute board", () => {
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Mute").click();

    cy.get(".board-state-icon.muted");

    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Unmute").click();
  });

  it("should unpin and-repin board", () => {
    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 2);

    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Unpin").click();

    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 1);

    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Pin").click();

    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 2);
  });
});

export {};
