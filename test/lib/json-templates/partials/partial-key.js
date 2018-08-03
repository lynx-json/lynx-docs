const chai = require("chai");
const expect = chai.expect;

const partialKey = require("../../../../src/lib/json-templates/partials/partial-key");

let tests = [{
    description: "key has name only",
    key: "foo",
    expected: { name: "foo" }
  },
  {
    description: "key has name with dashes",
    key: "foo-name",
    expected: { name: "foo-name" }
  },
  {
    description: "key with name and variable",
    key: "foo~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '<' binding and variable",
    key: "foo<~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '<' binding, partial reference, and variable",
    key: "foo<>",
    expected: { name: "foo" }
  },
  {
    description: "key with name '=' binding and variable",
    key: "foo=~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '#' binding and variable",
    key: "foo#~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '^' binding and variable",
    key: "foo^~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '>' partial and variable",
    key: "foo>~",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: false } }
  },
  {
    description: "key with name '<' binding and named variable",
    key: "foo<~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name '=' binding and named variable",
    key: "foo=~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name '#' binding and named variable",
    key: "foo#~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name '^' binding and named variable",
    key: "foo^~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name '>' partial and named variable",
    key: "foo>~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name with dashes and variable",
    key: "foo-name~",
    expected: { name: "foo-name", placeholder: { token: "~", wildcard: false, variable: "foo-name", explicit: false } }
  },
  {
    description: "key with name and named variable",
    key: "foo~foo",
    expected: { name: "foo", placeholder: { token: "~", wildcard: false, variable: "foo", explicit: true } }
  },
  {
    description: "key with name with dashes and named variale with dashes",
    key: "foo-name~bar-name",
    expected: { name: "foo-name", placeholder: { token: "~", wildcard: false, variable: "bar-name", explicit: true } }
  },
  {
    description: "wildcard key name only",
    key: "*",
    expected: { name: "*" }
  },
  {
    description: "wildcard key and variable",
    key: "*~",
    expected: { name: "*", placeholder: { token: "~", wildcard: true, variable: "*", explicit: false } }
  }
];

function runTest(test) {
  let result = partialKey.parse(test.key);
  if (result.placeholder || test.expected.placeholder) {
    expect(result.placeholder).to.deep.equal(test.expected.placeholder);
  }
  expect(result.source).to.equal(test.key);
  expect(result.name).to.equal(test.expected.name);
}

describe("partial key module", function () {
  describe("when parsing keys", function () {
    describe("when keys are valid", function () {

      tests.forEach(function (test) {
        describe("when " + test.description + " (i.e '" + test.key + "')", function () {
          it("should result in expected result", function () {
            runTest(test);
          });
        });
      });
    });

    describe("when keys are invalid", function () {
      function parseKey(key) {
        return function () {
          return partialKey.parse(key);
        };
      }

      it("should throw with key that is 'null'", function () {
        expect(parseKey(null)).to.throw(Error);
      });
      it("should throw with key that is 'true'", function () {
        expect(parseKey(true)).to.throw(Error);
      });
      it("should throw with key that is 'false'", function () {
        expect(parseKey(false)).to.throw(Error);
      });
      it("should throw with key that is '{}'", function () {
        expect(parseKey({})).to.throw(Error);
      });
      it("should throw with key that is '[]'", function () {
        expect(parseKey([])).to.throw(Error);
      });
      it("should throw with key that has token with no variable and no name", function () {
        expect(parseKey("~")).to.throw(Error);
      });
      it("should throw with key that has token with illegal variable '()' and no name", function () {
        expect(parseKey("()~")).to.throw(Error);
      });
      it("should throw with key that has illegal name '()'", function () {
        expect(parseKey("()")).to.throw(Error);
      });
    });
  });
});
