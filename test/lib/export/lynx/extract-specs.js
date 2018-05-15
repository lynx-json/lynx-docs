const md5 = require("md5");
const path = require("path");
const url = require("url");
const traverse = require("traverse");

const chai = require("chai");
const expect = chai.expect;

const lynxExport = require("../../../../src/lib/export/lynx/");
const jsonTemplates = require("../../../../src/lib/json-templates");

const defaultOptions = { spec: { dir: "./specs", url: "./specs" }, output: "./out" };

function CreateFileFnStub(specs, options) {
  let self = this;

  let index = 0;

  self.fn = function (specPath, specContent) {
    let spec = specs[index];
    let content = JSON.stringify(spec);
    let name = md5(content) + ".lnxs";

    expect(name).to.equal(specPath);
    expect(content).to.equal(specContent);
    index++;
  };

  self.getCount = function () {
    return index;
  };

  return self;
}

var tests = [{
    description: "no options",
    should: "throw Error",
    options: null,
    throws: Error
  },
  {
    description: "options with no spec",
    should: "throw Error",
    options: {},
    throws: Error
  },
  {
    description: "options with no spec.dir",
    should: "throw Error",
    options: { spec: {} },
    throws: Error
  },
  {
    description: "options with no spec.url",
    should: "throw Error",
    options: { spec: {} },
    throws: Error
  },
  {
    description: "no spec value",
    should: "not call create file",
    options: defaultOptions,
    template: {
      foo: "Hello"
    }
  },
  {
    description: "one spec value",
    should: "call create file once",
    options: defaultOptions,
    template: {
      spec: {
        hints: ["text"]
      },
      value: "Hello"
    }
  },
  {
    description: "when spec dir is absolute",
    should: "call create file once",
    options: Object.assign({}, defaultOptions, { spec: { dir: "/specs", url: "./specs" } }),
    template: {
      spec: {
        hints: ["text"]
      },
      value: "Hello"
    }
  },
  {
    description: "multiple spec values",
    should: "call create file for each spec",
    options: defaultOptions,
    template: {
      spec: {
        hints: ["container"]
      },
      value: {
        message: {
          spec: {
            hints: ["container"]
          },
          value: "Hello"
        }
      }
    }
  }
];

function getSpecsForTemplate(template) {
  return traverse(template).reduce(function (acc, jsValue) {
    if (this.key === "spec") acc.push(jsValue);
    return acc;
  }, []);
}

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {

  if (test.throws) return expect(() => lynxExport.extractSpecs(test.template, test.options, test.createFile)).to.throw(test.throws);

  let specs = getSpecsForTemplate(test.template);
  let createFileStub = new CreateFileFnStub(specs, test.options);

  let result = lynxExport.extractSpecs(test.template, test.options, createFileStub.fn);
  expect(specs.length).to.equal(createFileStub.getCount());
}

describe("extracting spec content", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
