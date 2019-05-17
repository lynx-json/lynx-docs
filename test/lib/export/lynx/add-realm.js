const chai = require("chai");
const expect = chai.expect;

const addRealm = require("../../../../src/lib/export/lynx/add-realm").addRealm;

let testRealm = "http://example.com/foo/";

var tests = [{
    description: "lynx value pair at root",
    should: "append realm to lynx value",
    template: { spec: { hints: ["container"] }, value: null },
    expected: { spec: { hints: ["container"] }, value: null, realm: testRealm }
  },
  {
    description: "templated lynx values at root",
    should: "append realm to each templated lynx value",
    template: {
      "#truthy": { spec: { hints: ["container"] }, value: null },
      "^truthy": { spec: { hints: ["container"] }, value: null }
    },
    expected: {
      "#truthy": { spec: { hints: ["container"] }, value: null, realm: testRealm },
      "^truthy": { spec: { hints: ["container"] }, value: null, realm: testRealm }
    }
  },
  {
    description: "no value spec pairs",
    should: "no change content",
    template: { foo: "bar" },
    expected: { foo: "bar" }
  },
  {
    description: "nested lynx values",
    should: "should only append realm to root lynx value",
    template: {
      spec: { hints: ["container"] },
      value: {
        foo: { spec: { hints: ["text"] }, value: "bar" }
      }
    },
    expected: {
      spec: { hints: ["container"] },
      value: {
        foo: { spec: { hints: ["text"] }, value: "bar" }
      },
      realm: testRealm
    }
  },
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let result = addRealm(testRealm)(test.template);
  if (test.include || test.log) {
    console.log("template", "\n" + JSON.stringify(test.template, null, 2));
    console.log("testRealm:", testRealm);
    console.log("result:", result);
  }

  expect(result).to.deep.equal(test.expected);
}

describe("when adding realm to lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
