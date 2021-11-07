module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^components(.*)$": "<rootDir>/components$1",
    "^cache(.*)$": "<rootDir>/cache$1",
    "^utils(.*)$": "<rootDir>/utils$1",
    "^contexts(.*)$": "<rootDir>/contexts$1",
  },
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
};
