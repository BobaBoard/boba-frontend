import { expect, test } from "@jest/globals";

import { getCurrentRealmSlug } from "utils/location-utils";

const updateWindowHostname = (hostname: string) => {
  Object.defineProperty(global.window, "location", {
    value: {
      hostname,
    },
    writable: true,
  });
};

describe("test correct extraction of realm", () => {
  const currentEnv = process.env.NODE_ENV;
  const { window } = global;
  const currentHostname = window.location.hostname;

  afterEach(() => {
    // @ts-expect-error
    process.env.NODE_ENV = currentEnv;
    global.window = window;
    updateWindowHostname(currentHostname);
  });

  test("Returns correct realm from server hostname (prod, with protocol)", () => {
    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    process.env.NODE_ENV = "PRODUCTION";
    expect(
      getCurrentRealmSlug({ serverHostname: "https://v0.boba.social" })
    ).toEqual("v0");
  });

  test("Returns correct realm from server hostname (prod, no protocol)", () => {
    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    process.env.NODE_ENV = "PRODUCTION";
    expect(getCurrentRealmSlug({ serverHostname: "v0.boba.social" })).toEqual(
      "v0"
    );
  });

  test("Returns correct realm from server hostname (prod, internal page)", () => {
    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    process.env.NODE_ENV = "PRODUCTION";
    expect(
      getCurrentRealmSlug({ serverHostname: "https://v0.boba.social/!gore" })
    ).toEqual("v0");
  });

  test("Returns correct realm from client with server hostname (prod, internal page)", () => {
    updateWindowHostname("https://v0.boba.social/!gore");
    expect(
      getCurrentRealmSlug({ serverHostname: "https://v0.boba.social/!gore" })
    ).toEqual("v0");
  });

  test("Returns correct realm from client WITHOUT server hostname (prod, internal page)", () => {
    updateWindowHostname("https://v0.boba.social/!gore");
    expect(getCurrentRealmSlug({ serverHostname: undefined })).toEqual("v0");
  });
});
