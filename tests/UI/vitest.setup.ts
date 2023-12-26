import matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import "vitest-canvas-mock";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);
import { server } from "../server-mocks/index";

vi.mock("next/router", () => {
  return {
    __esModule: true,
    default: vi.fn(),
    useRouter: vi.fn(),
  };
});

const MockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
vi.stubGlobal(`matchMedia`, MockMatchMedia);

const MockIntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal(`IntersectionObserver`, MockIntersectionObserver);

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
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
  value: vi.fn().mockImplementation(() => ({})),
});

Object.defineProperty(window, "scroll", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({})),
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({})),
});

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: vi.fn().mockImplementation((fn) => {
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
  writable: true,
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
        toJSON: vi.fn(),
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: vi.fn(),
      };
    };

    return range;
  },
});

beforeAll(() => {
  server.events.on("request:unhandled", ({ request }) => {
    console.log("*********************");
    console.log("*********************");
    console.log("*********************");
    console.log(`Unhandled request: ${request.method} => ${request.url}`);
    console.log("*********************");
    console.log("*********************");
    console.log("*********************");
  });
  server.listen();
});
afterAll(() => server.close());

beforeEach(() => {
  server.resetHandlers();
  cleanup();
});
