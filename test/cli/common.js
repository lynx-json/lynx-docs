"use strict";

const fs = require("fs");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const log = require("logatim");
const yaml = require("yamljs");

const commonCli = require("../../src/cli/common");

describe("common cli module", function () {
  describe("when applying defaults", function () {
    let tests = [{
        description: "when no values provided by cli for export",
        should: "should apply defaults",
        input: { _: ["export"] },
        expected: { root: ["."], log: "error", infer: false, output: "stdout", format: "handlebars" }
      },
      {
        description: "when no values provided by cli for start",
        should: "should apply defaults",
        input: { _: ["start"] },
        expected: { root: ["."], log: "error", infer: false, port: 3000 }
      },
      {
        description: "when values provided environment for export",
        should: "should not override values from environment",
        before: function () { process.env.LOG_LEVEL = "warn"; },
        after: function () { delete process.env.LOG_LEVEL; },
        input: { _: ["export"] },
        expected: { root: ["."], log: "warn", infer: false, output: "stdout", format: "handlebars" }
      },
      {
        description: "when values provided environment for start",
        should: "should not override values from environment",
        before: function () { process.env.LOG_LEVEL = "warn"; },
        after: function () { delete process.env.LOG_LEVEL; },
        input: { _: ["start"] },
        expected: { root: ["."], log: "warn", infer: false, port: 3000 }
      },
      {
        description: "when values provided run control for export",
        should: "should not override values from run control",
        before: function () {
          let rc = { log: { level: "info" } };
          sinon.stub(fs, "existsSync").returns(true);
          sinon.stub(fs, "readFileSync").returns(yaml.stringify(rc));
        },
        after: function () {
          fs.existsSync.restore();
          fs.readFileSync.restore();
        },
        input: { _: ["export"] },
        expected: { root: ["."], log: "info", infer: false, output: "stdout", format: "handlebars" }
      }
    ];

    function runner(test) {
      if (test.before) test.before();
      commonCli(test.input);
      if (test.after) test.after();
      Object.keys(test.expected).forEach(key => {
        expect(test.expected[key]).to.deep.equal(test.input[key]);
      });
    }

    runTests(tests, runner);
  });

  describe("when normalizing cli root value", function () {
    let tests = [{
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
  describe("when normalizing cli spec values", function () {
    let tests = [{
        description: "when spec is not defined",
        should: "should not change options",
        input: { _: ["export"], spec: undefined },
        expected: { spec: undefined }
      },
      {
        description: "when spec is true",
        should: "should default spec parameters",
        input: { _: ["export"], spec: true },
        expected: { spec: { dir: ".", url: "/" } }
      },
      {
        description: "when spec.dir is set and spec.url is not",
        should: "should default url parameter",
        input: { _: ["export"], spec: { dir: "test" } },
        expected: { spec: { dir: "test", url: "/" } }
      },
      {
        description: "when spec.url is set and spec.dir is not",
        should: "should default dir parameter",
        input: { _: ["export"], spec: { url: "/test/" } },
        expected: { spec: { dir: ".", url: "/test/" } }
      },
      {
        description: "when spec.url and spec.dir is set",
        should: "should use parameter values",
        input: { _: ["export"], spec: { url: "/test/", dir: "test" } },
        expected: { spec: { dir: "test", url: "/test/" } }
      }
    ];

    function runner(test) {
      commonCli(test.input);
      expect(test.input.spec).to.deep.equal(test.expected.spec);
    }

    runTests(tests, runner);
  });

  describe("when normalizing logging", function () {
    let tests = [{
        description: "when no logging set",
        should: "should set logging level to 'error'",
        input: { _: ["export"] },
        expected: { log: "error" }
      },
      {
        description: "when logging switch set with no value",
        should: "should set logging level to 'error'",
        input: { _: ["export"], log: true },
        expected: { log: "error" }
      },
      {
        description: "when logging switch set with 'false' value",
        should: "should set logging level to 'error'",
        input: { _: ["export"], log: false },
        expected: { log: "error" }
      },
      {
        description: "when logging switch set with 'ward' value",
        should: "should set logging level to 'warn'",
        input: { _: ["export"], log: "warn" },
        expected: { log: "warn" }
      },
      {
        description: "when process.env.LOG_LEVEL and no logging switch set",
        should: "should set logging level to process.env.LOG_LEVEL value",
        before: function () { process.env.LOG_LEVEL = "warn"; },
        after: function () { delete process.env.LOG_LEVEL; },
        input: { _: ["export"] },
        expected: { log: "warn" }
      },
      {
        description: "when process.env.LOG_LEVEL and logging switch set",
        should: "should set logging level to switch value",
        before: function () { process.env.LOG_LEVEL = "error"; },
        after: function () { delete process.env.LOG_LEVEL; },
        input: { _: ["export"], log: "warn" },
        expected: { log: "warn" }
      }
    ];

    function runner(test) {
      if (test.before) test.before();
      commonCli(test.input);
      if (test.after) test.after();
      expect(test.input.log).to.equal(test.expected.log);
      expect(log.getLevel()).to.equal(test.expected.log.toUpperCase());
    }

    runTests(tests, runner);
  });

  describe("when processing run control file", function () {
    let tests = [{
        description: "when no run control file present",
        should: "should not set any options",
        input: { _: ["export"] },
        expected: { _: ["export"], infer: false, log: "error" }
      },
      {
        description: "when run control file present",
        should: "should set options from run control",
        runControl: { inferInverseSections: true, log: { level: "warn" }, spec: true },
        input: { _: ["export"] },
        expected: { _: ["export"], infer: true, log: "warn", spec: { dir: ".", url: "/" } }
      },
      {
        description: "when run control file present with spec values",
        should: "should set options from run control",
        runControl: { spec: { dir: "specs", url: "/specs/" } },
        input: { _: ["export"] },
        expected: { _: ["export"], spec: { dir: "specs", url: "/specs/" } }
      },
      {
        description: "when run control file present with export values",
        should: "should set options from run control",
        runControl: { log: { level: "warn" }, export: { root: "foo", output: "bar", format: "baz" } },
        input: { _: ["export"] },
        expected: { _: ["export"], log: "warn", root: ["foo"], output: "bar", format: "baz" }
      },
      {
        description: "when run control file present with start values",
        should: "should set options from run control",
        runControl: { log: { level: "warn" }, start: { root: "foo", port: 9000 } },
        input: { _: ["start"] },
        expected: { _: ["start"], log: "warn", root: ["foo"], port: 9000 }
      },
      {
        description: "when run control file present with export values and overrides",
        should: "should set options from run control and override values from export",
        runControl: { log: { level: "warn" }, spec: true, export: { root: "foo", output: "bar", format: "baz", log: "info", spec: { dir: "specs", url: "/specs/" } } },
        input: { _: ["export"] },
        expected: { _: ["export"], log: "info", root: ["foo"], output: "bar", format: "baz", spec: { dir: "specs", url: "/specs/" } }
      },
      {
        description: "when run control file present with start values and overrides",
        should: "should set options from run control and override values from start",
        runControl: { log: { level: "warn" }, start: { root: "foo", port: 9000, log: "info" } },
        input: { _: ["start"] },
        expected: { _: ["start"], log: "info", root: ["foo"], port: 9000 }
      },
      {
        description: "when run control file and cli switches present",
        should: "should set options from cli switches",
        runControl: { log: { level: "warn" }, export: { root: "foo", output: "bar", format: "baz", log: "info", spec: { dir: "specs", url: "/specs/" } } },
        input: { _: ["export"], log: "error", root: ["no foo"], output: "no bar", format: "no baz", spec: { dir: "no-specs", url: "/no-specs/" } },
        expected: { _: ["export"], log: "error", root: ["no foo"], output: "no bar", format: "no baz", spec: { dir: "no-specs", url: "/no-specs/" } }
      },

    ];

    function runner(test) {
      if (test.runControl) {
        sinon.stub(fs, "existsSync").returns(true);
        sinon.stub(fs, "readFileSync").returns(yaml.stringify(test.runControl));
      } else sinon.stub(fs, "existsSync").returns(false);

      commonCli(test.input);
      fs.existsSync.restore();
      if (fs.readFileSync.restore) fs.readFileSync.restore();

      Object.keys(test.expected).forEach(key => {
        expect(test.expected[key]).to.deep.equal(test.input[key]);
      });
    }

    runTests(tests, runner);
  });
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
