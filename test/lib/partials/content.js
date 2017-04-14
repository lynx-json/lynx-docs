var tests = [{
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    parameters: {
      "spec.hints": ["whatever", "content"],
      "spec.visibility": "visible",
      "spec.input": true,
      value: ["one", "two"]
    },
    expected: {
      spec: {
        hints: ["whatever", "content"],
        visibility: "visible",
        "input": true
      },
      value: ["one", "two"]
    }
  },
  {
    description: "when spec.hints",
    should: "override default hints",
    parameters: {
      "spec.hints": ["whatever"],
      value: ["one", "two"]
    },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: ["one", "two"]
    }
  },
  {
    description: "when fully specified spec object",
    should: "use provided spec object. Don't default hints",
    parameters: {
      spec: {
        hints: ["whatever"],
        visibility: "visible",
        "input": true
      },
      value: ["one", "two"]
    },
    expected: {
      spec: {
        hints: ["whatever"],
        visibility: "visible",
        "input": true
      },
      value: ["one", "two"]
    }
  },
  {
    description: "when flattened value",
    should: "copy to 'value' key",
    parameters: ["one", "two"],
    expected: {
      spec: { hints: ["content"] },
      value: ["one", "two"]
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    parameters: { value: ["one", "two", "three"] },
    expected: {
      spec: { hints: ["content"] },
      value: ["one", "two", "three"]
    }
  },
];

tests.partial = "content";

module.exports = tests;
