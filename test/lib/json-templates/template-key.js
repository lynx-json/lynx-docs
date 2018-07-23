const chai = require("chai");
const expect = chai.expect;

const templateKey = require("../../../src/lib/json-templates/template-key");

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
    description: "key with name and binding only",
    key: "foo#",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo", explicit: false }
    }
  },
  {
    description: "key with name and placeholder token as variable",
    key: "foo<~",
    expected: {
      name: "foo",
      binding: { token: "<", variable: "~", explicit: true }
    }
  },
  {
    description: "key with name with dashes and binding only",
    key: "foo-name#",
    expected: {
      name: "foo-name",
      binding: { token: "#", variable: "foo-name", explicit: false }
    }
  },
  {
    description: "key with name and named binding",
    key: "foo#bar",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar", explicit: true }
    }
  },
  {
    description: "key with name with dashes and named binding with dashes",
    key: "foo-name#bar-name",
    expected: {
      name: "foo-name",
      binding: { token: "#", variable: "bar-name", explicit: true }
    }
  },
  {
    description: "key with name, named binding, and named partial",
    key: "foo#bar>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar", explicit: true },
      partial: { token: ">", variable: "partial", explicit: true }
    }
  },
  {
    description: "key with name with dashes, named binding with dashes, and named partial with dashes",
    key: "foo-name#bar-name>partial-name",
    expected: {
      name: "foo-name",
      binding: { token: "#", variable: "bar-name", explicit: true },
      partial: { token: ">", variable: "partial-name", explicit: true }
    }
  },
  {
    description: "key with name, section binding, and partial",
    key: "foo#>",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo", explicit: false },
      partial: { token: ">", variable: "foo", explicit: false }
    }
  },
  {
    description: "key with name, value binding, and partial",
    key: "foo<>",
    expected: {
      name: "foo",
      binding: { token: "<", variable: "foo", explicit: false },
      partial: { token: ">", variable: "foo", explicit: false }
    }
  },
  {
    description: "key with name, binding, and named partial",
    key: "foo#>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo", explicit: false },
      partial: { token: ">", variable: "partial", explicit: true }
    }
  },
  {
    description: "key with binding only",
    key: "#bar",
    expected: { binding: { token: "#", variable: "bar", explicit: true } }
  },
  {
    description: "key with partial only",
    key: ">partial",
    expected: { partial: { token: ">", variable: "partial", explicit: true } }
  }
];

function runTest(test) {
  let result = templateKey.parse(test.key);
  test.expected.source = test.key;
  expect(result).to.deep.equal(test.expected);
}

describe("template key module", function () {
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
          return templateKey.parse(key);
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
        templateKey.allTokens.forEach(token => {
          expect(parseKey(token)).to.throw(Error);
        });
      });
      it("should throw with key that has token with illegal variable '()' and no name", function () {
        templateKey.allTokens.forEach(token => {
          let key = token + "()";
          expect(parseKey(key)).to.throw(Error);
        });
      });
      it("should throw with key that has illegal name '()'", function () {
        expect(parseKey("()")).to.throw(Error);
      });
    });
  });
  describe("when asserting tokens", function () {
    it("should use '<' as simple quoted token", function () {
      expect(templateKey.simpleQuotedToken).to.equal("<");
    });
    it("should use '=' as simple unquoted token", function () {
      expect(templateKey.simpleUnquotedToken).to.equal("=");
    });
    it("should use '#' as positive section token", function () {
      expect(templateKey.positiveSectionToken).to.equal("#");
    });
    it("should use '^' as negative section token", function () {
      expect(templateKey.negativeSectionToken).to.equal("^");
    });
    it("should use '@' as iterator token", function () {
      expect(templateKey.iteratorToken).to.equal("@");
    });
    it("should use '>' as partial token", function () {
      expect(templateKey.partialToken).to.equal(">");
    });
    it("should use ['<', '='] as simple value tokens", function () {
      expect(templateKey.simpleTokens).to.deep.equal(["<", "="]);
    });
    it("should use ['#', '^'] as section tokens", function () {
      expect(templateKey.sectionTokens).to.deep.equal(["#", "^"]);
    });
    it("should use ['<', '=', '#', '^', '@', '>'] as template tokens", function () {
      expect(templateKey.allTokens).to.deep.equal(["<", "=", "#", "^", "@", ">"]);
    });
  });
});
