const chai = require("chai");
const expect = chai.expect;

const keyMetadata = require("../../../src/lib/json-templates/key-metadata");

let tests = [{
    description: "name only",
    should: "Return name only",
    key: "foo",
    expected: { name: "foo" }
  },
  {
    description: "name with token only",
    should: "Return name plus template with token and variable === name",
    key: "foo#",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" }
    }
  },
  {
    description: "name with token and variable",
    should: "Return name plus template with token and variable",
    key: "foo#bar",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar" }
    }
  },
  {
    description: "name with multiple tokens and variables",
    should: "Return name plus templates with token and variables",
    key: "foo#bar>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "bar" },
      partial: { token: ">", variable: "partial" }
    }
  },
  {
    description: "name with multiple tokens and no variables",
    should: "Return name plus templates with token and variable === name",
    key: "foo#>",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" },
      partial: { token: ">", variable: "foo" }
    }
  },
  {
    description: "name with multiple tokens and some variables",
    should: "Return name plus templates with token and variables",
    key: "foo#>partial",
    expected: {
      name: "foo",
      binding: { token: "#", variable: "foo" },
      partial: { token: ">", variable: "partial" }
    }
  },
  {
    description: "token and variable only",
    should: "Return template with token and variable",
    key: "#bar",
    expected: { binding: { token: "#", variable: "bar" } }
  }
];

function runTest(test) {
  let result = keyMetadata.parse(test.key);
  test.expected.source = test.key;
  expect(result).to.deep.equal(test.expected);
}

describe("when parsing keys", function () {
  describe("when keys are valid", function () {

    tests.forEach(function (test) {
      describe(test.description.concat(" (i.e '", test.key, "')"), function () {
        it(test.should, function () {
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
