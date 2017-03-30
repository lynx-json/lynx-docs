var tests = [{
    description: "when array value",
    should: "have header hint and array value",
    kvp: {
      key: ">header",
      value: ["one", "two", "three"]
    },
    expected: {
      spec: { hints: ["header", "container"] },
      value: ["one", "two", "three"]
    }
  },
  {
    description: "when object value",
    should: "have header hint and object value",
    kvp: {
      key: ">header",
      value: { one: "one", two: "two", three: "three" }
    },
    expected: {
      spec: { hints: ["header", "container"] },
      value: { one: "one", two: "two", three: "three" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    kvp: {
      key: ">header",
      value: {
        "spec.hints": ["whatever", "header"],
        "spec.visibility": "visible",
        "spec.input": true,
        value: ["one", "two"]
      }
    },
    expected: {
      spec: {
        hints: ["whatever", "header"],
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
      key: ">header",
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
      key: ">header",
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
      key: ">header",
      value: ["one", "two"]
    },
    expected: {
      spec: { hints: ["header", "container"] },
      value: ["one", "two"]
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    kvp: {
      key: ">header",
      value: {
        value: ["one", "two", "three"]
      }
    },
    expected: {
      spec: { hints: ["header", "container"] },
      value: ["one", "two", "three"]
    }
  },
];

tests.description = "'header' partial";

module.exports = tests;
