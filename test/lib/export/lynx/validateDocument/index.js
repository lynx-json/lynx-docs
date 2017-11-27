const chai = require("chai");
const expect = chai.expect;

const validateDocument = require("../../../../../src/lib/export/lynx/validateDocument");

let tests = [{
    description: "valid document",
    should: "return valid",
    document: { spec: { hints: ["container"] }, value: null },
    expected: { valid: true, errors: [] }
  },
  {
    description: "no base hint",
    should: "return invalid",
    document: { spec: { hints: ["foo"] }, value: null },
    expected: {
      valid: false,
      errors: [{
        key: undefined,
        errors: ["hints array must have a base hint as the last item"]
      }]
    }
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateDocument(test.document);
  result.errors = result.errors.map(e => { return { key: e.key, errors: e.errors }; });
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
