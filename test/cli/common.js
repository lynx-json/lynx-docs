"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var commonCli = require("../../src/cli/common");

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

describe.only("when normalizing cli root value", function () {
  tests.forEach(test => {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});

function runTest(test) {
  commonCli(test.input);
  test.input.root.should.deep.equal(test.expectedRoot);
}
