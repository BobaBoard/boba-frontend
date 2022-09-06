const GORE_BOARD_ID = "c6d3d10e-8e49-4d73-b28a-9d652b41beec";
const interceptPin = ({ boardId }: { boardId: string }) => {
  const alias = `pinBoard_${boardId}`;
  cy.intercept("POST", `http://localhost:4200/boards/${boardId}/pin`).as(alias);
  return `@${alias}`;
};
const interceptUnpin = ({ boardId }: { boardId: string }) => {
  const alias = `unpinBoard_${boardId}`;
  cy.intercept("DELETE", `http://localhost:4200/boards/${boardId}/pin`).as(
    alias
  );
  return `@${alias}`;
};
const interceptMute = ({ boardId }: { boardId: string }) => {
  const alias = `muteBoard_${boardId}`;
  cy.intercept("POST", `http://localhost:4200/boards/${boardId}/mute`).as(
    alias
  );
  return `@${alias}`;
};
const interceptUnmute = ({ boardId }: { boardId: string }) => {
  const alias = `unmuteBoard_${boardId}`;
  cy.intercept("DELETE", `http://localhost:4200/boards/${boardId}/mute`).as(
    alias
  );
  return `@${alias}`;
};

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
    // Ensure gore board is muted and pinned as that is the test baseline
    // cy.request(
    //   "POST",
    //   `http://localhost:4200/boards/${GORE_BOARD_ID}/pin`
    // );
    // cy.request(
    //   "DELETE",
    //   `http://localhost:4200/boards/${GORE_BOARD_ID}/mute`
    // );
    // cy.wait(`@${interceptPin({ boardId: GORE_BOARD_ID })}`);
    // cy.wait(`@${interceptUnmute({ boardId: GORE_BOARD_ID })}`);
  });

  after(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
  });

  it("should dismiss board notifications", () => {
    cy.intercept(
      "DELETE",
      "http://localhost:4200/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/notifications"
    ).as("dismissNotifications");
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Dismiss notifications").click();

    cy.wait("@dismissNotifications");
  });

  it("should mute and unmute board", () => {
    const muteKey = interceptMute({ boardId: GORE_BOARD_ID });
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Mute").click();

    cy.wait(muteKey);
    cy.get(".board-details .muted-icon");

    const unmuteKey = interceptUnmute({ boardId: GORE_BOARD_ID });
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Unmute").click();
    cy.wait(unmuteKey);
    cy.get(".board-details .muted-icon").should("not.exist");
  });

  it("should unpin and-repin board", () => {
    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 2);

    const unpinKey = interceptUnpin({ boardId: GORE_BOARD_ID });
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Unpin").click();
    cy.wait(unpinKey);

    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 1);

    const pinKey = interceptPin({ boardId: GORE_BOARD_ID });
    cy.get(".preview-options button").click();
    cy.get(".popover-content").contains("Pin").click();

    cy.get(".pinned-boards section:nth-child(2)")
      .find(".pinned-item")
      .should("have.length", 2);
    cy.wait(pinKey);
  });
});

export {};
