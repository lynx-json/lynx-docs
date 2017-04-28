const chai = require("chai");
const expect = chai.expect;
const types = require("../../../src/types");
const expandTokens = require("../../../src/lib/json-templates/expand-tokens");

let tests = [{
    description: "value has no template keys",
    template: { foo: "Foo" },
    expected: { foo: "Foo" }
  },
  {
    description: "value has template key (>)",
    template: { "foo>": { header: "Foo partial" } },
    expected: { foo: { ">foo": { header: "Foo partial" } } }
  },
  {
    description: "value has template key (<)",
    template: { "foo<": "No foo" },
    expected: { foo: { "<foo": "No foo" } }
  },
  {
    description: "value has template key (=)",
    template: { "foo=": "No foo" },
    expected: { foo: { "=foo": "No foo" } }
  },
  {
    description: "value has template key (@)",
    template: { "@foo": { "<bar": "Yes bar" } },
    expected: { "@foo": { "<bar": "Yes bar" } }
  },
  {
    description: "iterator with partial",
    template: { "@foo>partial": { "<bar": "Yes bar" } },
    expected: { "@foo": { ">partial": { "<bar": "Yes bar" } } }
  },
  {
    description: "intermediate syntax",
    template: { "foo#": "Yes foo", "foo^": "No foo" },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" } }
  }, {
    description: "intermediate syntax with static and dynamic values",
    template: { "foo#": "Yes foo", "foo^": "No foo", bar: "Yes bar" },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" }, bar: "Yes bar" }
  }, {
    description: "long syntax",
    template: { foo: { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" } }
  }, {
    description: "intermediate syntax with variable",
    template: { "foo#bar": "Yes bar", "foo^bar": "No bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" } }
  }, {
    description: "intermediate syntax with variable and static value",
    template: { "foo#bar": "Yes bar", "foo^bar": "No bar", bar: "Yes bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" }, bar: "Yes bar" }
  }, {
    description: "long syntax with variable",
    template: { foo: { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" } }
  },
  {
    description: "intermediate syntax with partial",
    template: { "foo#>": "Yes foo", "foo^>": "No foo" },
    expected: { foo: { "#foo": { ">foo": "Yes foo" }, "^foo": { ">foo": "No foo" } } }
  }, {
    description: "intermediate syntax with explicit partial",
    template: { "foo#>partial": "Yes foo", "foo^>partial": "No foo" },
    expected: { foo: { "#foo": { ">partial": "Yes foo" }, "^foo": { ">partial": "No foo" } } }
  }, {
    description: "intermediate syntax with different partials",
    template: { "foo#>": "Yes foo", "foo^>partial": "No foo" },
    expected: { foo: { "#foo": { ">foo": "Yes foo" }, "^foo": { ">partial": "No foo" } } }
  }, {
    description: "long syntax with partial",
    template: { "foo>": { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { ">foo": { "#foo": "Yes foo", "^foo": "No foo" } } }
  }, {
    description: "long syntax with explicit partial",
    template: { "foo>partial": { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { ">partial": { "#foo": "Yes foo", "^foo": "No foo" } } }
  }, {
    description: "intermediate syntax with variable and partial",
    template: { "foo#bar>": "Yes bar", "foo^bar>": "No bar" },
    expected: { foo: { "#bar": { ">foo": "Yes bar" }, "^bar": { ">foo": "No bar" } } }
  }, {
    description: "intermediate syntax with variable and explicit partial",
    template: { "foo#bar>partial": "Yes bar", "foo^bar>partial": "No bar" },
    expected: { foo: { "#bar": { ">partial": "Yes bar" }, "^bar": { ">partial": "No bar" } } }
  }, {
    description: "intermediate syntax with variable and different partials",
    template: { "foo#bar>": "Yes bar", "foo^bar>partial": "No bar" },
    expected: { foo: { "#bar": { ">foo": "Yes bar" }, "^bar": { ">partial": "No bar" } } }
  }, {
    description: "long syntax with variable and partial",
    template: { "foo>": { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { ">foo": { "#bar": "Yes bar", "^bar": "No bar" } } }
  }, {
    description: "long syntax with variable and explicit partial",
    template: { "foo>partial": { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { ">partial": { "#bar": "Yes bar", "^bar": "No bar" } } }
  },
  {
    description: "intermediate syntax with nested templates and partials",
    template: {
      "foo#>container": {
        "bar#>container": {
          "fooBar>text": "Foo and bar"
        },
        "bar^>container": {
          "fooNoBar>text": "Foo no bar"
        }
      },
      "foo^>container": {
        "bar#>container": {
          "noFooBar>text": "No foo and bar"
        },
        "bar^>container": {
          "noFooNoBar>text": "No foo and no bar"
        }
      }
    },
    expected: {
      foo: {
        "#foo": {
          ">container": {
            bar: {
              "#bar": {
                ">container": {
                  fooBar: { ">text": "Foo and bar" }
                }
              },
              "^bar": {
                ">container": {
                  fooNoBar: { ">text": "Foo no bar" }
                }
              }
            }
          }
        },
        "^foo": {
          ">container": {
            bar: {
              "#bar": {
                ">container": {
                  noFooBar: { ">text": "No foo and bar" }
                }
              },
              "^bar": {
                ">container": {
                  noFooNoBar: { ">text": "No foo and no bar" }
                }
              }
            }
          }
        }
      }
    }
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function verifyKeyOrder(a, b) {
  if (!types.isObject(a) || !types.isObject(b)) return;
  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);
  aKeys.forEach((key, index) => {
    expect(bKeys[index]).to.equal(key);
    verifyKeyOrder(a[key], b[key]);
  });
}

function runTest(test) {
  if (test.include || test.log) console.log("template", "\n" + JSON.stringify(test.template, null, 2));
  let result = expandTokens.expand(test.template);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
  verifyKeyOrder(result, test.expected);
}

describe("expand-tokens module", function () {
  describe("when expanding tokens", function () {
    getTests().forEach(function (test) {
      describe("when ".concat(test.description), function () {
        let should = test.expected ? "should expand value" : "should not change value";
        it(should, function () {
          runTest(test);
        });
      });
    });
  });

  describe("when expanding invalid compositions", function () {
    function wrapTestRun(test) {
      return function () {
        runTest(test);
      };
    }

    it("should throw error with mix of named and unnamed keys", function () {
      let test = { template: { foo: "Foo", "#bar": "Yes Bar", "^bar": "No Bar" } };
      expect(wrapTestRun(test)).to.throw(Error);
    });
  });
});
