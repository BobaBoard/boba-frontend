import "@testing-library/jest-dom/extend-expect";

import { NextRouter } from "next/router";
import { server } from "../server-mocks/index";

const router: NextRouter = {
  asPath: "/!gore",
  basePath: "",
  route: "/[boardId]",
  pathname: "/[boardId]",
  query: {
    boardId: "!gore",
  },
  push: async (...args) => {
    console.log("push", args);
    return true;
  },
  prefetch: async () => {
    console.log("prefetch");
  },
  replace: async () => {
    console.log("replace");
    return true;
  },
  reload: async () => {
    console.log("reload");
  },
  back: async () => {
    console.log("back");
  },
  beforePopState: async () => {
    console.log("beforePopState");
  },
  events: {
    on: () => {
      console.log("on");
    },
    off: () => {
      console.log("off");
    },
    emit: () => {
      console.log("emit");
    },
  },
  isFallback: false,
};

jest.mock("next/router", () => ({
  __esModule: true,
  default: router,
  useRouter: () => router,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: () => {
      // do nothing
    },
    unobserve: () => {
      // do nothing
    },
    disconnect: () => {
      // do nothing
    },
  })),
});

Object.defineProperty(window, "ResizeObserverEntry", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({})),
});

beforeAll(() =>
  server.listen({
    onUnhandledRequest: ({ method, url }) => {
      console.log(`Unhandled request: ${method} => ${url}`);
      //  server.printHandlers();
    },
  })
);
afterAll(() => server.close());
