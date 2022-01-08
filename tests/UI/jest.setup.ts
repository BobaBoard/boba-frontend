import "@testing-library/jest-dom/extend-expect";
import "jest-canvas-mock";

import { ensureMocksReset } from "@shopify/jest-dom-mocks";
import { server } from "../server-mocks/index";

jest.mock("next/router", () => {
  return {
    __esModule: true,
    default: jest.fn(),
    useRouter: jest.fn(),
  };
});

// See: https://www.npmjs.com/package/@shopify/jest-dom-mocks

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

Object.defineProperty(window, "scroll", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({})),
});

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: jest.fn().mockImplementation((fn) => {
    fn();
  }),
});

Object.defineProperty(global.Image.prototype, "src", {
  set() {
    this.dispatchEvent(new Event("load"));
  },
});

Object.defineProperty(global.Image.prototype, "width", {
  get() {
    return 10;
  },
});

Object.defineProperty(global.Image.prototype, "height", {
  get() {
    return 10;
  },
});

Object.defineProperty(document, "createRange", {
  value: () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: jest.fn(),
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  },
});

beforeAll(() =>
  server.listen({
    onUnhandledRequest: ({ method, url }) => {
      console.log("*********************");
      console.log("*********************");
      console.log("*********************");
      console.log(`Unhandled request: ${method} => ${url}`);
      console.log("*********************");
      console.log("*********************");
      console.log("*********************");
    },
  })
);
afterAll(() => server.close());

beforeEach(() => {
  server.resetHandlers();
  ensureMocksReset();
});
