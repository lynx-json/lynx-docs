const chai = require("chai");
const expect = chai.expect;

const text = require("../../../../../src/lib/export/lynx/validate-document/text");

let tests = [{
    description: "null 'text'",
    should: "return no errors",
    text: null,
    expected: []
  },
  {
    description: "string 'text'",
    should: "return no errors",
    text: "A string",
    expected: []
  },
  {
    description: "number 'text'",
    should: "return no errors",
    text: 42,
    expected: []
  },
  {
    description: "bool 'text'",
    should: "return no errors",
    text: true,
    expected: []
  },
  {
    description: "object 'text'",
    should: "return errors",
    text: {},
    expected: ["'text' values must be a string, number, 'true', 'false', or 'null'"]
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = text(test.text);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document 'text' values", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
