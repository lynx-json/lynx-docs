var tests = [{
    description: "when null value",
    should: "not add anything to value",
    parameters: null,
    expected: {
      spec: { hints: ["submit"] },
      value: null
    }
  },
  {
    description: "when label exists",
    should: "add labeledBy to spec",
    parameters: { action: ".", label: "A submit" },
    expected: {
      spec: { hints: ["submit"], labeledBy: "label" },
      value: { action: ".", label: "A submit" }
    }
  },
  {
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
