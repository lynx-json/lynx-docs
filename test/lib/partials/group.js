var tests = [{
    description: "when array value",
    should: "have group hint and array value",
    kvp: {
      key: ">group",
      value: ["one", "two", "three"]
    },
    expected: {
      spec: { hints: ["group"] },
      value: ["one", "two", "three"]
    }
  },
  {
    description: "when object value",
    should: "have group hint and object value",
    kvp: {
      key: ">group",
      value: { one: "one", two: "two", three: "three" }
    },
    expected: {
      spec: { hints: ["group"] },
      value: { one: "one", two: "two", three: "three" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    kvp: {
      key: ">group",
      value: {
        "spec.hints": ["whatever", "group"],
        "spec.visibility": "visible",
        "spec.input": true,
        value: ["one", "two"]
      }
    },
    expected: {
      spec: {
        hints: ["whatever", "group"],
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
      key: ">group",
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
      key: ">group",
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
      key: ">group",
      value: ["one", "two"]
    },
    expected: {
      spec: { hints: ["group"] },
      value: ["one", "two"]
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    kvp: {
      key: ">group",
      value: {
        value: ["one", "two", "three"]
      }
    },
    expected: {
      spec: { hints: ["group"] },
      value: ["one", "two", "three"]
    }
  },
];

tests.description = "'group' partial";

module.exports = tests;
