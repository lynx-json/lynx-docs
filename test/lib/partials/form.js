var tests = [{
    description: "when array value",
    should: "have form hint and array value",
    parameters: ["one", "two", "three"],
    expected: {
      spec: { hints: ["form"] },
      value: ["one", "two", "three"]
    }
  },
  {
    description: "when object value",
    should: "have form hint and object value",
    parameters: { one: "one", two: "two", three: "three" },
    expected: {
      spec: { hints: ["form"] },
      value: { one: "one", two: "two", three: "three" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    parameters: {
      "spec.hints": ["whatever", "form"],
      "spec.visibility": "visible",
      "spec.input": true,
      value: ["one", "two"]
    },
    expected: {
      spec: {
        hints: ["whatever", "form"],
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
      spec: { hints: ["form"] },
      value: ["one", "two"]
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    parameters: { value: ["one", "two", "three"] },
    expected: {
      spec: { hints: ["form"] },
      value: ["one", "two", "three"]
    }
  },
];

tests.partial = "form";

module.exports = tests;
