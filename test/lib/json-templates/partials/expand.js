const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const expandPartials = require("../../../../src/lib/json-templates/partials/expand");
const processPartial = require("../../../../src/lib/json-templates/partials/process").process;

let tests = [{
    description: "no partial",
    template: { foo: "Foo" },
    expected: { foo: "Foo" }
  },
  {
    description: "partial with no variable",
    template: { "foo>": "Foo" },
    expected: { foo: "Foo" }
  },
  {
    description: "partial with explicit variable",
    template: { "foo>partial": "Foo" },
    expected: { foo: "Foo" }
  },
  {
    description: "nested partials",
    template: { "foo>": { "bar>": "Bar" } },
    expected: { foo: { bar: "Bar" } }
  },
  {
    description: "partial only keys",
    template: { foo: { ">bar": "Bar" } },
    expected: { foo: "Bar" }
  },
  {
    description: "template and partial keys",
    template: { foo: { "#foo>bar": "Bar" } },
    expected: { foo: { "#foo": "Bar" } }
  },
  {
    description: "partial only keys as array items",
    template: { foo: [{ ">bar": { qux: "Qux" } }] },
    expected: { foo: [{ qux: "Qux" }] }
  },
  {
    description: "template and partial keys as array items",
    template: { foo: [{ "#foo>bar": { qux: "Qux" } }] },
    expected: { foo: [{ "#foo": { qux: "Qux" } }] }
  },
  {
    description: "nested partials",
    template: { "foo>container": { "spec.visibility": "hidden", one: "one" } },
    expected: { foo: { spec: { hints: ["container"], visibility: "hidden" }, "value": { one: "one" } } },
    stubs: {
      expandPartials: {
        calculatePartialUrl: function (templatePath, partialName) { return partialName; }
      }
    },
    resolvePartial: function (partialUrl) {
      if (partialUrl === "container") return processWrapper({ ">lynx": { "spec.hints": ["container"], "~*": null } });
      if (partialUrl === "lynx") return processWrapper({ "spec~": { "~spec.": null }, "value~": { "~*": null } });
    }
  },
  {
    description: "nested partials at root",
    template: { ">container": { "spec.visibility": "hidden", one: "one" } },
    expected: { spec: { hints: ["container"], visibility: "hidden" }, "value": { one: "one" } },
    stubs: {
      expandPartials: {
        calculatePartialUrl: function (templatePath, partialName) { return partialName; }
      }
    },
    resolvePartial: function (partialUrl) {
      if (partialUrl === "container") return processWrapper({ ">lynx": { "spec.hints": ["container"], "~*": null } });
      if (partialUrl === "lynx") return processWrapper({ "spec~": { "~spec.": null }, "value~": { "~*": null } });
    }
  }
];

function getStubSourceReference(stubName) {
  switch (stubName) {
  case "expandPartials":
    return expandPartials;
  }
}

function setupStubs(stubs) {
  if (!stubs) return;
  Object.keys(stubs).forEach(stub => {
    Object.keys(stubs[stub]).forEach(key => {
      if (typeof (stubs[stub][key]) === "function") {
        sinon.stub(getStubSourceReference(stub), key).callsFake(stubs[stub][key]);
      } else sinon.stub(getStubSourceReference(stub), key).returns(stubs[stub][key]);
    });
  });
}

function restoreStubs(stubs) {
  if (!stubs) return;
  Object.keys(stubs).forEach(stub => {
    Object.keys(stubs[stub]).forEach(key => {
      getStubSourceReference(stub)[key].restore();
    });
  });
}

function processWrapper(partial) {
  return function (parameters) {
    return processPartial(partial, parameters);
  };
}

function resolvePartial(partialUrl) { //placeholder for the real 'resolvePartial' implementation
  return function (value) {
    return value;
  };
}

function runTest(test) {
  test.resolvePartial = test.resolvePartial || resolvePartial;
  let result = expandPartials.expand(test.template, test.resolvePartial);
  expect(result).to.deep.equal(test.expected);
}

describe("when expanding partials", function () {
  tests.forEach(function (test) {
    describe("when ".concat(test.description), function () {
      beforeEach(function () {
        setupStubs(test.stubs);
      });
      afterEach(function () {
        restoreStubs(test.stubs);
      });

      let should = test.expected ? "should expand value" : "should not change value";
      it(should, function () {
        runTest(test);
      });
    });
  });
});
