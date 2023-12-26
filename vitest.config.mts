import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

process.env.TZ = "UTC";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ["styled-jsx/babel"],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./tests/UI/vitest.setup.ts")],
    server: {
      deps: {
        inline: ["@bobaboard", "vitest-canvas-mock"],
      },
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: true,
  },
  optimizeDeps: {
    exclude: ["/@bobaboard/ui-components"],
  },
  resolve: {
    // dedupe: ["react", "react-dom"],
    // mainFields: ["module", "main"], //this is needed to work
    // preserveSymlinks: true,
  },
});

// module.exports = {
//   testEnvironment: "jsdom",
//   transform: {
//     "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
//   },
//   collectCoverageFrom: [
//     "**/*.{js,jsx,ts,tsx}",
//     "!**/*.d.ts",
//     "!**/node_modules/**",
//   ],
//   moduleNameMapper: {
//     "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
//     "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
//     "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
//       "<rootDir>/__mocks__/fileMock.js",
//     "^components(.*)$": "<rootDir>/src/components$1",
//     "^cache(.*)$": "<rootDir>/src/cache$1",
//     "^utils(.*)$": "<rootDir>/src/utils$1",
//     "^contexts(.*)$": "<rootDir>/src/contexts$1",
//     "^types(.*)$": "<rootDir>/types$1",
//     "^pages(.*)$": "<rootDir>/src/pages$1",
//     "^queries(.*)$": "<rootDir>/src/queries$1",
//     "^lib(.*)$": "<rootDir>/src/lib$1",
//     "^react$": "<rootDir>/node_modules/react",
//     "^react-dom$": "<rootDir>/node_modules/react-dom",
//   },
//   testPathIgnorePatterns: [
//     "<rootDir>/node_modules/",
//     "<rootDir>/.next/",
//     "<rootDir>/tests/e2e",
//   ],
//   transformIgnorePatterns: [
//     "/node_modules/(?!uuid|@firebase)",
//     "^.+\\.module\\.(css|sass|scss)$",
//   ],
//   setupFilesAfterEnv: ["jest-extended/all", "<rootDir>/tests/UI/jest.setup.ts"],
//   testTimeout: 10000,
// };
