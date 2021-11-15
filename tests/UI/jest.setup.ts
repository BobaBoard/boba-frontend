import "@testing-library/jest-dom/extend-expect";

import { NextRouter } from "next/router";
import { debug } from "debug";
import { server } from "../server-mocks/index";

const routerInfo = debug("bobatest:router");
const router: NextRouter = {
  asPath: "/!gore",
  basePath: "",
  route: "/[boardId]",
  pathname: "/[boardId]",
  query: {
    boardId: "!gore",
  },
  push: async (...args) => {
    routerInfo("push", args);
    return true;
  },
  prefetch: async () => {
    routerInfo("prefetch");
  },
  replace: async () => {
    routerInfo("replace");
    return true;
  },
  reload: async () => {
    routerInfo("reload");
  },
  back: async () => {
    routerInfo("back");
  },
  beforePopState: async () => {
    routerInfo("beforePopState");
  },
  events: {
    on: () => {
      routerInfo("on");
    },
    off: () => {
      routerInfo("off");
    },
    emit: () => {
      routerInfo("emit");
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

beforeEach(() => {
  server.resetHandlers();
});
