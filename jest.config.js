process.env.TZ = "UTC";

module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^components(.*)$": "<rootDir>/components$1",
    "^cache(.*)$": "<rootDir>/cache$1",
    "^utils(.*)$": "<rootDir>/utils$1",
    "^contexts(.*)$": "<rootDir>/contexts$1",
    "^types(.*)$": "<rootDir>/types$1",
    "^pages(.*)$": "<rootDir>/pages$1",
    "^queries(.*)$": "<rootDir>/queries$1",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!uuid)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  setupFilesAfterEnv: ["jest-extended/all", "<rootDir>/tests/UI/jest.setup.ts"],
};
