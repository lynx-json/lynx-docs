const chai = require("chai");
const expect = chai.expect;
const validators = require("../../../src/lib/json-templates/validators");
const templateKey = require("../../../src/lib/json-templates/template-key");

function getTests(tests) {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

describe("validators module", function () {
  describe("when validating comparible sections", function () {
    let tests = [{
        description: "no binding keys",
        should: "be valid",
        keys: ["foo", "bar"],
        expected: true
      },
      {
        description: "binding keys that don't include sections",
        should: "be valid",
        keys: ["foo<", "bar=", "qux>", "@foo"],
        expected: true
      },
      {
        description: "binding keys that include compatible sections",
        should: "be valid",
        keys: ["foo#", "foo^"],
        expected: true
      },
      {
        description: "binding keys that include one positive section",
        should: "not be valid",
        keys: ["foo#"],
        expected: false
      },
      {
        description: "binding keys that include one negative section",
        should: "not be valid",
        keys: ["foo^"],
        expected: false
      },
      {
        description: "binding keys that include incompatible sections",
        should: "not be valid",
        keys: ["foo#", "bar^"],
        expected: false
      },
      {
        description: "binding keys that include some incompatible sections",
        should: "not be valid",
        keys: ["foo#", "foo^", "bar^"],
        expected: false
      },
      {
        description: "binding keys that include compatible sections without names",
        should: "be valid",
        keys: ["#foo", "^foo"],
        expected: true
      },
      {
        description: "binding keys that include one positive section without name",
        should: "not be valid",
        keys: ["#foo"],
        expected: false
      },
      {
        description: "binding keys that include one negative section without name",
        should: "not be valid",
        keys: ["^foo"],
        expected: false
      },
      {
        description: "binding keys that include incompatible sections without names",
        should: "not be valid",
        keys: ["#foo", "^bar"],
        expected: false
      },
      {
        description: "binding keys that include some incompatible sections without names",
        should: "not be valid",
        keys: ["#foo", "^foo", "^bar"],
        expected: false
      }
    ];

    function runTest(test) {
      if (test.include || test.log) console.log("keys", "\n" + JSON.stringify(test.keys, null, 2));
      let metas = test.keys.map(templateKey.parse);
      if (test.include || test.log) console.log("metas", "\n" + JSON.stringify(metas, null, 2));
      let result = validators.validateCompatibleSections(metas);
      if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
      expect(result.valid).to.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe("when " + test.description, function () {
        it("should " + test.should, function () {
          runTest(test);
        });
      });
    });

  });
});
