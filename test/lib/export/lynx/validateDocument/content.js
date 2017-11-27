const chai = require("chai");
const expect = chai.expect;

const validateContent = require("../../../../../src/lib/export/lynx/validateDocument/content");

let tests = [{
    description: "valid 'content' with 'src'",
    should: "return no errors",
    content: { src: ".", },
    expected: []
  }, {
    description: "valid 'content' with 'data'",
    should: "return no errors",
    content: { data: "Hello world", type: "text/plain" },
    expected: []
  }, {
    description: "null 'content'",
    should: "return no errors",
    content: null,
    expected: []
  },
  {
    description: "non object 'content'",
    should: "return errors",
    content: [],
    expected: ["'content' value must be an object"]
  },
  {
    description: "'content' with neither 'data' nor 'src'",
    should: "return errors",
    content: {},
    expected: ["'content' value must have an 'src' or 'data' property"]
  }, {
    description: "'content' with 'data' and 'src'",
    should: "return errors",
    content: { src: ".", type: "text/plain", data: "Hello world" },
    expected: [
      "'content' value with an 'src' property must not have a 'data' property",
      "'content' value with a 'data' property must not have an 'src' property"
    ]
  },
  {
    description: "'content' with 'src' and 'encoding'",
    should: "return errors",
    content: { src: ".", encoding: "base64" },
    expected: ["'content' value with an 'src' property must not have an 'encoding' property"]
  },
  {
    description: "'content' with 'data' and no 'type'",
    should: "return errors",
    content: { data: "Hello world" },
    expected: ["'content' value with a 'data' property must have a 'type' property"]
  },
  {
    description: "'content' with 'data' and invalid 'type'",
    should: "return errors",
    content: { data: "Hello world", type: "foo" },
    expected: ["'type' must be a valid media type name"]
  },
  {
    description: "'content' with 'data' as object and 'type' with subtype of 'json'",
    should: "return no errors",
    content: { data: { message: "I'm an object " }, type: "application/lynx+json" },
    expected: []
  },
  {
    description: "'content' with 'data' as object and 'type' with subtype that is not 'json'",
    should: "return errors",
    content: { data: { message: "I'm an object " }, type: "application/*" },
    expected: ["The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json"]
  },
  {
    description: "'content' with utf-8 'encoding' ",
    should: "return no errors",
    content: { data: "Hello world", type: "text/plain", encoding: "utf-8" },
    expected: []
  },
  {
    description: "'content' with base64 'encoding' ",
    should: "return no errors",
    content: { data: "SGVsbG8gV29ybGQ=", type: "text/plain", encoding: "base64" },
    expected: []
  },
  {
    description: "'content' with invalid 'encoding' ",
    should: "return no errors",
    content: { data: "Hello world", type: "text/plain", encoding: "invalid" },
    expected: ["'encoding' must be either 'utf-8' or 'base64'"]
  },

];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let expected = test.expected;
  let result = validateContent(test.content);
  expect(result).to.deep.equal(expected);
}

describe("when validating lynx document 'content' values", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
