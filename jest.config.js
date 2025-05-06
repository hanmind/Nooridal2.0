const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./nooridal", // Ensure this points to the Next.js project root relative to the workspace root
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/nooridal/jest.setup.js"], // Adjusted path

  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Handle module aliases (explicitly mapped)
    "^@/(.*)$": "<rootDir>/nooridal/src/$1", // Explicitly map the alias relative to workspace root
  },
  moduleDirectories: ["node_modules", "<rootDir>/nooridal/"], // Adjusted path
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/", // Keep ignoring workspace .next if it exists
    "<rootDir>/nooridal/.next/", // Specifically ignore project's .next
  ],
  rootDir: "/Users/yoobmooyeol/project/Nooridal2.0", // Set rootDir explicitly to workspace root
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
