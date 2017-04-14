var tests = [{
    description: "when no type",
    should: "add application/lynx+json to value",
    parameters: { href: "." },
    expected: {
      spec: { hints: ["link"] },
      value: { href: ".", "type": "application/lynx+json" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    parameters: {
      "spec.hints": ["whatever", "link"],
      "spec.visibility": "visible",
      "spec.input": true,
      value: { href: "." }
    },
    expected: {
      spec: {
        hints: ["whatever", "link"],
        visibility: "visible",
        "input": true
      },
      value: { href: "." }
    }
  },
  {
    description: "when spec.hints",
    should: "override default hints",
    parameters: {
      "spec.hints": ["whatever"],
      value: { href: "." }
    },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: { href: "." }
    }
  },
  {
    description: "when fully specified spec object",
    should: "use provided spec object. Don't default hints",
    parameters: {
      spec: {
        hints: ["link"],
        visibility: "visible"
      },
      value: { href: "." }
    },
    expected: {
      spec: {
        hints: ["link"],
        visibility: "visible"
      },
      value: { href: "." }
    }
  },
  {
    description: "when flattened value",
    should: "copy to 'value' key",
    parameters: { href: ".", label: "A link" },
    expected: {
      spec: { hints: ["link"], labeledBy: "label" },
      value: { href: ".", label: "A link", type: "application/lynx+json" }
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    parameters: { value: { href: ".", label: "A link" } },
    expected: {
      spec: { hints: ["link"] },
      value: { href: ".", label: "A link" }
    }
  }
];

tests.partial = "link";

module.exports = tests;
