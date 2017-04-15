const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const expandPartials = require("../../../../src/lib/json-templates/partials/expand");
const processPartial = require("../../../../src/lib/json-templates/partials/process").process;
const resolvePartial = require("../../../../src/lib/json-templates/partials/resolve");
let tests = [{
    description: "no partial",
    template: { foo: "Foo" },
    expected: { foo: "Foo" }
  },
  {
    description: "partial with no variable",
    template: { "foo>": "Foo" },
    expected: { foo: "Foo" },
    resolvePartial: () => (value) => value
  },
  {
    description: "partial with explicit variable",
    template: { "foo>partial": "Foo" },
    expected: { foo: "Foo" },
    resolvePartial: () => (value) => value
  },
  {
    description: "nested partials",
    template: { "foo>": { "bar>": "Bar" } },
    expected: { foo: { bar: "Bar" } },
    resolvePartial: () => (value) => value
  },
  {
    description: "partial only keys",
    template: { foo: { ">bar": "Bar" } },
    expected: { foo: "Bar" },
    resolvePartial: () => (value) => value
  },
  {
    description: "template and partial keys",
    template: { foo: { "#foo>bar": "Bar" } },
    expected: { foo: { "#foo": "Bar" } },
    resolvePartial: () => (value) => value
  },
  {
    description: "partial only keys as array items",
    template: { foo: [{ ">bar": { qux: "Qux" } }] },
    expected: { foo: [{ qux: "Qux" }] },
    resolvePartial: () => (value) => value
  },
  {
    description: "template and partial keys as array items",
    template: { foo: [{ "#foo>bar": { qux: "Qux" } }] },
    expected: { foo: [{ "#foo": { qux: "Qux" } }] },
    resolvePartial: () => (value) => value
  },
  {
    description: "nested partials",
    template: { "foo>container": { "spec.visibility": "hidden", one: "one" } },
    expected: { foo: { spec: { hints: ["container"], visibility: "hidden" }, "value": { one: "one" } } },
  },
  {
    description: "nested partials at root",
    template: { ">container": { "spec.visibility": "hidden", one: "one" } },
    expected: { spec: { hints: ["container"], visibility: "hidden" }, "value": { one: "one" } },
  },
  {
    description: "partial with string parameter",
    template: { "foo>text": "Foo" },
    expected: { foo: { spec: { hints: ["text"] }, "value": { "": "Foo" } } },
  },
  {
    description: "partial with array parameter",
    template: { "foo>container": ["Foo", "Bar"] },
    expected: { foo: { spec: { hints: ["container"] }, "value": { "": ["Foo", "Bar"] } } },
  },
  {
    description: "partial with null parameter",
    template: { "foo>text": null },
    expected: { foo: { spec: { hints: ["text"] }, "value": { "": null } } },
  },
  {
    description: "deeply nested partials at root",
    template: {
      foo: {
        ">container": {
          "#foo": {
            bar: {
              ">container": {
                "#bar": {
                  fooBar: {
                    ">text": "Foo and bar"
                  }
                },
                "^bar": {
                  fooNoBar: {
                    ">text": "Foo no bar"
                  }
                }
              }
            }
          },
          "^foo": {
            bar: {
              ">container": {
                "#bar": {
                  noFooBar: {
                    ">text": "No foo and bar"
                  }
                },
                "^bar": {
                  noFooNoBar: {
                    ">text": "No foo and no bar"
                  }
                }
              }
            }
          }
        }
      }
    },
    expected: {
      "foo": {
        spec: { hints: ["container"] },
        value: {
          "#foo": {
            bar: {
              spec: { hints: ["container"] },
              value: {
                "#bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: { "": "Foo and bar" }
                  }
                },
                "^bar": {
                  fooNoBar: {
                    spec: { hints: ["text"] },
                    value: { "": "Foo no bar" }
                  }
                }
              }
            }
          },
          "^foo": {
            bar: {
              spec: { hints: ["container"] },
              value: {
                "#bar": {
                  noFooBar: {
                    spec: { hints: ["text"] },
                    value: { "": "No foo and bar" }
                  }
                },
                "^bar": {
                  noFooNoBar: {
                    spec: { hints: ["text"] },
                    value: { "": "No foo and no bar" }
                  }
                }
              }
            }
          }
        }

      }
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

function getTests() {
  let filtered = tests.filter(test => test.includes === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  test.resolvePartial = test.resolvePartial || resolvePartial.resolvePartial;
  let result = expandPartials.expand(test.template, test.resolvePartial);
  if (test.only) {
    console.log("template", "\n" + JSON.stringify(test.template, null, 2));
    console.log("\nresult", "\n" + JSON.stringify(result, null, 2));
  }
  expect(result).to.deep.equal(test.expected);
}

describe("when expanding partials", function () {
  getTests().forEach(function (test) {
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
