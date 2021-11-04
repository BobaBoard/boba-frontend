describe("Home", () => {
  it("should display Realm boards", () => {
    cy.visit("http://localhost:3000/");

    cy.get(".boards-display").contains(/gore/i).should("be.visible");
  });
});

export {};
