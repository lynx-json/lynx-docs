const chai = require("chai");
const expect = chai.expect;

const partialKey = require("../../../../src/lib/json-templates/partials/partial-key");
const templateKey = require("../../../../src/lib/json-templates/template-key");

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
    expected: { name: "foo", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name '<' binding and variable",
    key: "foo<~",
    expected: { name: "foo<", wildcard: false, variable: "foo<" }
  },
  {
    description: "key with name '=' binding and variable",
    key: "foo=~",
    expected: { name: "foo=", wildcard: false, variable: "foo=" }
  },
  {
    description: "key with name '#' binding and variable",
    key: "foo#~",
    expected: { name: "foo#", wildcard: false, variable: "foo#" }
  },
  {
    description: "key with name '^' binding and variable",
    key: "foo^~",
    expected: { name: "foo^", wildcard: false, variable: "foo^" }
  },
  {
    description: "key with name '>' binding and variable",
    key: "foo>~",
    expected: { name: "foo>", wildcard: false, variable: "foo>" }
  },
  {
    description: "key with name '<' binding and named variable",
    key: "foo<~foo",
    expected: { name: "foo<", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name '=' binding and named variable",
    key: "foo=~foo",
    expected: { name: "foo=", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name '#' binding and named variable",
    key: "foo#~foo",
    expected: { name: "foo#", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name '^' binding and named variable",
    key: "foo^~foo",
    expected: { name: "foo^", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name '>' binding and named variable",
    key: "foo>~foo",
    expected: { name: "foo>", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name with dashes and variable",
    key: "foo-name~",
    expected: { name: "foo-name", wildcard: false, variable: "foo-name" }
  },
  {
    description: "key with name and named variable",
    key: "foo~foo",
    expected: { name: "foo", wildcard: false, variable: "foo" }
  },
  {
    description: "key with name with dashes and named variale with dashes",
    key: "foo-name~bar-name",
    expected: { name: "foo-name", wildcard: false, variable: "bar-name" }
  },
  {
    description: "wildcard key name only",
    key: "*",
    expected: { name: "*" }
  },
  {
    description: "wildcard key and variable",
    key: "*~",
    expected: { name: "*", wildcard: true, variable: "*" }
  },
  {
    description: "wildcard key and named variable",
    key: "*~foo",
    expected: { name: "*", wildcard: true, variable: "*" }
  }
];

function runTest(test) {
  let result = partialKey.parse(test.key);
  test.expected.source = test.key;
  expect(result).to.deep.equal(test.expected);
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

    describe("when processing keys with tokens", function () {
      templateKey.allTokens.forEach(token => {
        describe("when processing key with token '" + token + "'", function () {
          it("should allow token in key name", function () {
            let key = "test" + token;
            let test = { key: key, expected: { name: key } };
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
