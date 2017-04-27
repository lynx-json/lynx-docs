let date = Date.now();
let tests = [{
    description: "when null value",
    should: "not add anything to value",
    parameters: null,
    expected: {
      spec: { hints: ["line", "text"] },
      value: null
    }
  },
  {
    description: "when string value",
    should: "use parameter as the value",
    parameters: "Hello",
    expected: {
      spec: { hints: ["line", "text"] },
      value: "Hello"
    }
  },
  {
    description: "when number value",
    should: "use parameter as the value",
    parameters: 12,
    expected: {
      spec: { hints: ["line", "text"] },
      value: 12
    }
  },
  {
    description: "when bool value",
    should: "use parameter as the value",
    parameters: true,
    expected: {
      spec: { hints: ["line", "text"] },
      value: true
    }
  },
  {
    description: "when date value",
    should: "use parameter as the value",
    parameters: date,
    expected: {
      spec: { hints: ["line", "text"] },
      value: date
    }
  },
  {
    description: "when spec.* properties",
    should: "copy spec.* properties to spec and copy value",
    parameters: { "spec.validation": {}, "spec.input": true, value: "Hello" },
    expected: {
      spec: {
        hints: ["line", "text"],
        validation: {},
        input: true
      },
      value: "Hello"
    }
  }

];

tests.partial = "line";

module.exports = tests;
