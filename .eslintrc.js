module.exports = {
  extends: "next/core-web-vitals",
  env: {
    es6: true
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "no-console": "error",
    "import/extensions": "off",
    "no-underscore-dangle": "off",
    "react/no-find-dom-node": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "import/no-unresolved": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/destructuring-assignment": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "react/no-array-index-key": "off",
    "react/button-has-type": "off",
    "react/forbid-prop-types": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "linebreak-style": "error",
    "react/jsx-curly-spacing": ["warn", "never"],
    "jsx-a11y/anchor-is-valid": "off",
    "react/jsx-props-no-spreading": "off",
    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-curly-newline": "off",
    "prefer-arrow-callback": ["error"],
    "func-style": ["error", "expression", { allowArrowFunctions: true }],
    "no-undef": "error",
    "@next/next/no-img-element": "off"
  }
};
