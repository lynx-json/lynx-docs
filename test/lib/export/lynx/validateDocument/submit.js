const chai = require("chai");
const expect = chai.expect;

const validateSubmit = require("../../../../../src/lib/export/lynx/validateDocument/submit");

let tests = [{
    description: "null 'submit'",
    should: "return no errors",
    submit: null,
    expected: []
  },
  {
    description: "non object 'submit'",
    should: "return errors",
    submit: [],
    expected: ["'submit' value must be an object"]
  },
  {
    description: "object 'submit' with 'action'",
    should: "return no errors",
    submit: { action: "." },
    expected: []
  },
  {
    description: "object 'submit' without action",
    should: "return errors",
    submit: {},
    expected: [
      "'submit' value must have an 'action'"
    ]
  },
  {
    description: "object 'submit' with null action",
    should: "return errors",
    submit: { action: null },
    expected: [
      "'action' must be a valid URI"
    ]
  },
  {
    description: "object 'submit' with empty action",
    should: "return no errors",
    submit: { action: "" },
    expected: []
  },
  {
    description: "'submit' with valid 'type'",
    should: "return errors",
    submit: { action: ".", type: "text/plain" },
    expected: []
  },
  {
    description: "'submit' with invalid 'type'",
    should: "return errors",
    submit: { action: ".", type: "invalid" },
    expected: ["'type' must be a valid media type name"]
  },
  {
    description: "'submit' with 'send' of 'change'",
    should: "return no errors",
    submit: { action: ".", send: "change" },
    expected: []
  },
  {
    description: "'submit' with 'send' of 'ready'",
    should: "return no errors",
    submit: { action: ".", send: "ready" },
    expected: []
  },
  {
    description: "'submit' with 'send' of 'invalid'",
    should: "return errors",
    submit: { action: ".", send: "invalid" },
    expected: ["'send' must be either 'change' or 'ready'"]
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateSubmit(test.submit);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document 'submit' values", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
