const chai = require("chai");
const expect = chai.expect;

const calculateChildren = require("../../../../src/lib/export/lynx/calculate-children");
const flatten = require("../../../../src/lib/export/lynx/flatten");
const jsonTemplates = require("../../../../src/lib/json-templates");

var tests = [{
    description: "text value only",
    should: "not flatten template",
    template: { "message>text": "Hello" },
    expected: {
      message: {
        spec: { hints: ["text"] },
        value: { "": "Hello" }
      }
    }
  },
  {
    description: "object container with text values",
    should: "flatten template",
    template: { ">container": { "message>text": "Hello" } },
    expected: {
      spec: {
        hints: ["container"],
        children: [{ name: "message", hints: ["text"] }]
      },
      message: { "": "Hello" }
    }
  },
  {
    description: "nested object containers",
    should: "flatten template",
    template: { ">container": { "c1>container": { "message>text": "Hello" } } },
    expected: {
      spec: {
        hints: ["container"],
        children: [{
          name: "c1",
          hints: ["container"],
          children: [{ name: "message", hints: ["text"] }]
        }]
      },
      c1: { message: { "": "Hello" } }
    }
  },
  {
    description: "array container with text values",
    should: "not flatten template",
    template: { ">container": [{ ">text": "Hello" }] },
    expected: {
      spec: { hints: ["container"] },
      value: { "": [{ spec: { hints: ["text"] }, value: { "": "Hello" } }] }
    }
  },
  {
    description: "array container with object containers values",
    should: "not flatten template",
    template: { ">container": [{ ">container": { "message>text": "Hello" } }] },
    expected: {
      spec: { hints: ["container"] },
      value: {
        "": [{
          spec: {
            hints: ["container"],
            children: [{ name: "message", hints: ["text"] }]
          },
          "message": { "": "Hello" }
        }]
      }
    }
  },
  {
    description: "object container with text values",
    should: "flatten template",
    template: { ">container": { "message>text": "Hello" } },
    expected: {
      spec: {
        hints: ["container"],
        children: [{ name: "message", hints: ["text"] }]
      },
      message: { "": "Hello" }
    }
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let processed = jsonTemplates.process(test.template, false);
  if (test.include || test.log) console.log("processed", "\n" + JSON.stringify(processed, null, 2));
  let childrenAdded = calculateChildren(processed);
  if (test.include || test.log) console.log("children added", "\n" + JSON.stringify(childrenAdded, null, 2));
  let result = flatten(processed);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
}

describe("flatten lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
