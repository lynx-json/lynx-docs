var tests = [{
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    parameters: {
      "spec.hints": ["whatever", "submit"],
      "spec.visibility": "visible",
      action: "."
    },
    expected: {
      spec: {
        hints: ["whatever", "submit"],
        visibility: "visible"
      },
      value: { action: "." }
    }
  },
  {
    description: "when spec.hints",
    should: "override default hints",
    parameters: {
      "spec.hints": ["whatever"],
      value: { action: "." }
    },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: { action: "." }
    }
  },
  {
    description: "when fully specified spec object",
    should: "use provided spec object. Don't default hints",
    parameters: {
      spec: {
        hints: ["submit"],
        visibility: "visible"
      },
      value: { action: "." }
    },
    expected: {
      spec: {
        hints: ["submit"],
        visibility: "visible"
      },
      value: { action: "." }
    }
  }
];

tests.partial = "submit";

module.exports = tests;
