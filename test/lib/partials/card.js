var tests = [{
    description: "when array value",
    should: "have card hint and array value",
    kvp: {
      key: ">card",
      value: ["one", "two", "three"]
    },
    expected: {
      spec: { hints: ["card"] },
      value: ["one", "two", "three"]
    }
  },
  {
    description: "when object value",
    should: "have card hint and object value",
    kvp: {
      key: ">card",
      value: { one: "one", two: "two", three: "three" }
    },
    expected: {
      spec: { hints: ["card"] },
      value: { one: "one", two: "two", three: "three" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    kvp: {
      key: ">card",
      value: {
        "spec.hints": ["whatever", "card"],
        "spec.visibility": "visible",
        "spec.input": true,
        value: ["one", "two"]
      }
    },
    expected: {
      spec: {
        hints: ["whatever", "card"],
        visibility: "visible",
        "input": true
      },
      value: ["one", "two"]
    }
  },
  {
    description: "when spec.hints",
    should: "override default hints",
    kvp: {
      key: ">card",
      value: {
        "spec.hints": ["whatever"],
        value: ["one", "two"]
      }
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
    kvp: {
      key: ">card",
      value: {
        spec: {
          hints: ["whatever"],
          visibility: "visible",
          "input": true
        },
        value: ["one", "two"]
      }
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
    kvp: {
      key: ">card",
      value: ["one", "two"]
    },
    expected: {
      spec: { hints: ["card"] },
      value: ["one", "two"]
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    kvp: {
      key: ">card",
      value: {
        value: ["one", "two", "three"]
      }
    },
    expected: {
      spec: { hints: ["card"] },
      value: ["one", "two", "three"]
    }
  },
];

tests.description = "'card' partial";

module.exports = tests;
