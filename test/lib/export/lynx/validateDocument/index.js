const chai = require("chai");
const expect = chai.expect;

const validateDocument = require("../../../../../src/lib/export/lynx/validate-document").validateLynxDocument;

let tests = [{
    description: "valid document",
    should: "return valid",
    document: { spec: { hints: ["container"] }, value: null },
    expected: { valid: true, errors: [] }
  },
  {
    description: "no base hint",
    should: "return invalid",
    document: { spec: { hints: ["http://example.com/base-hint"] }, value: null },
    expected: {
      valid: false,
      errors: [{
        key: undefined,
        errors: ["hints array must have a base hint as the last item"]
      }]
    }
  },
  {
    description: "domain specific base hint",
    should: "return valid",
    document: { spec: { hints: ["http://example.com/base-hint"] }, value: null },
    baseHints: ["http://example.com/base-hint"],
    expected: { valid: true, errors: [] }
  }

];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateDocument(test.document, test.baseHints);
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
