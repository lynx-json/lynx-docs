const chai = require("chai");
const expect = chai.expect;

const validateHints = require("../../../../../src/lib/export/lynx/validateDocument/hints");

let tests = [{
    description: "valid hints",
    should: "return no errors",
    hints: ["container"],
    expected: []
  },
  {
    description: "hints are not an array",
    should: "return errors",
    hints: {},
    expected: ["'hints' must be an array"]
  },
  {
    description: "hints array is empty",
    should: "return errors",
    hints: [],
    expected: ["'hints' must not be empty"]
  },
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateHints(test.hints);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document hints", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
