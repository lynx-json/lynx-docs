var tests = [{
  description: "when spec.* keys mixed with value key",
  should: "have card hint and array value",
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
}];

tests.partial = "lynx";

module.exports = tests;
