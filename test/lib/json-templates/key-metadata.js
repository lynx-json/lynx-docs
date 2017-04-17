const chai = require("chai");
const expect = chai.expect;

const keyMetadata = require("../../../src/lib/json-templates/key-metadata");

let tests = [{
    description: "key has name only",
    key: "foo",
    expected: { name: "foo" }
  },
  {
    description: "key with name and binding only",
    key: "foo#",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" }
    }
  },
  {
    description: "key with name and named binding",
    key: "foo#bar",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar" }
    }
  },
  {
    description: "key with name, named binding, and named partial",
    key: "foo#bar>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar" },
      partial: { token: ">", variable: "partial" }
    }
  },
  {
    description: "key with name, binding, and partial",
    key: "foo#>",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" },
      partial: { token: ">", variable: "foo" }
    }
  },
  {
    description: "key with name, binding, and named partial",
    key: "foo#>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" },
      partial: { token: ">", variable: "partial" }
    }
  },
  {
    description: "key with binding only",
    key: "#bar",
    expected: { binding: { token: "#", variable: "bar" } }
  },
  {
    description: "key with partial only",
    key: ">partial",
    expected: { partial: { token: ">", variable: "partial" } }
  }
];

function runTest(test) {
  let result = keyMetadata.parse(test.key);
  test.expected.source = test.key;
  expect(result).to.deep.equal(test.expected);
}

describe("key-metadata module", function () {
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
          return keyMetadata.parse(key);
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
        keyMetadata.allTokens.forEach(token => {
          expect(parseKey(token)).to.throw(Error);
        });
      });
      it("should throw with key that has token with illegal variable '()' and no name", function () {
        keyMetadata.allTokens.forEach(token => {
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
      expect(keyMetadata.simpleQuotedToken).to.equal("<");
    });
    it("should use '=' as simple unquoted token", function () {
      expect(keyMetadata.simpleUnquotedToken).to.equal("=");
    });
    it("should use '#' as positive section token", function () {
      expect(keyMetadata.positiveSectionToken).to.equal("#");
    });
    it("should use '^' as negative section token", function () {
      expect(keyMetadata.negativeSectionToken).to.equal("^");
    });
    it("should use '@' as iterator token", function () {
      expect(keyMetadata.iteratorToken).to.equal("@");
    });
    it("should use '>' as partial token", function () {
      expect(keyMetadata.partialToken).to.equal(">");
    });
    it("should use ['<', '='] as simple value tokens", function () {
      expect(keyMetadata.simpleTokens).to.deep.equal(["<", "="]);
    });
    it("should use ['#', '^'] as section tokens", function () {
      expect(keyMetadata.sectionTokens).to.deep.equal(["#", "^"]);
    });
    it("should use ['<', '=', '#', '^', '@', '>'] as template tokens", function () {
      expect(keyMetadata.allTokens).to.deep.equal(["<", "=", "#", "^", "@", ">"]);
    });
  });
});
