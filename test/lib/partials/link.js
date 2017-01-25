var tests = [{
    description: "when no type",
    should: "add application/lynx+json to value",
    kvp: {
      key: ">link",
      value: { href: "." }
    },
    expected: {
      spec: { hints: ["link"] },
      value: { href: ".", "type": "application/lynx+json" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    kvp: {
      key: ">link",
      value: {
        "spec.hints": ["whatever", "link"],
        "spec.visibility": "visible",
        "spec.input": true,
        value: { href: "." }
      }
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
    kvp: {
      key: ">link",
      value: {
        "spec.hints": ["whatever"],
        value: { href: "." }
      }
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
    kvp: {
      key: ">link",
      value: {
        spec: {
          hints: ["link"],
          visibility: "visible"
        },
        value: { href: "." }
      }
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
    kvp: {
      key: ">link",
      value: { href: ".", title: "A link" }
    },
    expected: {
      spec: { hints: ["link"] },
      value: { href: ".", title: "A link", type: "application/lynx+json" }
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    kvp: {
      key: ">link",
      value: {
        value: { href: ".", title: "A link" }
      }
    },
    expected: {
      spec: { hints: ["link"] },
      value: { href: ".", title: "A link" }
    }
  },
];

tests.description = "'link' partial";

module.exports = tests;
