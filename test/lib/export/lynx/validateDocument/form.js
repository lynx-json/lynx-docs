const chai = require("chai");
const expect = chai.expect;

const validateForm = require("../../../../../src/lib/export/lynx/validateDocument/form");

let tests = [{
    description: "null 'form'",
    should: "return no errors",
    form: null,
    expected: []
  },
  {
    description: "object 'form'",
    should: "return no errors",
    form: {},
    expected: []
  }, {
    description: "non object 'form'",
    should: "return errors",
    form: [],
    expected: ["'form' value must be an object"]
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateForm(test.form);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document 'form' values", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
