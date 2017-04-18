const chai = require("chai");
const expect = chai.expect;

const calculateChildren = require("../../../../src/lib/export/lynx/calculate-children");
const rollupSpecs = require("../../../../src/lib/export/lynx/rollup-specs");
const jsonTemplates = require("../../../../src/lib/json-templates");

var tests = [{
    description: "text value only",
    should: "not roll up",
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
    should: "roll up children",
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
    should: "roll up children to root",
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
    should: "not roll up",
    template: { ">container": [{ ">text": "Hello" }] },
    expected: {
      spec: { hints: ["container"] },
      value: { "": [{ spec: { hints: ["text"] }, value: { "": "Hello" } }] }
    }
  },
  {
    description: "array container with object containers values",
    should: "not roll up",
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
    should: "roll up children",
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
  let result = rollupSpecs(processed);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
}

describe("rollup specs for lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
