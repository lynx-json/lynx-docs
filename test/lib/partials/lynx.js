var tests = [{
    description: "when parameter is null",
    should: "should have text hint and parameter as value",
    parameters: null,
    expected: {
      spec: {
        hints: ["text"],
      },
      value: null
    }
  },
  {
    description: "when parameter is Number",
    should: "should have text hint and parameter as value",
    parameters: 12,
    expected: {
      spec: {
        hints: ["text"],
      },
      value: 12
    }
  },
  {
    description: "when parameter is true",
    should: "should have text hint and parameter as value",
    parameters: true,
    expected: {
      spec: {
        hints: ["text"],
      },
      value: true
    }
  },
  {
    description: "when parameter is false",
    should: "should have text hint and parameter as value",
    parameters: false,
    expected: {
      spec: {
        hints: ["text"],
      },
      value: false
    }
  },
  {
    description: "when string parameter",
    should: "should have text hint and parameter as value",
    parameters: "This is a string",
    expected: {
      spec: {
        hints: ["text"],
      },
      value: "This is a string"
    }
  },
  {
    description: "when array parameter",
    should: "should have container hint and parameter as value",
    parameters: ["this", "is", "an", "array"],
    expected: {
      spec: {
        hints: ["container"],
      },
      value: ["this", "is", "an", "array"]
    }
  },
  {
    description: "when object parameter with no spec or value keys",
    should: "should have container hint and copy object keys to value",
    parameters: { one: "One", two: "Two" },
    expected: {
      spec: {
        hints: ["container"],
      },
      value: { one: "One", two: "Two" }
    }
  },
  {
    description: "when object parameter with spec.hints and no value key",
    should: "should have spec.hints value as hints and copy object keys to value",
    parameters: { "spec.hints": ["whatever"], one: "One", two: "Two" },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: { one: "One", two: "Two" }
    }
  },
  {
    description: "when object parameter with no spec.* and value key",
    should: "should have container hint and copy value",
    parameters: { value: { one: "One", two: "Two" } },
    expected: {
      spec: {
        hints: ["container"],
      },
      value: { one: "One", two: "Two" }
    }
  },
  {
    description: "when spec.* keys mixed with value key",
    should: "copy spec.* properties to spec and set value",
    parameters: {
      "spec.input": true,
      "spec.hints": ["line", "text"],
      "spec.labeledBy": "label",
      "value": "",
      "spec.validation": {}
    },
    expected: {
      spec: {
        input: true,
        hints: ["line", "text"],
        labeledBy: "label",
        validation: {}
      },
      value: ""
    }
  },
  {
    description: "when spec.* keys include qualified namespace. Issue #31",
    should: "copy spec.* properties to spec and set value",
    parameters: {
      "spec.input": true,
      "spec.hints": ["line", "text"],
      "spec.labeledBy": "label",
      "spec.http://www.example.com/spec/property": "whatever",
      "value": ""
    },
    expected: {
      spec: {
        input: true,
        hints: ["line", "text"],
        labeledBy: "label",
        "http://www.example.com/spec/property": "whatever"
      },
      value: ""
    }
  }
];

tests.partial = "lynx";

module.exports = tests;
