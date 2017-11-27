const chai = require("chai");
const expect = chai.expect;

const validateLink = require("../../../../../src/lib/export/lynx/validateDocument/link");

let tests = [{
    description: "valid 'link' with 'href'",
    should: "return no errors",
    link: { href: ".", },
    expected: []
  }, {
    description: "valid 'link' with 'data'",
    should: "return no errors",
    link: { data: "Hello world", type: "text/plain" },
    expected: []
  }, {
    description: "null 'link'",
    should: "return no errors",
    link: null,
    expected: []
  },
  {
    description: "non object 'link'",
    should: "return errors",
    link: [],
    expected: ["'link' value must be an object"]
  },
  {
    description: "'link' with neither 'data' nor 'href'",
    should: "return errors",
    link: {},
    expected: ["'link' value must have an 'href' or 'data' property"]
  }, {
    description: "'link' with 'data' and 'href'",
    should: "return errors",
    link: { href: ".", type: "text/plain", data: "Hello world" },
    expected: [
      "'link' value with an 'href' property must not have a 'data' property",
      "'link' value with an 'data' property must not have an 'href' property"
    ]
  },
  {
    description: "'link' with 'href' and 'encoding'",
    should: "return errors",
    link: { href: ".", encoding: "base64" },
    expected: ["'link' value with an 'href' property must not have an 'encoding' property"]
  },
  {
    description: "'link' with 'data' and no 'type'",
    should: "return errors",
    link: { data: "Hello world" },
    expected: ["'link' value with a 'data' property must have a 'type' property"]
  },
  {
    description: "'link' with 'data' and invalid 'type'",
    should: "return errors",
    link: { data: "Hello world", type: "foo" },
    expected: ["'type' must be a valid media type name"]
  },
  {
    description: "'link' with 'data' as object and 'type' with subtype of 'json'",
    should: "return no errors",
    link: { data: { message: "I'm an object " }, type: "application/lynx+json" },
    expected: []
  },
  {
    description: "'link' with 'data' as object and 'type' with subtype that is not 'json'",
    should: "return errors",
    link: { data: { message: "I'm an object " }, type: "application/*" },
    expected: ["The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json"]
  },
  {
    description: "'link' with utf-8 'encoding' ",
    should: "return no errors",
    link: { data: "Hello world", type: "text/plain", encoding: "utf-8" },
    expected: []
  },
  {
    description: "'link' with base64 'encoding' ",
    should: "return no errors",
    link: { data: "SGVsbG8gV29ybGQ=", type: "text/plain", encoding: "base64" },
    expected: []
  },
  {
    description: "'link' with invalid 'encoding' ",
    should: "return no errors",
    link: { data: "Hello world", type: "text/plain", encoding: "invalid" },
    expected: ["'encoding' must be either 'utf-8' or 'base64'"]
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateLink(test.link);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document 'link' values", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
