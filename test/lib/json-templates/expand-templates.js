const chai = require("chai");
const expect = chai.expect;

const expandTemplates = require("../../../src/lib/json-templates/expand-templates");

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
    description: "short syntax",
    template: { "foo#": "Yes foo" },
    expected: { foo: { "#foo": "Yes foo", "^foo": null } }
  },
  {
    description: "short syntax with static and dynamic values",
    template: { "foo#": "Yes foo", bar: "Yes bar" },
    expected: { foo: { "#foo": "Yes foo", "^foo": null }, bar: "Yes bar" }
  },
  {
    description: "intermediate syntax",
    template: { "foo#": "Yes foo", "foo^": "No foo" },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" } }
  },
  {
    description: "intermediate syntax with static and dynamic values",
    template: { "foo#": "Yes foo", "foo^": "No foo", bar: "Yes bar" },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" }, bar: "Yes bar" }
  },
  {
    description: "long syntax",
    template: { foo: { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { "#foo": "Yes foo", "^foo": "No foo" } }
  },
  {
    description: "short syntax with variable",
    template: { "foo#bar": "Yes bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": null } }
  },
  {
    description: "short syntax with variable and static value",
    template: { "foo#bar": "Yes bar", bar: "Yes bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": null }, bar: "Yes bar" }
  },
  {
    description: "intermediate syntax with variable",
    template: { "foo#bar": "Yes bar", "foo^bar": "No bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" } }
  },
  {
    description: "intermediate syntax with variable and static value",
    template: { "foo#bar": "Yes bar", "foo^bar": "No bar", bar: "Yes bar" },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" }, bar: "Yes bar" }
  },
  {
    description: "long syntax with variable",
    template: { foo: { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { "#bar": "Yes bar", "^bar": "No bar" } }
  },
  {
    description: "short syntax with partial",
    template: { "foo#>": "Yes foo" },
    expected: { foo: { ">foo": { "#foo": "Yes foo", "^foo": null } } }
  },
  {
    description: "short syntax with explicit partial",
    template: { "foo#>partial": "Yes foo" },
    expected: { foo: { ">partial": { "#foo": "Yes foo", "^foo": null } } }
  },
  {
    description: "intermediate syntax with partial",
    template: { "foo#>": "Yes foo", "foo^>": "No foo" },
    expected: { foo: { ">foo": { "#foo": "Yes foo", "^foo": "No foo" } } }
  },
  {
    description: "intermediate syntax with explicit partial",
    template: { "foo#>partial": "Yes foo", "foo^>partial": "No foo" },
    expected: { foo: { ">partial": { "#foo": "Yes foo", "^foo": "No foo" } } }
  },
  {
    description: "intermediate syntax with different partials",
    template: { "foo#>": "Yes foo", "foo^>partial": "No foo" },
    expected: { foo: { "#foo": { ">foo": "Yes foo" }, "^foo": { ">partial": "No foo" } } }
  },
  {
    description: "long syntax with partial",
    template: { "foo>": { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { ">foo": { "#foo": "Yes foo", "^foo": "No foo" } } }
  },
  {
    description: "long syntax with explicit partial",
    template: { "foo>partial": { "#foo": "Yes foo", "^foo": "No foo" } },
    expected: { foo: { ">partial": { "#foo": "Yes foo", "^foo": "No foo" } } }
  },
  {
    description: "short syntax with variable and partial",
    template: { "foo#bar>": "Yes bar" },
    expected: { foo: { ">foo": { "#bar": "Yes bar", "^bar": null } } }
  },
  {
    description: "short syntax with variable and explicit partial",
    template: { "foo#bar>partial": "Yes bar" },
    expected: { foo: { ">partial": { "#bar": "Yes bar", "^bar": null } } }
  },
  {
    description: "intermediate syntax with variable and partial",
    template: { "foo#bar>": "Yes bar", "foo^bar>": "No bar" },
    expected: { foo: { ">foo": { "#bar": "Yes bar", "^bar": "No bar" } } }
  },
  {
    description: "intermediate syntax with variable and explicit partial",
    template: { "foo#bar>partial": "Yes bar", "foo^bar>partial": "No bar" },
    expected: { foo: { ">partial": { "#bar": "Yes bar", "^bar": "No bar" } } }
  },
  {
    description: "intermediate syntax with variable and different partials",
    template: { "foo#bar>": "Yes bar", "foo^bar>partial": "No bar" },
    expected: { foo: { "#bar": { ">foo": "Yes bar" }, "^bar": { ">partial": "No bar" } } }
  },
  {
    description: "long syntax with variable and partial",
    template: { "foo>": { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { ">foo": { "#bar": "Yes bar", "^bar": "No bar" } } }
  },
  {
    description: "long syntax with variable and explicit partial",
    template: { "foo>partial": { "#bar": "Yes bar", "^bar": "No bar" } },
    expected: { foo: { ">partial": { "#bar": "Yes bar", "^bar": "No bar" } } }
  },
  {
    description: "long syntax partially expressed with variable",
    template: { foo: { "#bar": "Yes bar" } },
    expected: { foo: { "#bar": "Yes bar", "^bar": null } }
  },
  {
    description: "short syntax with nested template",
    template: { "foo#bar": { "#baz": "Yes baz" } },
    expected: { foo: { "#bar": { "#baz": "Yes baz", "^baz": null }, "^bar": null } }
  },
  {
    description: "intermediate syntax with nested template",
    template: { "foo#bar": { "#baz": "Yes baz" }, "foo^bar": { "^baz": "No baz" } },
    expected: { foo: { "#bar": { "#baz": "Yes baz", "^baz": null }, "^bar": { "#baz": null, "^baz": "No baz" } } }
  },
  {
    description: "short syntax with no inverse",
    inferInverse: false,
    template: { "foo#": "Yes foo" },
    expected: { foo: { "#foo": "Yes foo" } }
  },
  {
    description: "long syntax partially expressed with variable and no inverse",
    inferInverse: false,
    template: { foo: { "#bar": "Yes bar" } },
    expected: { foo: { "#bar": "Yes bar" } }
  },
  {
    description: "short syntax with nested template and no inverse",
    inferInverse: false,
    template: { "foo#bar": { "#baz": "Yes baz" } },
    expected: { foo: { "#bar": { "#baz": "Yes baz" } } }
  },
  {
    description: "array with templated values",
    template: { foo: [{ "#baz": "Yes baz" }] },
    expected: { foo: [{ "#baz": "Yes baz", "^baz": null }] }
  },
  {
    description: "intermediate syntax with same token and multiple variables should disable expansion",
    template: { "foo#bar": "Bar", "foo#baz": "Baz", "foo#qux": "Qux" },
    expected: { foo: { "#bar": "Bar", "#baz": "Baz", "#qux": "Qux" } }
  },
  {
    description: "long syntax with same token and multiple variables should disable expansion",
    template: { foo: { "#bar": "Bar", "#baz": "Baz", "#qux": "Qux" } },
    expected: { foo: { "#bar": "Bar", "#baz": "Baz", "#qux": "Qux" } }
  },
  {
    description: "intermediate syntax with different tokens and multiple variables should disable expansion",
    template: { "foo#bar": "Bar", "foo^baz": "Baz" },
    expected: { foo: { "#bar": "Bar", "^baz": "Baz" } }
  },
  {
    description: "long syntax with different tokens and multiple variables should disable expansion",
    template: { foo: { "#bar": "Bar", "^baz": "Baz" } },
    expected: { foo: { "#bar": "Bar", "^baz": "Baz" } }
  }
];

function runTest(test) {
  let result = expandTemplates(test.template, test.inferInverse);
  expect(result).to.deep.equal(test.expected);
}

describe("when expanding templates", function () {
  tests.forEach(function (test) {
    describe("when ".concat(test.description), function () {
      let should = test.expected ? "should expand value" : "should not change value";
      it(should, function () {
        runTest(test);
      });
    });
  });
});
describe("when expanding invalid templates", function () {
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
