"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var commonCli = require("../../src/cli/common");

describe("when normalizing cli root value", function () {
  var tests = [{
      description: "when variadic arguments and default root",
      should: "should use variadic arugments as root values",
      input: { _: ["export", "one", "two"], root: "." },
      expectedRoot: ["one", "two"]
    },
    {
      description: "when no variadic default root",
      should: "should use default as root value",
      input: { _: ["export"], root: "." },
      expectedRoot: ["."]
    },
    {
      description: "when variadic arguments and not default root",
      should: "should use variadic arugments as root values",
      input: { _: ["export", "one", "two"], root: "three" },
      expectedRoot: ["one", "two"]
    }
  ];

  function runner(test) {
    commonCli(test.input);
    expect(test.input.root).to.deep.equal(test.expectedRoot);
  }

  runTests(tests, runner);

});
describe("when normalizing spec values", function () {
  var tests = [{
      description: "when spec is not defined",
      should: "should not change options",
      input: { _: ["export"], spec: undefined },
      expected: { flatten: undefined, spec: undefined }
    },
    {
      description: "when spec is true",
      should: "should set flatten true and default spec parameters",
      input: { _: ["export"], spec: true },
      expected: { flatten: true, spec: { dir: ".", url: "/" } }
    },
    {
      description: "when spec.dir is set and spec.url is not",
      should: "should set flatten true and default url parameter",
      input: { _: ["export"], spec: { dir: "test" } },
      expected: { flatten: true, spec: { dir: "test", url: "/" } }
    },
    {
      description: "when spec.url is set and spec.dir is not",
      should: "should set flatten true and default dir parameter",
      input: { _: ["export"], spec: { url: "/test/" } },
      expected: { flatten: true, spec: { dir: ".", url: "/test/" } }
    },
    {
      description: "when spec.url and spec.dir is set",
      should: "should set flatten true and use parameter values",
      input: { _: ["export"], spec: { url: "/test/", dir: "test" } },
      expected: { flatten: true, spec: { dir: "test", url: "/test/" } }
    }
  ];

  function runner(test) {
    commonCli(test.input);
    expect(test.input.flatten).to.deep.equal(test.expected.flatten);
    expect(test.input.spec).to.deep.equal(test.expected.spec);
  }

  runTests(tests, runner);
});

function runTests(tests, runner) {
  tests.forEach(test => {
    describe(test.description, function () {
      it(test.should, function () {
        runner(test);
      });
    });
  });
}
