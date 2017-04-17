const chai = require("chai");
const expect = chai.expect;
const url = require("url");

const resolveRelativeUrls = require("../../../../src/lib/export/lynx/resolve-relative-urls");

let testRealm = "http://example.com/foo/";

var tests = [{
    description: "relative realm value",
    should: "resolve realm relative to test realm",
    template: { realm: "./bar" },
    expected: { realm: url.resolve(testRealm, "./bar") }
  },
  {
    description: "absolute realm value",
    should: "be absolute realm",
    template: { realm: "http://google.com/bar" },
    expected: { realm: "http://google.com/bar" }
  },
  {
    description: "relative realm value not at root",
    should: "should not change value",
    template: { root: { realm: "./bar" } },
    expected: { root: { realm: "./bar" } }
  },
  {
    description: "relative scope value",
    should: "resolve scope relative to test realm",
    template: { spec: {}, value: { scope: "./bar" } },
    expected: { spec: {}, value: { scope: url.resolve(testRealm, "./bar") } },
  },
  {
    description: "absolute scope value",
    should: "not change value",
    template: { spec: {}, value: { scope: "http://google.com/" } },
    expected: { spec: {}, value: { scope: "http://google.com/" } },
  },
  {
    description: "relative scope that is not a lynx node child",
    should: "not change value",
    template: { root: { scope: "./bar" } },
    expected: { root: { scope: "./bar" } }
  },

];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let resolved = resolveRelativeUrls(testRealm)(test.template);
  expect(resolved).to.deep.equal(test.expected);
}

describe("when resolving relative urls in lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
