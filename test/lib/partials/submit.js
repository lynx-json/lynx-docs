var tests = [
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    kvp: {
      key: ">submit",
      value: {
        "spec.hints": ["whatever", "submit"],
        "spec.visibility": "visible",
        action: "."
      }
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
    kvp: {
      key: ">submit",
      value: {
        "spec.hints": ["whatever"],
        value: { action: "." }
      }
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
    kvp: {
      key: ">submit",
      value: {
        spec: {
          hints: ["submit"],
          visibility: "visible"
        },
        value: { action: "." }
      }
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

tests.description = "'link' partial";

module.exports = tests;
