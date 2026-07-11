import path from "node:path";
import { defineConfig } from "vitest/config";

const srcAlias = {
  "@": path.resolve(__dirname, "./src"),
};

export default defineConfig({
  resolve: {
    alias: srcAlias,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
