// import "@testing-library/jest-dom/extend-expect";
// import "jest-canvas-mock";

// import {
//   ensureMocksReset,
//   intersectionObserver,
// } from "@shopify/jest-dom-mocks";

// import crypto from "crypto";
import { server } from "../server-mocks/index";

// jest.mock("next/router", () => {
//   return {
//     __esModule: true,
//     default: vi.fn(),
//     useRouter: vi.fn(),
//   };
// });

// // See: https://www.npmjs.com/package/@shopify/jest-dom-mocks

// Object.defineProperty(window, "matchMedia", {
//   writable: true,
//   value: vi.fn().mockImplementation((query) => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: vi.fn(), // Deprecated
//     removeListener: vi.fn(), // Deprecated
//     addEventListener: vi.fn(),
//     removeEventListener: vi.fn(),
//     dispatchEvent: vi.fn(),
//   })),
// });

// Object.defineProperty(global, "crypto", {
//   value: {
//     getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
//   },
// });

// Object.defineProperty(window, "ResizeObserver", {
//   writable: true,
//   value: vi.fn().mockImplementation(() => ({
//     observe: () => {
//       // do nothing
//     },
//     unobserve: () => {
//       // do nothing
//     },
//     disconnect: () => {
//       // do nothing
//     },
//   })),
// });

// Object.defineProperty(window, "ResizeObserverEntry", {
//   writable: true,
//   value: vi.fn().mockImplementation(() => ({})),
// });

// Object.defineProperty(window, "scroll", {
//   writable: true,
//   value: vi.fn().mockImplementation(() => ({})),
// });

// Object.defineProperty(window, "scrollTo", {
//   writable: true,
//   value: vi.fn().mockImplementation(() => ({})),
// });

// Object.defineProperty(window, "requestIdleCallback", {
//   writable: true,
//   value: vi.fn().mockImplementation((fn) => {
//     fn();
//   }),
// });

// Object.defineProperty(global.Image.prototype, "src", {
//   set() {
//     this.dispatchEvent(new Event("load"));
//   },
// });

// Object.defineProperty(global.Image.prototype, "width", {
//   get() {
//     return 10;
//   },
// });

// Object.defineProperty(global.Image.prototype, "height", {
//   get() {
//     return 10;
//   },
// });

// Object.defineProperty(document, "createRange", {
//   value: () => {
//     const range = new Range();

//     range.getBoundingClientRect = () => {
//       return {
//         x: 0,
//         y: 0,
//         bottom: 0,
//         height: 0,
//         left: 0,
//         right: 0,
//         top: 0,
//         width: 0,
//         toJSON: vi.fn(),
//       };
//     };

//     range.getClientRects = () => {
//       return {
//         item: () => null,
//         length: 0,
//         [Symbol.iterator]: vi.fn(),
//       };
//     };

//     return range;
//   },
// });

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
  // if (intersectionObserver.isMocked()) {
  //   intersectionObserver.restore();
  // }
  // ensureMocksReset();
  // intersectionObserver.mock();
});
