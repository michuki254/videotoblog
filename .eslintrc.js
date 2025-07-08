module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Allow unused variables (for existing code)
    "@typescript-eslint/no-unused-vars": "warn",
    // Allow unescaped entities in JSX (for existing code)
    "react/no-unescaped-entities": "warn",
    // Allow any type (for existing code that needs gradual migration)
    "@typescript-eslint/no-explicit-any": "warn",
    // Allow prefer-const issues (for existing code)
    "prefer-const": "warn",
    // Allow img elements (for existing code)
    "@next/next/no-img-element": "warn"
  }
}; 